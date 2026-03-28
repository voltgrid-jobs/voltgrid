import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Data Center Job Hubs — VoltGrid Jobs',
  description:
    'Browse electrician, HVAC, and trades jobs at the biggest data center markets in the US — Northern Virginia, Phoenix, Dallas, Chicago, Portland, and Atlanta.',
}

const HUBS = [
  {
    slug: 'northern-virginia',
    name: 'Northern Virginia',
    region: 'Ashburn, VA',
    blurb:
      "The world's largest data center market. Loudoun County alone hosts over 35% of global internet traffic.",
  },
  {
    slug: 'phoenix',
    name: 'Phoenix',
    region: 'Phoenix, AZ',
    blurb:
      'Fast-growing hub driven by cheap power, tax incentives, and proximity to California without the costs.',
  },
  {
    slug: 'dallas',
    name: 'Dallas–Fort Worth',
    region: 'Dallas, TX',
    blurb:
      'Second only to NoVA in scale, DFW benefits from abundant land, low taxes, and central US connectivity.',
  },
  {
    slug: 'chicago',
    name: 'Chicago',
    region: 'Chicago, IL',
    blurb:
      "Major Midwest internet exchange hub and financial data center corridor — home to Equinix's largest US campus.",
  },
  {
    slug: 'portland',
    name: 'Portland / Hillsboro',
    region: 'Hillsboro, OR',
    blurb:
      'Pacific Northwest hub anchored by Google, Intel, and Meta facilities. Low power costs and mild climate.',
  },
  {
    slug: 'atlanta',
    name: 'Atlanta',
    region: 'Atlanta, GA',
    blurb:
      'Southeast connectivity hub with growing hyperscale presence and strong trades labor market.',
  },
]

export default function LocationsPage() {
  return (
    <main className="min-h-screen bg-gray-950 text-white">
      {/* Hero */}
      <section className="border-b border-gray-800 py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-yellow-400 text-sm font-semibold uppercase tracking-widest mb-3">
            Job Hubs
          </p>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Find Trades Work at the Nation&apos;s Biggest Data Center Hubs
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Hyperscale construction is booming. Electricians, HVAC techs, and skilled tradespeople
            are in high demand at these major data center markets.
          </p>
        </div>
      </section>

      {/* Hub Grid */}
      <section className="max-w-5xl mx-auto px-4 py-14">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {HUBS.map(hub => (
            <Link
              key={hub.slug}
              href={`/locations/${hub.slug}`}
              className="group bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-yellow-400/50 hover:bg-gray-800 transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h2 className="text-lg font-bold text-white group-hover:text-yellow-400 transition-colors">
                    {hub.name}
                  </h2>
                  <p className="text-yellow-400 text-xs font-medium mt-0.5">{hub.region}</p>
                </div>
                <span className="text-gray-600 group-hover:text-yellow-400 transition-colors text-xl">
                  →
                </span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">{hub.blurb}</p>
              <p className="text-yellow-400 text-xs font-medium mt-4 group-hover:underline">
                Browse jobs →
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="border-t border-gray-800 py-12 px-4 text-center">
        <p className="text-gray-400 mb-2">Don&apos;t see your market?</p>
        <Link
          href="/jobs"
          className="text-yellow-400 font-semibold hover:underline"
        >
          View all open positions →
        </Link>
      </section>
    </main>
  )
}
