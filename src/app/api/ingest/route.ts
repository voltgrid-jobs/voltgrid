import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import type { JobCategory, JobType, JobSource } from '@/types'

// Simple auth: require a secret header to prevent public triggering
const INGEST_SECRET = process.env.INGEST_SECRET

/**
 * Strip HTML from job descriptions before storing in Supabase.
 * Same logic as the render-time sanitizer on the detail page — applied at ingest
 * so the DB holds clean plain text, not raw HTML from Greenhouse/Lever/etc.
 */
function stripHtml(html: string): string {
  if (!html) return ''
  let clean = html
    // Remove dangerous/irrelevant blocks entirely
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<iframe[\s\S]*?<\/iframe>/gi, '')
    .replace(/<object[\s\S]*?<\/object>/gi, '')
    .replace(/<embed[^>]*>/gi, '')
    // Soft hyphens (common in Greenhouse copy-paste artifacts)
    .replace(/\u00ad/g, '')
  // Block-level tags → newline
  clean = clean
    .replace(/<\/(p|div|li|h[1-6]|tr|blockquote|section|article)>/gi, '\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<li[^>]*>/gi, '• ')
    .replace(/<h([1-6])[^>]*>/gi, '\n')
  // Strip all remaining tags
  clean = clean.replace(/<[^>]+>/g, '')
  // Decode HTML entities
  clean = clean
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&ndash;/g, '–')
    .replace(/&mdash;/g, '—')
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(parseInt(code, 10)))
    .replace(/&[a-z]+;/gi, ' ')
  // Collapse excessive whitespace
  clean = clean
    .replace(/[ \t]{2,}/g, ' ')
    .replace(/\n[ \t]+/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
  return clean
}

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
  // Trades fields (parsed from description)
  per_diem?: boolean
  per_diem_rate?: number
  travel_required?: string
  shift_type?: string
  contract_length?: string
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

/**
 * Parse trades-specific fields from job description text using regex heuristics.
 */
function parseTradesFields(description: string): Partial<RawJob> {
  const text = description.toLowerCase()
  const result: Partial<RawJob> = {}

  // Per diem detection
  if (/per\s+diem|daily\s+allowance|\$\d+\/day|\$\d+\s*per\s*day/.test(text)) {
    result.per_diem = true
    // Try to extract rate
    const rateMatch = text.match(/\$(\d+)\s*(?:\/day|per\s*day|daily)/)
    if (rateMatch) {
      result.per_diem_rate = parseInt(rateMatch[1], 10)
    }
  }

  // Travel requirement detection
  if (/must\s+relocate|relocation\s+required/.test(text)) {
    result.travel_required = 'national'
  } else if (/travel\s+up\s+to\s+(?:7[5-9]|[89]\d|100)\s*%|extensive\s+travel|national\s+travel/.test(text)) {
    result.travel_required = 'national'
  } else if (/travel\s+up\s+to\s+(?:[3-6]\d)\s*%|regional\s+travel|multi.?state/.test(text)) {
    result.travel_required = 'regional'
  } else if (/local\s+travel|within\s+(?:the\s+)?(?:metro|city|area)|travel\s+required/.test(text)) {
    result.travel_required = 'local'
  }

  // Shift type detection
  if (/4\s*[x×]\s*10|4-10\s+schedule|four\s+ten|10.hour\s+shift/.test(text)) {
    result.shift_type = '4x10'
  } else if (/5\s*[x×]\s*8|five\s+eight|8.hour\s+shift/.test(text)) {
    result.shift_type = '5x8'
  } else if (/night\s+shift|overnight|graveyard\s+shift|third\s+shift/.test(text)) {
    result.shift_type = 'night'
  } else if (/rotating\s+shift|swing\s+shift|alternating\s+shift|rotation/.test(text)) {
    result.shift_type = 'rotating'
  } else if (/day\s+shift|first\s+shift|daytime/.test(text)) {
    result.shift_type = 'day'
  }

  // Contract length detection
  const contractMatch = text.match(
    /(\d+)[- ]?(month|week|year)[- ]?(?:contract|assignment|project|position)|contract\s+to\s+hire|contract-to-hire/
  )
  if (contractMatch) {
    if (contractMatch[0].includes('contract to hire') || contractMatch[0].includes('contract-to-hire')) {
      result.contract_length = 'Contract to Hire'
    } else {
      const num = contractMatch[1]
      const unit = contractMatch[2]
      result.contract_length = `${num}-${unit} contract`
    }
  }

  return result
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
        const description = stripHtml(job.description || '')
        jobs.push({
          source: 'adzuna',
          source_id: job.id,
          title: job.title,
          company_name: job.company?.display_name || 'Unknown',
          location: job.location?.display_name || 'USA',
          description,
          apply_url: job.redirect_url,
          salary_min: job.salary_min ? Math.round(job.salary_min) : undefined,
          salary_max: job.salary_max ? Math.round(job.salary_max) : undefined,
          ...parseTradesFields(description),
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
        const description = stripHtml(pos.QualificationSummary || pos.UserArea?.Details?.JobSummary || '')
        jobs.push({
          source: 'usajobs',
          source_id: pos.PositionID,
          title: pos.PositionTitle,
          company_name: pos.OrganizationName,
          location: pos.PositionLocation?.[0]?.LocationName || 'USA',
          description,
          apply_url: pos.ApplyURI?.[0],
          salary_min: pos.PositionRemuneration?.[0]?.MinimumRange
            ? Math.round(parseFloat(pos.PositionRemuneration[0].MinimumRange))
            : undefined,
          salary_max: pos.PositionRemuneration?.[0]?.MaximumRange
            ? Math.round(parseFloat(pos.PositionRemuneration[0].MaximumRange))
            : undefined,
          ...parseTradesFields(description),
        })
      }
    } catch (e) {
      console.error('USAJobs fetch error:', e)
    }
  }
  return jobs
}

