export const dynamic = 'force-dynamic'

import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { JobCard } from '@/components/jobs/JobCard'
import { AlertSignupWidget } from '@/components/jobs/AlertSignupWidget'
import type { Job, JobCategory } from '@/types'

// ─── Market definitions ────────────────────────────────────────────────────
const MARKETS: Record<string, {
  name: string
  region: string
  blurb: string
  locationPatterns: string[]
  seoBody: string
}> = {
  'northern-virginia': {
    name: 'Northern Virginia',
    region: 'Ashburn, VA',
    blurb: "The world's largest data center market. Loudoun County alone hosts over 35% of global internet traffic.",
    locationPatterns: ['virginia', 'ashburn', 'herndon', 'reston', 'sterling', 'chantilly', 'leesburg', 'nva1'],
    seoBody:
      "Northern Virginia — anchored by the Ashburn 'Data Center Alley' — is adding millions of square feet of capacity every year, fueled by hyperscale demand from AWS, Microsoft, and Google. Licensed electricians, data center HVAC technicians, low-voltage cabling crews, and construction managers are continuously needed across new builds and critical facility operations.",
  },
  phoenix: {
    name: 'Phoenix',
    region: 'Phoenix, AZ',
    blurb: 'Fast-growing hub driven by cheap power, tax incentives, and proximity to California without the costs.',
    locationPatterns: ['phoenix', 'mesa', 'chandler', 'tempe', 'gilbert', 'arizona'],
    seoBody:
      "Phoenix has emerged as one of the fastest-growing data center markets in the US, attracting major campuses from Iron Mountain, CyberNAP, and Switch. Arizona's business-friendly tax structure and abundant land in the East Valley continue to draw new hyperscale projects that need licensed electricians, mechanical HVAC technicians, and construction trades.",
  },
  dallas: {
    name: 'Dallas–Fort Worth',
    region: 'Dallas, TX',
    blurb: 'Second only to NoVA in scale, DFW benefits from abundant land, low taxes, and central US connectivity.',
    locationPatterns: ['dallas', 'fort worth', 'irving', 'richardson', 'allen', 'plano', 'denton', 'texas'],
    seoBody:
      "The Dallas–Fort Worth Metroplex ranks among the top three data center markets in North America, with major facilities from Equinix, CyrusOne, and QTS. Texas's no-state-income-tax environment and strong construction ecosystem make it a top destination for tradespeople.",
  },
  chicago: {
    name: 'Chicago',
    region: 'Chicago, IL',
    blurb: "Major Midwest internet exchange hub and financial data center corridor — home to Equinix's largest US campus.",
    locationPatterns: ['chicago', 'aurora', 'elk grove', 'illinois', 'chi1'],
    seoBody:
      "Chicago sits at the intersection of major fiber routes and is home to the Midwest Internet Exchange. Equinix's CH campus in the Chicago suburbs is one of the largest in the US, and ongoing buildouts in Aurora and Elk Grove Village are generating significant demand for electricians, HVAC technicians, and critical facilities operators.",
  },
  atlanta: {
    name: 'Atlanta',
    region: 'Atlanta, GA',
    blurb: 'Southeast connectivity hub with growing hyperscale presence and strong trades labor market.',
    locationPatterns: ['atlanta', 'georgia', 'lithia springs', 'douglasville', 'covington', 'dalton', 'atl2'],
    seoBody:
      "Atlanta serves as the primary internet exchange point for the Southeast US and is seeing rapid data center expansion in suburban corridors like Lithia Springs and Douglasville. QTS, Compass, and Switch have all established or expanded significant presences in the metro area.",
  },
  portland: {
    name: 'Portland / Hillsboro',
    region: 'Hillsboro, OR',
    blurb: 'Pacific Northwest hub anchored by Google, Intel, and Meta facilities. Low power costs and mild climate.',
    locationPatterns: ['portland', 'hillsboro', 'beaverton', 'oregon'],
    seoBody:
      "Hillsboro and the broader Portland metro have attracted massive hyperscale investments from Google and Meta, drawn by Oregon's low electricity costs and access to renewable hydro power. The mild Pacific Northwest climate reduces cooling loads, making mechanical systems more efficient.",
  },
}

