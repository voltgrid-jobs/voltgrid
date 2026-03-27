import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import type { JobCategory, JobType, JobSource } from '@/types'

// Simple auth: require a secret header to prevent public triggering
const INGEST_SECRET = process.env.INGEST_SECRET || 'voltgrid-ingest-dev'

interface RawJob {
  source: JobSource
  source_id: string
  title: string
  company_name: string
  location: string
  description: string
  apply_url?: string
  salary_min?: number
  salary_max?: number
  category?: JobCategory
  job_type?: JobType
  remote?: boolean
}

function classifyCategory(title: string, description: string): JobCategory {
  const text = (title + ' ' + description).toLowerCase()
  if (/\b(electrician|electrical|journeyman|master electrician|lineman|power)\b/.test(text)) return 'electrical'
  if (/\b(hvac|heating|cooling|refrigeration|chiller|mechanical|plumb)\b/.test(text)) return 'hvac'
  if (/\b(low.?voltage|fiber|cable|network technician|structured cabling|telecom)\b/.test(text)) return 'low_voltage'
  if (/\b(construction|carpenter|welder|iron|concrete|site supervisor|foreman|laborer)\b/.test(text)) return 'construction'
  if (/\b(project manager|pm|superintendent|program manager|scheduler)\b/.test(text)) return 'project_management'
  if (/\b(operations|facilities|data center technician|dct|infrastructure tech)\b/.test(text)) return 'operations'
  return 'other'
}

async function fetchAdzunaJobs(): Promise<RawJob[]> {
  if (!process.env.ADZUNA_APP_ID || !process.env.ADZUNA_API_KEY) return []

  const keywords = [
    'data center electrician',
    'data center HVAC technician',
    'low voltage data center',
    'hyperscale electrician',
    'critical facilities technician',
    'data center construction',
  ]
  const jobs: RawJob[] = []

  for (const kw of keywords.slice(0, 3)) { // 3 keywords, 20 results each = up to 60
    try {
      const url = `https://api.adzuna.com/v1/api/jobs/us/search/1` +
        `?app_id=${process.env.ADZUNA_APP_ID}` +
        `&app_key=${process.env.ADZUNA_API_KEY}` +
        `&results_per_page=20` +
        `&what=${encodeURIComponent(kw)}`

      const res = await fetch(url, {
        headers: { 'Content-Type': 'application/json' },
      })
      if (!res.ok) {
        console.error('Adzuna error:', res.status, await res.text().catch(() => ''))
        continue
      }
      const data = await res.json()

      for (const job of (data.results || [])) {
        jobs.push({
          source: 'adzuna',
          source_id: job.id,
          title: job.title,
          company_name: job.company?.display_name || 'Unknown',
          location: job.location?.display_name || 'USA',
          description: job.description || '',
          apply_url: job.redirect_url,
          salary_min: job.salary_min ? Math.round(job.salary_min) : undefined,
          salary_max: job.salary_max ? Math.round(job.salary_max) : undefined,
        })
      }
    } catch (e) {
      console.error('Adzuna fetch error:', e)
    }
  }
  return jobs
}

async function fetchUSAJobs(): Promise<RawJob[]> {
  const keywords = ['electrician data center', 'HVAC data center', 'low voltage technician', 'facilities technician data center']
  const jobs: RawJob[] = []

  for (const kw of keywords.slice(0, 2)) {
    try {
      const url = `https://data.usajobs.gov/api/search?Keyword=${encodeURIComponent(kw)}&ResultsPerPage=25`
      const res = await fetch(url, {
        headers: {
          'Host': 'data.usajobs.gov',
          'User-Agent': 'voltgridjobs.com',
          'Authorization-Key': process.env.USAJOBS_API_KEY || '',
        },
      })
      if (!res.ok) continue
      const data = await res.json()

      for (const item of (data.SearchResult?.SearchResultItems || [])) {
        const pos = item.MatchedObjectDescriptor
        jobs.push({
          source: 'usajobs',
          source_id: pos.PositionID,
          title: pos.PositionTitle,
          company_name: pos.OrganizationName,
          location: pos.PositionLocation?.[0]?.LocationName || 'USA',
          description: pos.QualificationSummary || pos.UserArea?.Details?.JobSummary || '',
          apply_url: pos.ApplyURI?.[0],
          salary_min: pos.PositionRemuneration?.[0]?.MinimumRange
            ? Math.round(parseFloat(pos.PositionRemuneration[0].MinimumRange))
            : undefined,
          salary_max: pos.PositionRemuneration?.[0]?.MaximumRange
            ? Math.round(parseFloat(pos.PositionRemuneration[0].MaximumRange))
            : undefined,
        })
      }
    } catch (e) {
      console.error('USAJobs fetch error:', e)
    }
  }
  return jobs
}