async function fetchGreenhouseJobs(): Promise<RawJob[]> {
  // Verified active Greenhouse boards for data center / trades roles
  const companies = [
    // Core data center operators
    'coreweave',    // 263 jobs — Data Center Technicians, Apprentice Program, Facilities Managers
    'edgeconnex',   // ~50 jobs — Critical Systems/MEP Engineers, Electrical/Mechanical Operations
    'aligned',      // ~4 jobs — Data Center ops roles
    // NECA member electrical contractors (verified 2026-03-27)
    // Note: All slugs below returned 404 and are excluded:
    // rosendin, acco, myi, bergelectric, harrisonconstruction, criticalprojectsllc,
    // faith-technologies, myriad-supply, amelco, westphal
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

        const description = job.content
          ? stripHtml(job.content).substring(0, 10000)
          : ''
        jobs.push({
          source: 'greenhouse',
          source_id: String(job.id),
          title: job.title,
          company_name: company.charAt(0).toUpperCase() + company.slice(1),
          location: job.location?.name || 'USA',
          description,
          apply_url: job.absolute_url,
          ...parseTradesFields(description),
        })
      }
    } catch {
      // Company may not use Greenhouse — silently skip
    }
  }
  return jobs
}

/**
 * Lever ATS board integration.
 * Verified active boards (2026-03-28): cologix
 */
async function fetchLeverJobs(): Promise<RawJob[]> {
  const companies: { slug: string; name: string }[] = [
    { slug: 'cologix', name: 'Cologix' },
  ]
  const jobs: RawJob[] = []

  for (const { slug, name } of companies) {
    try {
      const url = `https://api.lever.co/v0/postings/${slug}?mode=json`
      const res = await fetch(url, { signal: AbortSignal.timeout(6000) })
      if (!res.ok) continue
      const postings: Array<{
        id: string
        text: string
        categories: { location?: string; team?: string }
        descriptionPlain?: string
        description?: string
        hostedUrl?: string
        applyUrl?: string
        salaryRange?: { min?: number; max?: number; currency?: string }
      }> = await res.json()

      for (const posting of postings) {
        const title = posting.text?.toLowerCase() || ''
        // Filter for trades/data center roles
        if (!/(electrician|hvac|low.?voltage|mechanical|facilities|construction|trades|technician|data center|critical|mep|power|operations|apprentice)/.test(title)) continue

        const description = stripHtml(posting.descriptionPlain || posting.description || '').substring(0, 10000)

        jobs.push({
          source: 'greenhouse', // reuse existing enum value — no separate lever source needed
          source_id: `lever_${posting.id}`,
          title: posting.text,
          company_name: name,
          location: posting.categories?.location || 'USA',
          description,
          apply_url: posting.hostedUrl || posting.applyUrl,
          salary_min: posting.salaryRange?.min ?? undefined,
          salary_max: posting.salaryRange?.max ?? undefined,
          ...parseTradesFields(description),
        })
      }
    } catch (e) {
      console.error(`Lever fetch error (${slug}):`, e)
    }
  }
  return jobs
}

/**
 * DOL Apprenticeship API integration.
 * 
 * Investigation results (confirmed 2026-03-28):
 * - apprenticeship.gov has NO public REST API for job listings
 * - The site is a Drupal 10 application; job finder uses form-based search
 * - RAPIDS system requires federal registration (entbpmp.dol.gov) — not public
 * - Lever/Greenhouse direct boards are the practical alternative for now
 */
async function fetchDOLApprenticeshipJobs(): Promise<RawJob[]> {
  console.log('DOL Apprenticeship: No public API available — skipping')
  return []
}

export async function POST(req: NextRequest) {
  if (!INGEST_SECRET) {
    console.error('INGEST_SECRET is not configured')
    return NextResponse.json({ error: 'Not configured' }, { status: 500 })
  }
  const secret = req.headers.get('x-ingest-secret')
  if (secret !== INGEST_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createAdminClient()
  const allJobs: RawJob[] = []

  // Fetch from all sources concurrently
  const [adzunaJobs, usaJobs, greenhouseJobs, leverJobs, dolJobs] = await Promise.all([
    fetchAdzunaJobs(),
    fetchUSAJobs(),
    fetchGreenhouseJobs(),
    fetchLeverJobs(),
    fetchDOLApprenticeshipJobs(),
  ])

  allJobs.push(...adzunaJobs, ...usaJobs, ...greenhouseJobs, ...leverJobs, ...dolJobs)

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
      // Trades fields (will be ignored if columns don't exist yet — handled gracefully)
      ...(job.per_diem !== undefined && { per_diem: job.per_diem }),
      ...(job.per_diem_rate !== undefined && { per_diem_rate: job.per_diem_rate }),
      ...(job.travel_required && { travel_required: job.travel_required }),
      ...(job.shift_type && { shift_type: job.shift_type }),
      ...(job.contract_length && { contract_length: job.contract_length }),
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
      lever: leverJobs.length,
      dol_apprenticeship: dolJobs.length,
    },
  })
}

// Also allow GET for Vercel Cron
export async function GET(req: NextRequest) {
  if (!INGEST_SECRET) {
    return NextResponse.json({ error: 'Not configured' }, { status: 500 })
  }
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${INGEST_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  return POST(req)
}
