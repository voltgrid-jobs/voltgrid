import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { JobCard } from '@/components/jobs/JobCard'
import { AlertSignupWidget } from '@/components/jobs/AlertSignupWidget'
import type { Job, JobCategory } from '@/types'

export const revalidate = 86400 // 24-hour ISR

function slugify(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

// ── Trade definitions ────────────────────────────────────────────────────────

type TradeDef = {
  category: JobCategory
  label: string
  labelPlural: string
  icon: string
  blurb: string
}

const TRADE_DEFS: Record<string, TradeDef> = {
  'electrical': {
    category: 'electrical',
    label: 'Electrician',
    labelPlural: 'Electricians',
    icon: '⚡',
    blurb: 'Journeymen, master electricians, and apprentices wiring data centers and AI infrastructure.',
  },
  'hvac': {
    category: 'hvac',
    label: 'HVAC Tech',
    labelPlural: 'HVAC Techs',
    icon: '❄️',
    blurb: 'HVAC technicians and mechanical engineers keeping data centers cool at scale.',
  },
  'low-voltage': {
    category: 'low_voltage',
    label: 'Low Voltage Tech',
    labelPlural: 'Low Voltage Techs',
    icon: '📡',
    blurb: 'Fiber, structured cabling, and network infrastructure specialists at data center facilities.',
  },
  'construction': {
    category: 'construction',
    label: 'Construction Worker',
    labelPlural: 'Construction Trades',
    icon: '🏗️',
    blurb: 'General construction trades building data centers and AI infrastructure from the ground up.',
  },
  'project-management': {
    category: 'project_management',
    label: 'Project Manager',
    labelPlural: 'Project Managers',
    icon: '📋',
    blurb: 'PMs, superintendents, and program managers running data center construction and fit-out.',
  },
  'operations': {
    category: 'operations',
    label: 'Operations Tech',
    labelPlural: 'Operations Techs',
    icon: '⚙️',
    blurb: 'Critical facilities technicians and data center operators keeping facilities running 24/7.',
  },
}

const CATEGORY_TO_TRADE_SLUG: Partial<Record<string, string>> = {
  electrical: 'electrical',
  hvac: 'hvac',
  low_voltage: 'low-voltage',
  construction: 'construction',
  project_management: 'project-management',
  operations: 'operations',
}

// ── Parse slug ────────────────────────────────────────────────────────────────

function parseSlug(tradeLocationSlug: string): { tradeSlug: string; locationSlug: string } | null {
  const idx = tradeLocationSlug.indexOf('-jobs-in-')
  if (idx === -1) return null
  return {
    tradeSlug: tradeLocationSlug.slice(0, idx),
    locationSlug: tradeLocationSlug.slice(idx + '-jobs-in-'.length),
  }
}

// ── generateStaticParams ──────────────────────────────────────────────────────

export async function generateStaticParams() {
  const supabase = createAdminClient()

  try {
    const { data: jobs } = await supabase
      .from('jobs')
      .select('category, location')
      .eq('is_active', true)
      .not('location', 'is', null)
      .limit(5000)

    if (!jobs) return []

    // Count active jobs per category+location combo
    const counts = new Map<string, number>()
    for (const job of jobs) {
      if (!job.category || !job.location) continue
      const key = `${job.category}|||${job.location}`
      counts.set(key, (counts.get(key) ?? 0) + 1)
    }

    // Top 60 combos with at least 2 jobs
    const topCombos = [...counts.entries()]
      .filter(([, count]) => count >= 2)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 60)

    const seen = new Set<string>()
    const params: { tradeLocationSlug: string }[] = []

    for (const [key] of topCombos) {
      const [category, location] = key.split('|||')
      const tradeSlug = CATEGORY_TO_TRADE_SLUG[category]
      if (!tradeSlug) continue
      const locationSlug = slugify(location)
      const combined = `${tradeSlug}-jobs-in-${locationSlug}`
      if (seen.has(combined)) continue
      seen.add(combined)
      params.push({ tradeLocationSlug: combined })
    }

    return params
  } catch {
    return []
  }
}

// ── Metadata ──────────────────────────────────────────────────────────────────