async function fetchGreenhouseJobs(): Promise<RawJob[]> {
  // Verified active Greenhouse boards with data center / trades roles (2026-03-27)
  // Note: Iron Mountain, Digital Realty, Equinix, Mortenson, Turner, AECOM, Bechtel
  // do NOT use Greenhouse — replaced with confirmed active boards.
  const companies = [
    'coreweave',    // 263 jobs — Data Center Technicians, Apprentice Program, Facilities Managers
    'edgeconnex',   // ~50 jobs — Critical Systems/MEP Engineers, Electrical/Mechanical Operations
    'aligned',      // ~4 jobs — Data Center ops roles
  ]
  const jobs: RawJob[] = []

  for (const company of companies) {
    try {
      const url = `https://boards-api.greenhouse.io/v1/boards/${company}/jobs?content=true`
      const res = await fetch(url, { signal: AbortSignal.timeout(5000) })
      if (!res.ok) continue
      const data = await res.json()

      for (const job of (data.jobs || []).slice(0, 10)) {
        const title = job.title?.toLowerCase() || ''
        // Filter for trades-relevant roles
        if (!/(electrician|hvac|low.?voltage|mechanical|facilities|construction|trades|technician|data center|critical systems|mep|power engineer|apprentice|operations engineer)/.test(title)) continue

        jobs.push({
          source: 'greenhouse',
          source_id: String(job.id),
          title: job.title,
          company_name: company.charAt(0).toUpperCase() + company.slice(1),
          location: job.location?.name || 'USA',
          description: job.content
            ? job.content.replace(/<[^>]+>/g, ' ').substring(0, 2000)
            : '',
          apply_url: job.absolute_url,
        })
      }
    } catch {
      // Company may not use Greenhouse — silently skip
    }
  }
  return jobs
}

export async function POST(req: NextRequest) {
  const secret = req.headers.get('x-ingest-secret')
  if (secret !== INGEST_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createAdminClient()
  const allJobs: RawJob[] = []

  // Fetch from all sources concurrently
  const [adzunaJobs, usaJobs, greenhouseJobs] = await Promise.all([
    fetchAdzunaJobs(),
    fetchUSAJobs(),
    fetchGreenhouseJobs(),
  ])

  allJobs.push(...adzunaJobs, ...usaJobs, ...greenhouseJobs)

  let inserted = 0
  let skipped = 0

  for (const job of allJobs) {
    if (!job.title || !job.description || !job.company_name) {
      skipped++
      continue
    }

    const category = job.category || classifyCategory(job.title, job.description)

    // Dedup check
    const { data: existing } = await supabase
      .from('jobs')
      .select('id')
      .eq('source', job.source)
      .eq('source_id', job.source_id)
      .single()

    if (existing) {
      skipped++
      continue
    }

    const { error } = await supabase.from('jobs').insert({
      title: job.title,
      company_name: job.company_name,
      category,
      job_type: job.job_type || 'full_time',
      location: job.location,
      remote: job.remote || false,
      salary_min: job.salary_min || null,
      salary_max: job.salary_max || null,
      salary_currency: 'USD',
      description: job.description,
      apply_url: job.apply_url || null,
      source: job.source,
      source_id: job.source_id,
      is_featured: false,
      is_active: true,
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    })

    if (!error) inserted++
    else skipped++
  }

  return NextResponse.json({
    success: true,
    fetched: allJobs.length,
    inserted,
    skipped,
    sources: {
      adzuna: adzunaJobs.length,
      usajobs: usaJobs.length,
      greenhouse: greenhouseJobs.length,
    },
  })
}

// Also allow GET for Vercel Cron
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${INGEST_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  return POST(req)
}
