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

// ── Location market context (unique copy per major market) ───────────────────

type LocationCtx = {
  context: string
  employers: string
}

const LOCATION_CONTEXT: Record<string, LocationCtx> = {
  'northern-virginia': {
    context:
      'Northern Virginia is the largest data center market in the world, carrying the majority of US internet traffic. The Ashburn corridor has over 100 facilities and billions in capacity under active construction, with every major hyperscale operator maintaining a presence.',
    employers: 'Equinix, Digital Realty, QTS, Cologix, and Iron Mountain',
  },
  'phoenix': {
    context:
      'The Phoenix metro is one of the fastest-growing data center markets in the US, driven by low-cost power, water-efficient cooling options, and hyperscale commitments from Microsoft, Google, and Meta. Chandler, Mesa, and Goodyear are the most active build corridors.',
    employers: 'CyrusOne, Aligned Data Centers, QTS, Microsoft, and Meta',
  },
  'dallas': {
    context:
      'The Dallas–Fort Worth metro is a top-five data center market nationally, anchored by Allen, Garland, and Richardson. Major colocation operators and hyperscalers have built significant capacity here, and the construction pipeline remains one of the heaviest in the country.',
    employers: 'CyrusOne, Equinix, T5 Data Centers, and Aligned',
  },
  'atlanta': {
    context:
      'Atlanta is the Southeast\'s dominant data center hub, with major growth in Lithia Springs and the metro periphery. The combination of lower land costs, available power, and the region\'s financial and media industry demand has fueled consistent capacity expansion.',
    employers: 'QTS, Equinix, Digital Realty, and Compass Datacenters',
  },
  'chicago': {
    context:
      'Chicago is one of the top Midwest data center markets, anchored by the suburb of Elk Grove Village — one of the highest-density data center clusters in North America. The city\'s network infrastructure and financial industry make it a perennial build target for operators.',
    employers: 'Equinix, Digital Realty, CyrusOne, and vXchnge',
  },
  'portland': {
    context:
      'The Portland metro, particularly Hillsboro, has become a major hyperscale destination thanks to inexpensive hydroelectric power and a mild climate that reduces cooling costs. Intel, Google, and Amazon have made significant infrastructure investments in the region.',
    employers: 'Google, Amazon Web Services, EdgeConneX, and Pittock Data',
  },
  'sacramento': {
    context:
      'Sacramento has emerged as a spillover market from the Bay Area, offering power access and lower costs for operators priced out of Silicon Valley. It serves as a disaster-recovery and secondary site for Bay Area enterprises.',
    employers: 'Sutter Health, SMUD, and several hyperscale campuses under development',
  },
  'reno': {
    context:
      'Reno is a growing data center market anchored by the Switch campus — one of the largest data center facilities in the world. The city offers low-cost power from Nevada Energy and favorable state tax policies.',
    employers: 'Switch, Nautilus Data Technologies, and Apple',
  },
}

function buildLocationIntro(tradeDef: TradeDef, locationSlug: string, locationDisplay: string): string {
  const ctx = LOCATION_CONTEXT[locationSlug]
  if (ctx) {
    return `${ctx.context} Browse open ${tradeDef.label.toLowerCase()} positions at ${ctx.employers} and other employers active in the region.`
  }
  return `${locationDisplay} has active data center construction and operations work supporting the AI infrastructure buildout. Browse open ${tradeDef.label.toLowerCase()} positions at hyperscale operators, colocation facilities, and AI infrastructure sites in the area.`
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
  try {
    const supabase = createAdminClient()

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
  // return 404 to avoid thin content pages — but always render known markets even with 0 jobs
  const isKnownMarket = parsed.locationSlug in LOCATION_CONTEXT
  if (jobs.length === 0 && !locationName && !isKnownMarket) notFound()

  const h1 = `Data Center ${tradeDef.labelPlural} in ${locationDisplay}`
  const intro = buildLocationIntro(tradeDef, parsed.locationSlug, locationDisplay)

  // ── Structured data ───────────────────────────────────────────────────────
  const pageUrl = `https://voltgridjobs.com/${tradeLocationSlug}`

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://voltgridjobs.com' },
      { '@type': 'ListItem', position: 2, name: 'Jobs', item: 'https://voltgridjobs.com/jobs' },
      { '@type': 'ListItem', position: 3, name: h1, item: pageUrl },
    ],
  }

  const itemListJsonLd = jobs.length > 0 ? {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: h1,
    url: pageUrl,
    numberOfItems: jobs.length,
    itemListElement: jobs.slice(0, 10).map((job, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: `https://voltgridjobs.com/jobs/${job.id}`,
      name: `${job.title} at ${job.company_name}`,
    })),
  } : null

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      {itemListJsonLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }} />
      )}
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
    </>
  )
}