type Props = { params: Promise<{ tradeLocationSlug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tradeLocationSlug } = await params
  const parsed = parseSlug(tradeLocationSlug)
  if (!parsed) return { title: 'Not Found' }

  const tradeDef = TRADE_DEFS[parsed.tradeSlug]
  if (!tradeDef) return { title: 'Not Found' }

  const locationDisplay = parsed.locationSlug
    .split('-')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')

  const title = `Data Center ${tradeDef.labelPlural} in ${locationDisplay} — VoltGrid Jobs`
  const description = `Find data center and AI infrastructure ${tradeDef.label.toLowerCase()} jobs in ${locationDisplay}. Browse open positions, apply directly, and set up alerts for new listings.`

  return {
    title,
    description,
    alternates: { canonical: `https://voltgridjobs.com/${tradeLocationSlug}` },
    openGraph: { title, description, type: 'website' },
  }
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function TradeLocationPage({ params }: Props) {
  const { tradeLocationSlug } = await params
  const parsed = parseSlug(tradeLocationSlug)
  if (!parsed) notFound()

  const tradeDef = TRADE_DEFS[parsed.tradeSlug]
  if (!tradeDef) notFound()

  const supabase = await createClient()

  // Resolve canonical location name from locations table (populated by migration)
  let locationName: string | null = null
  let locationDisplay: string = parsed.locationSlug
    .split('-')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')

  try {
    const { data: locRow } = await supabase
      .from('locations')
      .select('name, display_name')
      .eq('slug', parsed.locationSlug)
      .maybeSingle()
    if (locRow) {
      locationName = (locRow as { name: string; display_name: string }).name
      locationDisplay = (locRow as { name: string; display_name: string }).display_name
    }
  } catch {
    // locations table may not exist yet — fall through to text match
  }

  // Fetch jobs: exact location match if we have the canonical name, otherwise approximate
  let jobsData: Job[] | null = null
  if (locationName) {
    const { data } = await supabase
      .from('jobs')
      .select('*')
      .eq('is_active', true)
      .eq('category', tradeDef.category)
      .eq('location', locationName)
      .order('is_featured', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(50)
    jobsData = data
  } else {
    // Fallback: match on any word in location slug
    const firstWord = parsed.locationSlug.split('-')[0]
    const { data } = await supabase
      .from('jobs')
      .select('*')
      .eq('is_active', true)
      .eq('category', tradeDef.category)
      .ilike('location', `%${firstWord}%`)
      .order('is_featured', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(50)
    jobsData = data
  }

  const jobs: Job[] = jobsData ?? []

  // If no jobs and we're not a statically generated page (params not in generateStaticParams),
  // return 404 to avoid thin content pages
  if (jobs.length === 0 && !locationName) notFound()

  const h1 = `Data Center ${tradeDef.labelPlural} in ${locationDisplay}`
  const intro = `${locationDisplay} is one of the most active data center markets in the US. Browse open ${tradeDef.label.toLowerCase()} positions at hyperscale operators, colocation facilities, and AI infrastructure sites in the area.`

  return (
    <main className="min-h-screen">
      {/* Breadcrumb */}
      <nav className="max-w-5xl mx-auto px-4 pt-6 pb-2">
        <ol className="flex items-center gap-2 text-sm" style={{ color: 'var(--fg-faint)' }}>
          <li><Link href="/" style={{ color: 'var(--fg-faint)' }} className="hover:text-yellow-400 transition-colors">Home</Link></li>
          <li>/</li>
          <li><Link href="/jobs" style={{ color: 'var(--fg-faint)' }} className="hover:text-yellow-400 transition-colors">Jobs</Link></li>
          <li>/</li>
          <li style={{ color: 'var(--fg-muted)' }}>{tradeDef.labelPlural} in {locationDisplay}</li>
        </ol>
      </nav>

      {/* Hero */}
      <section className="py-12 px-4" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="max-w-5xl mx-auto">
          <p className="text-3xl mb-3">{tradeDef.icon}</p>
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
            {jobs.length > 0
              ? `${jobs.length} job${jobs.length === 1 ? '' : 's'} currently active`
              : 'New jobs posted regularly — set up an alert below'}
          </p>
          <p className="text-sm mt-4" style={{ color: 'var(--fg-faint)', maxWidth: '600px', lineHeight: 1.6 }}>
            {tradeDef.blurb} Data centers and AI infrastructure projects are expanding across {locationDisplay} — positions range from construction to ongoing facilities operations.
          </p>
        </div>
      </section>

      {/* Jobs list */}
      <section className="max-w-5xl mx-auto px-4 py-10">
        {jobs.length > 0 ? (
          <div className="space-y-3">
            {jobs.map(job => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-lg mb-2" style={{ color: 'var(--fg-muted)' }}>
              No listings right now — set up a job alert
            </p>
            <p className="text-sm mb-6" style={{ color: 'var(--fg-faint)' }}>
              We&apos;ll notify you as soon as new {tradeDef.label.toLowerCase()} jobs are posted in {locationDisplay}.
            </p>
            <div className="max-w-md mx-auto mb-6">
              <AlertSignupWidget keywords="" category={tradeDef.category} />
            </div>
            <Link href="/jobs" className="text-sm hover:underline" style={{ color: 'var(--yellow)' }}>
              Browse all open positions →
            </Link>
          </div>
        )}
      </section>

      {/* Alert widget */}
      {jobs.length > 0 && (
        <section className="max-w-5xl mx-auto px-4 pb-10">
          <div className="max-w-md">
            <AlertSignupWidget keywords="" category={tradeDef.category} />
          </div>
        </section>
      )}

      {/* Employer CTA */}
      <section className="py-12 px-4 text-center" style={{ borderTop: '1px solid var(--border)' }}>
        <p className="mb-3 text-sm" style={{ color: 'var(--fg-muted)' }}>
          Hiring {tradeDef.labelPlural.toLowerCase()} in {locationDisplay}?
        </p>
        <Link
          href="/post-job"
          className="inline-block font-bold px-6 py-3 rounded-xl transition-colors"
          style={{ background: 'var(--yellow)', color: '#0A0A0A' }}
        >
          Post a job from $149 →
        </Link>
      </section>
    </main>
  )
}
