export const dynamic = 'force-dynamic'

import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { JobCard } from '@/components/jobs/JobCard'
import { AlertSignupWidget } from '@/components/jobs/AlertSignupWidget'
import type { Job } from '@/types'

const HUBS = [
  {
    slug: 'northern-virginia',
    name: 'Northern Virginia',
    region: 'Ashburn, VA',
    blurb:
      "The world's largest data center market. Loudoun County alone hosts over 35% of global internet traffic.",
    locationPatterns: ['virginia', 'ashburn', 'herndon', 'reston', 'sterling', 'chantilly', 'leesburg'],
    seoBody:
      'Northern Virginia — anchored by the Ashburn "Data Center Alley" — is adding millions of square feet of capacity every year, fueled by hyperscale demand from AWS, Microsoft, and Google. Licensed electricians, data center HVAC technicians, low-voltage cabling crews, and construction managers are continuously needed across new builds and critical facility operations. Whether you work union or open-shop, NoVA offers some of the highest-paying trades work in the country.',
  },
  {
    slug: 'phoenix',
    name: 'Phoenix',
    region: 'Phoenix, AZ',
    blurb:
      'Fast-growing hub driven by cheap power, tax incentives, and proximity to California without the costs.',
    locationPatterns: ['phoenix', 'mesa', 'chandler', 'tempe', 'gilbert', 'scottsdale', 'arizona'],
    seoBody:
      'Phoenix has emerged as one of the fastest-growing data center markets in the US, attracting major campuses from Iron Mountain, CyberNAP, and Switch. Arizona\'s business-friendly tax structure and abundant land in the East Valley continue to draw new hyperscale projects that need licensed electricians, mechanical HVAC technicians, and construction trades. Demand for skilled workers across Mesa, Chandler, and Gilbert consistently outpaces supply.',
  },
  {
    slug: 'dallas',
    name: 'Dallas–Fort Worth',
    region: 'Dallas, TX',
    blurb:
      'Second only to NoVA in scale, DFW benefits from abundant land, low taxes, and central US connectivity.',
    locationPatterns: ['dallas', 'fort worth', 'irving', 'richardson', 'allen', 'plano', 'texas'],
    seoBody:
      'The Dallas–Fort Worth Metroplex ranks among the top three data center markets in North America, with major facilities from Equinix, CyrusOne, and QTS concentrated along the I-35 and US-75 corridors. Texas\'s no-state-income-tax environment and strong construction ecosystem make it a top destination for tradespeople. Electricians, chiller technicians, generator mechanics, and low-voltage specialists will find steady, well-compensated work across Irving, Richardson, and Allen.',
  },
  {
    slug: 'chicago',
    name: 'Chicago',
    region: 'Chicago, IL',
    blurb:
      "Major Midwest internet exchange hub and financial data center corridor — home to Equinix's largest US campus.",
    locationPatterns: ['chicago', 'aurora', 'elk grove', 'illinois'],
    seoBody:
      "Chicago sits at the intersection of major fiber routes and is home to the Midwest Internet Exchange, making it a critical hub for financial services and enterprise colocation. Equinix's CH campus in the Chicago suburbs is one of the largest in the US, and ongoing buildouts in Aurora and Elk Grove Village are generating significant demand for electricians, HVAC technicians, and critical facilities operators. Union membership is common in this market and wages reflect that.",
  },
  {
    slug: 'portland',
    name: 'Portland / Hillsboro',
    region: 'Hillsboro, OR',
    blurb:
      'Pacific Northwest hub anchored by Google, Intel, and Meta facilities. Low power costs and mild climate.',
    locationPatterns: ['portland', 'hillsboro', 'beaverton', 'oregon'],
    seoBody:
      "Hillsboro and the broader Portland metro have attracted massive hyperscale investments from Google and Meta, drawn by Oregon's low electricity costs and access to renewable hydro power. The mild Pacific Northwest climate reduces cooling loads, making mechanical systems more efficient and operations roles particularly interesting. Skilled electricians, controls technicians, and HVAC professionals are in strong demand as these campuses continue to expand.",
  },
  {
    slug: 'atlanta',
    name: 'Atlanta',
    region: 'Atlanta, GA',
    blurb:
      'Southeast connectivity hub with growing hyperscale presence and strong trades labor market.',
    locationPatterns: ['atlanta', 'georgia', 'lithia springs', 'douglasville'],
    seoBody:
      "Atlanta serves as the primary internet exchange point for the Southeast US and is seeing rapid data center expansion in suburban corridors like Lithia Springs and Douglasville. QTS, Compass, and Switch have all established or expanded significant presences in the metro area. Georgia's growing tech sector and cost-competitive labor market make it an attractive destination for electricians, mechanical contractors, and data center operations staff looking for long-term project pipelines.",
  },
]