// ─── Trade/category definitions ────────────────────────────────────────────
const TRADES: Record<string, {
  category: JobCategory
  name: string
  shortName: string
  icon: string
  blurb: string
  seoBlurb: string
  metaDescription: string
}> = {
  'electrician-jobs': {
    category: 'electrical',
    name: 'Data Center Electrician Jobs',
    shortName: 'Electrician',
    icon: '⚡',
    blurb: 'Journeymen, master electricians, and apprentices wiring the most power-dense buildings ever constructed.',
    seoBlurb: 'Hyperscale data centers and AI training facilities run on massive electrical infrastructure — each facility can draw 100MW or more. Electricians with data center experience command premium wages, and demand is outpacing supply as construction pipelines extend years ahead.',
    metaDescription: 'Electrician jobs at data centers in Northern Virginia. High-voltage, switchgear, UPS, and generator roles at hyperscale facilities in NoVA. Browse and apply free.',
  },
  'hvac-jobs': {
    category: 'hvac',
    name: 'Data Center HVAC & Mechanical Jobs',
    shortName: 'HVAC',
    icon: '❄️',
    blurb: 'HVAC technicians and mechanical engineers keeping data centers cool under massive thermal loads.',
    seoBlurb: 'Data centers are among the most demanding HVAC environments in existence — precision cooling, chilled water systems, CRAC units, and adiabatic cooling at industrial scale. Mechanical technicians with critical facilities experience are among the most in-demand tradespeople right now.',
    metaDescription: 'HVAC and mechanical jobs at data centers in Northern Virginia. Cooling systems, chilled water, CRAC units, and precision cooling roles at hyperscale facilities in NoVA. Browse and apply free.',
  },
  'low-voltage-jobs': {
    category: 'low_voltage',
    name: 'Low Voltage & Structured Cabling Jobs',
    shortName: 'Low Voltage',
    icon: '📡',
    blurb: 'Fiber, copper, structured cabling, and network infrastructure specialists for data center builds.',
    seoBlurb: 'Every data center requires miles of fiber, copper, and structured cabling — from backbone infrastructure to cross-connects and patch panels. Low voltage technicians with data center experience are in constant demand as new facilities open.',
    metaDescription: 'Low voltage and structured cabling jobs at data centers in Northern Virginia. Fiber, copper, network infrastructure, and telecom roles at colocation and hyperscale facilities in NoVA.',
  },
  'operations-jobs': {
    category: 'operations',
    name: 'Data Center Operations & Facilities Jobs',
    shortName: 'Operations',
    icon: '⚙️',
    blurb: 'Critical facilities technicians, data center operators, and facilities managers keeping the lights on 24/7.',
    seoBlurb: 'Operating a data center is a 24/7 responsibility — critical facilities technicians monitor power, cooling, and network systems around the clock. With AI workloads demanding near-100% uptime, operators are investing heavily in experienced facilities staff.',
    metaDescription: 'Data center operations and facilities management jobs in Northern Virginia. Critical facilities technician, DCT, and facilities manager roles at colocation and hyperscale facilities in NoVA.',
  },
  'construction-jobs': {
    category: 'construction',
    name: 'Data Center Construction Jobs',
    shortName: 'Construction',
    icon: '🏗️',
    blurb: "Ironworkers, concrete finishers, welders, and general construction trades building tomorrow's AI infrastructure.",
    seoBlurb: 'The data center construction boom is creating steady, well-paying work for general construction trades. From tilt-up concrete construction to structural steel, welding, and site prep — data center GCs are hiring and projects run multi-year timelines.',
    metaDescription: 'Construction jobs at data center and AI infrastructure projects in Chicago. Ironworkers, welders, concrete, and structural trades roles at hyperscale construction sites.',
  },
}

// ─── Allowed combinations (high-value pages) ────────────────────────────────
const ALLOWED_TRADES = Object.keys(TRADES)
const ALLOWED_MARKETS = Object.keys(MARKETS)

type Props = {
  params: Promise<{ trade: string; city: string }>
}

