import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { JobCard } from '@/components/jobs/JobCard'
import { AlertSignupWidget } from '@/components/jobs/AlertSignupWidget'
import type { Job, JobCategory } from '@/types'

export const revalidate = 86400 // 24-hour ISR

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
    blurb: 'Remote electrical roles at data centers and AI infrastructure companies — design review, project coordination, and engineering support from anywhere.',
  },
  'hvac': {
    category: 'hvac',
    label: 'HVAC Tech',
    labelPlural: 'HVAC Techs',
    icon: '❄️',
    blurb: 'Remote HVAC and mechanical engineering roles supporting data center cooling design, commissioning oversight, and facilities management.',
  },
  'low-voltage': {
    category: 'low_voltage',
    label: 'Low Voltage Tech',
    labelPlural: 'Low Voltage Techs',
    icon: '📡',
    blurb: 'Remote low voltage and network infrastructure roles — design, project management, and technical support for data center cabling and connectivity.',
  },
  'construction': {
    category: 'construction',
    label: 'Construction Worker',
    labelPlural: 'Construction Trades',
    icon: '🏗️',
    blurb: 'Remote construction and project coordination roles supporting data center build-outs — estimating, scheduling, and owner\'s rep positions.',
  },
  'project-management': {
    category: 'project_management',
    label: 'Project Manager',
    labelPlural: 'Project Managers',
    icon: '📋',
    blurb: 'Remote project and program management roles at data center operators, hyperscalers, and AI infrastructure companies.',
  },
  'operations': {
    category: 'operations',
    label: 'Operations Tech',
    labelPlural: 'Operations Techs',
    icon: '⚙️',
    blurb: 'Remote operations and facilities management roles — monitoring, vendor coordination, and technical support for critical data center infrastructure.',
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

function parseTradeRemoteSlug(tradeRemoteSlug: string): string | null {
  const suffix = '-remote-jobs'
  if (!tradeRemoteSlug.endsWith(suffix)) return null
  return tradeRemoteSlug.slice(0, -suffix.length)
}

// ── generateStaticParams ──────────────────────────────────────────────────────

export async function generateStaticParams() {
  const supabase = createAdminClient()

  try {
    const { data: jobs } = await supabase
      .from('jobs')
      .select('category')
      .eq('is_active', true)
      .eq('remote', true)

    if (!jobs) return []

    const counts = new Map<string, number>()
    for (const job of jobs) {
      if (!job.category) continue
      counts.set(job.category, (counts.get(job.category) ?? 0) + 1)
    }

    const params: { tradeRemoteSlug: string }[] = []
    for (const [category, count] of counts.entries()) {
      if (count < 5) continue
      const tradeSlug = CATEGORY_TO_TRADE_SLUG[category]
      if (!tradeSlug) continue
      params.push({ tradeRemoteSlug: `${tradeSlug}-remote-jobs` })
    }

    return params
  } catch {
    return []
  }
}

// ── Metadata ──────────────────────────────────────────────────────────────────

type Props = { params: Promise<{ tradeRemoteSlug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tradeRemoteSlug } = await params
  const tradeSlug = parseTradeRemoteSlug(tradeRemoteSlug)
  if (!tradeSlug) return { title: 'Not Found' }

  const tradeDef = TRADE_DEFS[tradeSlug]
  if (!tradeDef) return { title: 'Not Found' }

  const title = `Remote ${tradeDef.labelPlural} Jobs at Data Centers — VoltGrid Jobs`
  const description = `Find remote ${tradeDef.label.toLowerCase()} jobs at data centers and AI infrastructure companies. Browse open positions, apply directly, and set up alerts for new remote listings.`

  return {
    title,
    description,
    alternates: { canonical: `https://voltgridjobs.com/remote/${tradeRemoteSlug}` },
    openGraph: { title, description, type: 'website' },
  }
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function TradeRemotePage({ params }: Props) {
  const { tradeRemoteSlug } = await params
  const tradeSlug = parseTradeRemoteSlug(tradeRemoteSlug)
  if (!tradeSlug) notFound()

  const tradeDef = TRADE_DEFS[tradeSlug]
  if (!tradeDef) notFound()

  const supabase = await createClient()

  const { data: jobsData } = await supabase
    .from('jobs')
    .select('*')
    .eq('is_active', true)
    .eq('remote', true)
    .eq('category', tradeDef.category)
    .order('is_featured', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(50)

  const jobs: Job[] = jobsData ?? []

  const h1 = `Remote ${tradeDef.labelPlural} Jobs — Data Centers & AI Infrastructure`
  const intro = `Remote ${tradeDef.label.toLowerCase()} opportunities at hyperscale operators, colocation providers, and AI infrastructure companies. These roles offer flexibility to work from anywhere while supporting some of the most critical infrastructure being built today.`

  return (
    <main className="min-h-screen">
      {/* Breadcrumb */}
      <nav className="max-w-5xl mx-auto px-4 pt-6 pb-2">
        <ol className="flex items-center gap-2 text-sm" style={{ color: 'var(--fg-faint)' }}>
          <li><Link href="/" style={{ color: 'var(--fg-faint)' }} className="hover:text-yellow-400 transition-colors">Home</Link></li>
          <li>/</li>
          <li><Link href="/jobs" style={{ color: 'var(--fg-faint)' }} className="hover:text-yellow-400 transition-colors">Jobs</Link></li>
          <li>/</li>
          <li style={{ color: 'var(--fg-muted)' }}>Remote {tradeDef.labelPlural}</li>
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
              ? `${jobs.length} remote job${jobs.length === 1 ? '' : 's'} currently active`
              : 'New remote jobs posted regularly — set up an alert below'}
          </p>
          <p className="text-sm mt-4" style={{ color: 'var(--fg-faint)', maxWidth: '600px', lineHeight: 1.6 }}>
            {tradeDef.blurb}
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
              No remote listings right now — set up a job alert
            </p>
            <p className="text-sm mb-6" style={{ color: 'var(--fg-faint)' }}>
              We&apos;ll notify you as soon as new remote {tradeDef.label.toLowerCase()} jobs are posted.
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
          Hiring remote {tradeDef.labelPlural.toLowerCase()}?
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