type Props = {
  params: Promise<{ city: string }>
}

export async function generateStaticParams() {
  return HUBS.map(hub => ({ city: hub.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { city } = await params
  const hub = HUBS.find(h => h.slug === city)
  if (!hub) return { title: 'Not Found' }
  return {
    title: `${hub.name} Data Center Jobs — Electricians, HVAC & Trades`,
    description: `${hub.name} data center jobs for electricians, HVAC technicians, and skilled trades. ${hub.blurb}`,
    alternates: { canonical: `https://voltgridjobs.com/locations/${city}` },
  }
}

export default async function CityPage({ params }: Props) {
  const { city } = await params
  const hub = HUBS.find(h => h.slug === city)
  if (!hub) notFound()

  let allJobs: Job[] = []
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('jobs')
      .select('*')
      .eq('is_active', true)
      .limit(200)
    allJobs = data ?? []
  } catch {
    // DB unavailable — render page with 0 jobs
  }

  const jobs: Job[] = allJobs.filter((job: Job) => {
    const loc = (job.location ?? '').toLowerCase()
    return hub.locationPatterns.some(pattern => loc.includes(pattern))
  })

  // Render empty state instead of 404 when no jobs — keeps page indexable

  return (
    <main className="min-h-screen">
      {/* Breadcrumb */}
      <nav className="max-w-5xl mx-auto px-4 pt-6 pb-2">
        <ol className="flex items-center gap-2 text-sm text-gray-500">
          <li>
            <Link href="/" className="hover:text-yellow-400 transition-colors hover:opacity-80">
              Home
            </Link>
          </li>
          <li className="text-gray-700">/</li>
          <li>
            <Link href="/locations" className="hover:text-yellow-400 transition-colors hover:opacity-80">
              Locations
            </Link>
          </li>
          <li className="text-gray-700">/</li>
          <li className="text-gray-300">{hub.name}</li>
        </ol>
      </nav>

      {/* Hero */}
      <section className="border-b border-gray-800 py-12 px-4">
        <div className="max-w-5xl mx-auto">
          <p className="text-yellow-400 text-xs font-semibold uppercase tracking-widest mb-2">
            {hub.region}
          </p>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
            {hub.name} Data Center Jobs
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mb-4">{hub.blurb}</p>
          <p className="text-gray-300 font-medium">
            {jobs.length > 0
              ? `${jobs.length} electrician, HVAC & trades job${jobs.length === 1 ? '' : 's'} in ${hub.name}`
              : `Electrician, HVAC & trades jobs in ${hub.name}`}
          </p>

          {/* SEO paragraph */}
          <p className="text-gray-500 text-sm mt-5 max-w-3xl leading-relaxed">{hub.seoBody}</p>
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
            <p className="text-gray-400 text-lg mb-2">No listings right now — set up a job alert</p>
            <p className="text-gray-600 text-sm mb-6">
              We&apos;ll email you as soon as new {hub.name} jobs are posted.
            </p>
            <div className="max-w-md mx-auto mb-6">
              <AlertSignupWidget keywords="" category={undefined} />
            </div>
            <Link href="/jobs" className="text-yellow-400 text-sm hover:underline">
              Browse all open positions →
            </Link>
          </div>
        )}
      </section>

      {/* Alert widget (always shown below job list) */}
      {jobs.length > 0 && (
        <section className="max-w-5xl mx-auto px-4 pb-10">
          <div className="max-w-md">
            <AlertSignupWidget keywords="" category={undefined} />
          </div>
        </section>
      )}

      {/* Hiring CTA */}
      <section className="border-t border-gray-800 py-12 px-4 text-center">
        <p className="text-gray-400 mb-3">
          Are you hiring in {hub.name}?
        </p>
        <Link
          href="/post-job"
          className="inline-block bg-yellow-400 text-gray-950 font-bold px-6 py-3 rounded-xl hover:bg-yellow-300 transition-colors hover:opacity-80"
        >
          Post a job from $149 →
        </Link>
      </section>
    </main>
  )
}