export async function generateStaticParams() {
  const combos = [
    // ── Electrician (all 6 markets) ──────────────────────────────────────────
    ['electrician-jobs', 'northern-virginia'],
    ['electrician-jobs', 'phoenix'],
    ['electrician-jobs', 'dallas'],
    ['electrician-jobs', 'chicago'],
    ['electrician-jobs', 'atlanta'],
    ['electrician-jobs', 'portland'],
    // ── HVAC (all 6 markets) ─────────────────────────────────────────────────
    ['hvac-jobs', 'northern-virginia'],
    ['hvac-jobs', 'phoenix'],
    ['hvac-jobs', 'dallas'],
    ['hvac-jobs', 'chicago'],
    ['hvac-jobs', 'atlanta'],
    ['hvac-jobs', 'portland'],
    // ── Low-voltage (4 new markets added 2026-04-06) ──────────────────────────
    ['low-voltage-jobs', 'northern-virginia'],
    ['low-voltage-jobs', 'atlanta'],
    ['low-voltage-jobs', 'phoenix'],
    ['low-voltage-jobs', 'dallas'],
    ['low-voltage-jobs', 'chicago'],
    ['low-voltage-jobs', 'portland'],
    // ── Operations (4 new markets added 2026-04-06) ─────────────────────────
    ['operations-jobs', 'northern-virginia'],
    ['operations-jobs', 'atlanta'],
    ['operations-jobs', 'phoenix'],
    ['operations-jobs', 'dallas'],
    ['operations-jobs', 'chicago'],
    ['operations-jobs', 'portland'],
    // ── Construction (3 new markets added 2026-04-06) ────────────────────────
    ['construction-jobs', 'chicago'],
    ['construction-jobs', 'atlanta'],
    ['construction-jobs', 'dallas'],
    ['construction-jobs', 'northern-virginia'],
    ['construction-jobs', 'phoenix'],
    ['construction-jobs', 'portland'],
  ]
  return combos.map(([trade, city]) => ({ trade, city }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { trade, city } = await params
  const tradeDef = TRADES[trade]
  const marketDef = MARKETS[city]

  if (!tradeDef || !marketDef) return { title: 'Not Found' }

  return {
    title: `${tradeDef.shortName} Jobs in ${marketDef.name} — ${tradeDef.shortName}s at Data Centers | VoltGrid`,
    description: `${tradeDef.shortName} jobs at data centers in ${marketDef.name}. ${marketDef.blurb} Browse and apply free on VoltGrid.`,
  }
}

export default async function TradeCityPage({ params }: Props) {
  const { trade, city } = await params
  const tradeDef = TRADES[trade]
  const marketDef = MARKETS[city]

  if (!tradeDef || !marketDef) notFound()

  let allJobs: Job[] = []
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('jobs')
      .select('*')
      .eq('is_active', true)
      .eq('category', tradeDef.category)
      .limit(200)
    allJobs = data ?? []
  } catch {
    // DB unavailable — render page with 0 jobs
  }

  // Filter by location patterns
  const jobs: Job[] = allJobs.filter((job: Job) => {
    const loc = (job.location ?? '').toLowerCase()
    return marketDef.locationPatterns.some(pattern => loc.includes(pattern))
  })

  if (jobs.length === 0) notFound()

  const pageUrl = `https://voltgridjobs.com/trades/${trade}/${city}`

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://voltgridjobs.com' },
      { '@type': 'ListItem', position: 2, name: 'Trades', item: 'https://voltgridjobs.com/trades' },
      { '@type': 'ListItem', position: 3, name: tradeDef.name, item: `https://voltgridjobs.com/trades/${trade}` },
      { '@type': 'ListItem', position: 4, name: marketDef.name, item: pageUrl },
    ],
  }

  const itemListJsonLd = jobs.length > 0 ? {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `${tradeDef.shortName} Jobs in ${marketDef.name}`,
    url: pageUrl,
    numberOfItems: Math.min(jobs.length, 10),
    itemListElement: jobs.slice(0, 10).map((job, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      url: `https://voltgridjobs.com/jobs/${job.id}`,
      name: job.title,
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
          <ol className="flex items-center gap-2 text-sm text-gray-500">
            <li>
              <Link href="/" className="hover:text-yellow-400 transition-colors">Home</Link>
            </li>
            <li className="text-gray-700">/</li>
            <li>
              <Link href="/trades" className="hover:text-yellow-400 transition-colors">Trades</Link>
            </li>
            <li className="text-gray-700">/</li>
            <li>
              <Link href={`/trades/${trade}`} className="hover:text-yellow-400 transition-colors">
                {tradeDef.shortName}
              </Link>
            </li>
            <li className="text-gray-700">/</li>
            <li className="text-gray-300">{marketDef.name}</li>
          </ol>
        </nav>

        {/* Hero */}
        <section className="border-b border-gray-800 py-12 px-4">
          <div className="max-w-5xl mx-auto">
            <p className="text-yellow-400 text-xs font-semibold uppercase tracking-widest mb-2">
              {marketDef.region}
            </p>
            <div className="flex items-center gap-3 mb-3">
              <span className="text-3xl">{tradeDef.icon}</span>
              <h1 className="text-4xl md:text-5xl font-bold text-white">
                {tradeDef.shortName} Jobs in {marketDef.name}
              </h1>
            </div>
            <p className="text-gray-400 text-lg max-w-2xl mb-3">{marketDef.blurb}</p>
            <p className="text-gray-300 font-medium mb-4">
              {jobs.length > 0
                ? `${jobs.length} ${tradeDef.shortName.toLowerCase()} job${jobs.length === 1 ? '' : 's'} in ${marketDef.name}`
                : `${tradeDef.shortName} jobs in ${marketDef.name}`}
            </p>

            {/* Dual SEO paragraphs */}
            <p className="text-gray-500 text-sm mt-3 max-w-3xl leading-relaxed">
              {marketDef.seoBody}
            </p>
            <p className="text-gray-600 text-sm mt-3 max-w-3xl leading-relaxed">
              {tradeDef.seoBlurb}
            </p>
          </div>
        </section>

        {/* Jobs */}
        <section className="max-w-5xl mx-auto px-4 py-10">
          {jobs.length > 0 ? (
            <div className="space-y-3">
              {jobs.map(job => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-gray-400 text-lg mb-2">
                No {tradeDef.shortName} listings in {marketDef.name} right now — set up a job alert
              </p>
              <p className="text-gray-600 text-sm mb-6">
                We&apos;ll email you as soon as new {tradeDef.shortName.toLowerCase()} jobs in {marketDef.name} are posted.
              </p>
              <div className="max-w-md mx-auto mb-6">
                <AlertSignupWidget keywords="" category={tradeDef.category} />
              </div>
              <Link href="/jobs" className="text-yellow-400 text-sm hover:underline">
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

        {/* Hiring CTA */}
        <section className="border-t border-gray-800 py-12 px-4 text-center">
          <p className="text-gray-400 mb-3">
            Hiring {tradeDef.shortName.toLowerCase()}s in {marketDef.name}?
          </p>
          <Link
            href="/post-job"
            className="inline-block bg-yellow-400 text-gray-950 font-bold px-6 py-3 rounded-xl hover:bg-yellow-300 transition-colors"
          >
            Post a job from $149 →
          </Link>
        </section>

        {/* Cross-links to related pages */}
        <section className="border-t border-gray-800 py-8 px-4">
          <div className="max-w-5xl mx-auto">
            <p className="text-gray-500 text-xs uppercase tracking-widest mb-4">Browse more</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Link href={`/trades/${trade}`} className="text-sm text-gray-400 hover:text-yellow-400 transition-colors">
                ← All {tradeDef.shortName} jobs
              </Link>
              <Link href={`/locations/${city}`} className="text-sm text-gray-400 hover:text-yellow-400 transition-colors">
                ← All jobs in {marketDef.name}
              </Link>
              {Object.keys(MARKETS)
                .filter(m => m !== city)
                .slice(0, 2)
                .map(m => (
                  <Link key={m} href={`/trades/${trade}/${m}`} className="text-sm text-gray-400 hover:text-yellow-400 transition-colors">
                    {tradeDef.shortName} in {MARKETS[m].name} →
                  </Link>
                ))}
            </div>
          </div>
        </section>
      </main>
    </>
  )
}
