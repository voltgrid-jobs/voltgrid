import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { createAdminClient } from '@/lib/supabase/admin'
import { JobCard } from '@/components/jobs/JobCard'
import { AlertSignupWidget } from '@/components/jobs/AlertSignupWidget'
import type { Job } from '@/types'

export const revalidate = 86400 // 24-hour ISR

const LOGO_TOKEN = 'pk_X7y3MfqiR9OO1DKLA3BNNA'

function slugify(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

// ── generateStaticParams ──────────────────────────────────────────────────────

export async function generateStaticParams() {
  const supabase = createAdminClient()

  // Try companies table first
  try {
    const { data: companies, error } = await supabase
      .from('companies')
      .select('slug, id')

    if (!error && companies && companies.length > 0) {
      // Filter to companies with at least 3 active jobs
      const results: { companySlug: string }[] = []
      for (const company of companies) {
        const { count } = await supabase
          .from('jobs')
          .select('id', { count: 'exact', head: true })
          .eq('is_active', true)
          .eq('company_id', (company as { id: string; slug: string }).id)
        if ((count ?? 0) >= 3) {
          results.push({ companySlug: (company as { id: string; slug: string }).slug })
        }
      }
      if (results.length > 0) return results
    }
  } catch {
    // companies table may not exist yet — fall through
  }

  // Fallback: derive from jobs table directly
  try {
    const { data: jobs } = await supabase
      .from('jobs')
      .select('company_name')
      .eq('is_active', true)
      .not('company_name', 'is', null)
      .limit(5000)

    if (!jobs) return []

    const counts = new Map<string, number>()
    for (const job of jobs) {
      if (!job.company_name) continue
      counts.set(job.company_name, (counts.get(job.company_name) ?? 0) + 1)
    }

    return [...counts.entries()]
      .filter(([, count]) => count >= 3)
      .map(([name]) => ({ companySlug: slugify(name) }))
  } catch {
    return []
  }
}

// ── Metadata ──────────────────────────────────────────────────────────────────

type Props = { params: Promise<{ companySlug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { companySlug } = await params
  const supabase = createAdminClient()

  let companyName: string | null = null
  let jobCount = 0

  try {
    const { data: company } = await supabase
      .from('companies')
      .select('name')
      .eq('slug', companySlug)
      .maybeSingle()
    if (company) {
      companyName = (company as { name: string }).name
    }
  } catch {
    // companies table may not exist
  }

  if (!companyName) {
    // Derive from jobs
    const { data: jobs } = await supabase
      .from('jobs')
      .select('company_name')
      .eq('is_active', true)
      .limit(5000)

    const match = (jobs ?? []).find(
      j => j.company_name && slugify(j.company_name) === companySlug
    )
    if (match) companyName = match.company_name
  }

  if (!companyName) return { title: 'Not Found' }

  const { count } = await supabase
    .from('jobs')
    .select('id', { count: 'exact', head: true })
    .eq('is_active', true)
    .ilike('company_name', companyName)
  jobCount = count ?? 0

  const title = `${companyName} Jobs — Data Center & AI Infrastructure — VoltGrid`
  const description = `Browse ${companyName} open positions at data centers and AI infrastructure sites. ${jobCount} active job${jobCount === 1 ? '' : 's'}.`

  return {
    title,
    description,
    alternates: { canonical: `https://voltgridjobs.com/companies/${companySlug}` },
    openGraph: { title, description, type: 'website' },
  }
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function CompanyPage({ params }: Props) {
  const { companySlug } = await params
  const supabase = createAdminClient()

  // 1. Look up company from companies table
  let companyName: string | null = null
  let companyWebsite: string | null = null
  let companyId: string | null = null

  try {
    const { data: company } = await supabase
      .from('companies')
      .select('id, name, website')
      .eq('slug', companySlug)
      .maybeSingle()

    if (company) {
      const c = company as { id: string; name: string; website?: string }
      companyId = c.id
      companyName = c.name
      companyWebsite = c.website ?? null
    }
  } catch {
    // companies table may not exist
  }

  // Fallback: find via jobs
  if (!companyName) {
    const { data: jobs } = await supabase
      .from('jobs')
      .select('company_name')
      .eq('is_active', true)
      .limit(5000)

    const match = (jobs ?? []).find(
      j => j.company_name && slugify(j.company_name) === companySlug
    )
    if (match) companyName = match.company_name
  }

  // 2. Fetch active jobs for this company
  let jobsData: Job[] | null = null

  if (companyId && companyName) {
    const { data } = await supabase
      .from('jobs')
      .select('*')
      .eq('is_active', true)
      .or(`company_id.eq.${companyId},company_name.ilike.${companyName}`)
      .order('is_featured', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(50)
    jobsData = data
  } else if (companyName) {
    const { data } = await supabase
      .from('jobs')
      .select('*')
      .eq('is_active', true)
      .ilike('company_name', companyName)
      .order('is_featured', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(50)
    jobsData = data
  }

  const jobs: Job[] = jobsData ?? []

  // 3. If no company and no jobs found — 404
  if (!companyName || jobs.length === 0) notFound()

  // Logo URL
  let logoUrl: string | null = null
  if (companyWebsite) {
    try {
      const domain = new URL(
        companyWebsite.startsWith('http') ? companyWebsite : `https://${companyWebsite}`
      ).hostname
      logoUrl = `https://img.logo.dev/${domain}?token=${LOGO_TOKEN}`
    } catch {
      // Invalid URL — skip logo
    }
  }

  const h1 = `${companyName} Data Center Jobs`
  const intro = `${companyName} is actively hiring for data center and AI infrastructure roles. Browse their open positions below.`

  return (
    <main className="min-h-screen">
      {/* Breadcrumb */}
      <nav className="max-w-5xl mx-auto px-4 pt-6 pb-2">
        <ol className="flex items-center gap-2 text-sm" style={{ color: 'var(--fg-faint)' }}>
          <li>
            <Link href="/" style={{ color: 'var(--fg-faint)' }} className="hover:text-yellow-400 transition-colors">
              Home
            </Link>
          </li>
          <li>/</li>
          <li>
            <Link href="/jobs" style={{ color: 'var(--fg-faint)' }} className="hover:text-yellow-400 transition-colors">
              Companies
            </Link>
          </li>
          <li>/</li>
          <li style={{ color: 'var(--fg-muted)' }}>{companyName}</li>
        </ol>
      </nav>

      {/* Hero */}
      <section className="py-12 px-4" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="max-w-5xl mx-auto">
          {/* Logo */}
          {logoUrl && (
            <div className="mb-4">
              <Image
                src={logoUrl}
                alt={`${companyName} logo`}
                width={64}
                height={64}
                className="rounded-xl object-contain"
                style={{ background: 'var(--bg-raised)', padding: '8px' }}
                unoptimized
              />
            </div>
          )}

          <h1
            className="mb-3 leading-tight"
            style={{
              fontFamily: 'var(--font-display), system-ui, sans-serif',
              fontSize: 'clamp(1.75rem, 5vw, 2.75rem)',
              fontWeight: 800,
              color: 'var(--fg)',
              letterSpacing: '-0.01em',
            }}
          >
            {h1}
          </h1>

          <p className="text-base mb-2" style={{ color: 'var(--fg-muted)', lineHeight: 1.6, maxWidth: '640px' }}>
            {intro}
          </p>

          <p className="text-sm font-medium" style={{ color: 'var(--fg-faint)' }}>
            {jobs.length} active job{jobs.length === 1 ? '' : 's'}
          </p>
        </div>
      </section>

      {/* Jobs list */}
      <section className="max-w-5xl mx-auto px-4 py-10">
        <div className="space-y-3">
          {jobs.map(job => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      </section>

      {/* Alert widget */}
      <section className="max-w-5xl mx-auto px-4 pb-10">
        <div className="max-w-md">
          <AlertSignupWidget keywords="" />
        </div>
      </section>

      {/* Employer CTA */}
      <section className="py-12 px-4 text-center" style={{ borderTop: '1px solid var(--border)' }}>
        <p className="mb-3 text-sm" style={{ color: 'var(--fg-muted)' }}>
          Are you {companyName}? Claim your listing
        </p>
        <Link
          href="/employers"
          className="inline-block font-bold px-6 py-3 rounded-xl transition-colors"
          style={{ background: 'var(--yellow)', color: '#0A0A0A' }}
        >
          Claim your listing →
        </Link>
      </section>
    </main>
  )
}
