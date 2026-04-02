import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase/admin'
import type { JobCategory } from '@/types'

export const revalidate = 86400 // 24-hour ISR

function slugify(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

// ── Trade definitions (employer-facing) ──────────────────────────────────────

type TradeDef = {
  category: JobCategory
  label: string
  labelPlural: string
}

const TRADE_DEFS: Record<string, TradeDef> = {
  electricians: {
    category: 'electrical',
    label: 'Electrician',
    labelPlural: 'Electricians',
  },
  'hvac-techs': {
    category: 'hvac',
    label: 'HVAC Tech',
    labelPlural: 'HVAC Techs',
  },
  'low-voltage-techs': {
    category: 'low_voltage',
    label: 'Low Voltage Tech',
    labelPlural: 'Low Voltage Techs',
  },
  'construction-trades': {
    category: 'construction',
    label: 'Construction Trades',
    labelPlural: 'Construction Trades',
  },
  'project-managers': {
    category: 'project_management',
    label: 'Project Manager',
    labelPlural: 'Project Managers',
  },
  'operations-techs': {
    category: 'operations',
    label: 'Operations Tech',
    labelPlural: 'Operations Techs',
  },
}

const CATEGORY_TO_TRADE_SLUG: Partial<Record<string, string>> = {
  electrical: 'electricians',
  hvac: 'hvac-techs',
  low_voltage: 'low-voltage-techs',
  construction: 'construction-trades',
  project_management: 'project-managers',
  operations: 'operations-techs',
}

// ── Parse slug ────────────────────────────────────────────────────────────────

function parseSlug(tradeLocationSlug: string): { tradeSlug: string; locationSlug: string } | null {
  const idx = tradeLocationSlug.indexOf('-in-')
  if (idx === -1) return null
  return {
    tradeSlug: tradeLocationSlug.slice(0, idx),
    locationSlug: tradeLocationSlug.slice(idx + '-in-'.length),
  }
}

function locationDisplayName(locationSlug: string): string {
  return locationSlug
    .split('-')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

// ── generateStaticParams ──────────────────────────────────────────────────────

export async function generateStaticParams() {
  try {
    const supabase = createAdminClient()

    const { data: jobs } = await supabase
      .from('jobs')
      .select('category, location')
      .eq('is_active', true)
      .not('location', 'is', null)
      .limit(5000)

    if (!jobs) return []

    const counts = new Map<string, number>()
    for (const job of jobs) {
      if (!job.category || !job.location) continue
      const key = `${job.category}|||${job.location}`
      counts.set(key, (counts.get(key) ?? 0) + 1)
    }

    const topCombos = [...counts.entries()]
      .filter(([, count]) => count >= 2)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 50)

    const seen = new Set<string>()
    const params: { tradeLocationSlug: string }[] = []

    for (const [key] of topCombos) {
      const [category, location] = key.split('|||')
      const tradeSlug = CATEGORY_TO_TRADE_SLUG[category]
      if (!tradeSlug) continue
      const locationSlug = slugify(location)
      const combined = `${tradeSlug}-in-${locationSlug}`
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

  const locationDisplay = locationDisplayName(parsed.locationSlug)

  const title = `Hire ${tradeDef.labelPlural} in ${locationDisplay} | Data Center Jobs — VoltGrid`
  const description = `Post data center ${tradeDef.label.toLowerCase()} jobs in ${locationDisplay} on VoltGrid. Reach qualified trades workers who specialize in data centers and AI infrastructure.`

  return {
    title,
    description,
    alternates: { canonical: `https://voltgridjobs.com/hire/${tradeLocationSlug}` },
    openGraph: { title, description, type: 'website' },
  }
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function HireByTradePage({ params }: Props) {
  const { tradeLocationSlug } = await params
  const parsed = parseSlug(tradeLocationSlug)
  if (!parsed) notFound()

  const tradeDef = TRADE_DEFS[parsed.tradeSlug]
  if (!tradeDef) notFound()

  const locationDisplay = locationDisplayName(parsed.locationSlug)

  // Count active jobs for this trade+location to show in stats block
  let activeJobCount = 0
  try {
    const supabase = createAdminClient()
    const firstWord = parsed.locationSlug.split('-')[0]
    const { count } = await supabase
      .from('jobs')
      .select('id', { count: 'exact', head: true })
      .eq('is_active', true)
      .eq('category', tradeDef.category)
      .ilike('location', `%${firstWord}%`)
    activeJobCount = count ?? 0
  } catch {
    // non-fatal — show 0
  }

  const h1 = `Hire ${tradeDef.labelPlural} in ${locationDisplay} — Data Center & AI Infrastructure`

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
            <Link href="/employers" style={{ color: 'var(--fg-faint)' }} className="hover:text-yellow-400 transition-colors">
              Employers
            </Link>
          </li>
          <li>/</li>
          <li style={{ color: 'var(--fg-muted)' }}>
            Hire {tradeDef.labelPlural} in {locationDisplay}
          </li>
        </ol>
      </nav>

      {/* Hero */}
      <section className="py-12 px-4" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="max-w-5xl mx-auto">
          <h1
            className="mb-4 leading-tight"
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
          <p className="text-base mb-6" style={{ color: 'var(--fg-muted)', lineHeight: 1.6, maxWidth: '640px' }}>
            VoltGrid Jobs connects you with {tradeDef.labelPlural.toLowerCase()} in {locationDisplay} who specialize in
            data center and AI infrastructure. Every candidate on VoltGrid is trades-focused — no generalist noise.
          </p>

          {/* CTA buttons */}
          <div className="flex flex-wrap gap-3">
            <Link
              href="/post-job"
              className="inline-block font-bold px-6 py-3 rounded-xl transition-opacity hover:opacity-90"
              style={{ background: 'var(--yellow)', color: '#0A0A0A' }}
            >
              Post a Job →
            </Link>
            <Link
              href="/employers"
              className="inline-block font-semibold px-6 py-3 rounded-xl transition-colors"
              style={{
                border: '1px solid var(--border)',
                color: 'var(--fg-muted)',
              }}
            >
              See employer plans
            </Link>
          </div>
        </div>
      </section>

      {/* Stats block */}
      <section className="py-10 px-4" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="max-w-5xl mx-auto">
          <div
            className="rounded-xl px-6 py-5"
            style={{ border: '1px solid var(--border)', background: 'var(--surface, #111)' }}
          >
            <p className="text-sm mb-1" style={{ color: 'var(--fg-faint)' }}>
              Active candidates in this market
            </p>
            <p
              className="text-3xl font-bold mb-1"
              style={{ color: 'var(--fg)', fontFamily: 'var(--font-display), system-ui, sans-serif' }}
            >
              {activeJobCount} active {tradeDef.labelPlural.toLowerCase()} job
              {activeJobCount === 1 ? '' : 's'} in {locationDisplay}
            </p>
            <p className="text-sm" style={{ color: 'var(--fg-muted)' }}>
              This is how many {tradeDef.labelPlural.toLowerCase()} are actively looking in this market right now.
              Post your job and get in front of them today.
            </p>
          </div>
        </div>
      </section>

      {/* Why VoltGrid */}
      <section className="py-12 px-4" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="max-w-5xl mx-auto">
          <h2
            className="mb-6"
            style={{
              fontSize: '1.25rem',
              fontWeight: 700,
              color: 'var(--fg)',
              fontFamily: 'var(--font-display), system-ui, sans-serif',
            }}
          >
            Why hire on VoltGrid?
          </h2>
          <ul className="space-y-4" style={{ maxWidth: '560px' }}>
            <li className="flex gap-3">
              <span style={{ color: 'var(--yellow)', flexShrink: 0, marginTop: '2px' }}>—</span>
              <div>
                <p className="font-semibold mb-0.5" style={{ color: 'var(--fg)' }}>
                  Niche audience, zero noise
                </p>
                <p className="text-sm" style={{ color: 'var(--fg-muted)', lineHeight: 1.6 }}>
                  VoltGrid is trades-only. Every person who sees your listing is a qualified{' '}
                  {tradeDef.label.toLowerCase()} — not a generalist applying to everything in sight.
                </p>
              </div>
            </li>
            <li className="flex gap-3">
              <span style={{ color: 'var(--yellow)', flexShrink: 0, marginTop: '2px' }}>—</span>
              <div>
                <p className="font-semibold mb-0.5" style={{ color: 'var(--fg)' }}>
                  Data center &amp; AI infrastructure focus
                </p>
                <p className="text-sm" style={{ color: 'var(--fg-muted)', lineHeight: 1.6 }}>
                  Our audience works specifically in mission-critical facilities. If you&apos;re building or operating
                  a data center in {locationDisplay}, this is where those workers look.
                </p>
              </div>
            </li>
            <li className="flex gap-3">
              <span style={{ color: 'var(--yellow)', flexShrink: 0, marginTop: '2px' }}>—</span>
              <div>
                <p className="font-semibold mb-0.5" style={{ color: 'var(--fg)' }}>
                  Fast time-to-hire
                </p>
                <p className="text-sm" style={{ color: 'var(--fg-muted)', lineHeight: 1.6 }}>
                  Listings go live immediately. Job alerts push to subscribed candidates the same day. No review
                  queues, no waiting.
                </p>
              </div>
            </li>
          </ul>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-14 px-4 text-center">
        <div className="max-w-xl mx-auto">
          <p
            className="text-2xl font-bold mb-3"
            style={{
              color: 'var(--fg)',
              fontFamily: 'var(--font-display), system-ui, sans-serif',
            }}
          >
            Ready to hire {tradeDef.labelPlural.toLowerCase()} in {locationDisplay}?
          </p>
          <p className="text-sm mb-6" style={{ color: 'var(--fg-muted)' }}>
            Post a listing from $149 and reach qualified trades workers today.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/post-job"
              className="inline-block font-bold px-8 py-3 rounded-xl transition-opacity hover:opacity-90"
              style={{ background: 'var(--yellow)', color: '#0A0A0A' }}
            >
              Post a Job from $149 →
            </Link>
            <Link
              href="/employers"
              className="inline-block font-semibold px-6 py-3 rounded-xl transition-colors"
              style={{
                border: '1px solid var(--border)',
                color: 'var(--fg-muted)',
              }}
            >
              See full employer plans
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
