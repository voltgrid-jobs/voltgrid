import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Trades Specialties for Data Center Work',
  description:
    'Browse data center jobs by trade specialty — electricians, HVAC techs, low voltage, construction, project management, and operations roles at hyperscale and colocation facilities.',
}

const CATEGORIES = [
  {
    slug: 'electrician-jobs',
    shortName: 'Electrician',
    icon: '⚡',
    blurb: 'Journeymen, master electricians, and apprentices wiring the most power-dense buildings ever constructed.',
  },
  {
    slug: 'hvac-jobs',
    shortName: 'HVAC',
    icon: '❄️',
    blurb: 'HVAC technicians and mechanical engineers keeping data centers cool under massive thermal loads.',
  },
  {
    slug: 'low-voltage-jobs',
    shortName: 'Low Voltage',
    icon: '📡',
    blurb: 'Fiber, copper, structured cabling, and network infrastructure specialists for data center builds.',
  },
  {
    slug: 'construction-jobs',
    shortName: 'Construction',
    icon: '🏗️',
    blurb: "Ironworkers, concrete finishers, welders, and general construction trades building tomorrow's AI infrastructure.",
  },
  {
    slug: 'project-management-jobs',
    shortName: 'Project Management',
    icon: '📋',
    blurb: 'PMs, superintendents, and program managers running data center construction and fit-out projects.',
  },
  {
    slug: 'operations-jobs',
    shortName: 'Operations',
    icon: '⚙️',
    blurb: 'Critical facilities technicians, data center operators, and facilities managers keeping the lights on 24/7.',
  },
]

export default function TradesPage() {
  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section className="border-b border-gray-800 py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-yellow-400 text-sm font-semibold uppercase tracking-widest mb-3">
            Trade Specialties
          </p>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Find Data Center Work in Your Trade
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Hyperscale data centers and AI infrastructure demand every skilled trade.
            Browse jobs by specialty and find roles that match your expertise.
          </p>
        </div>
      </section>

      {/* Category Grid */}
      <section className="max-w-5xl mx-auto px-4 py-14">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {CATEGORIES.map(cat => (
            <Link
              key={cat.slug}
              href={`/trades/${cat.slug}`}
              className="group bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-yellow-400/50 hover:bg-gray-800 transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <span className="text-2xl mb-2 block">{cat.icon}</span>
                  <h2 className="text-lg font-bold text-white group-hover:text-yellow-400 transition-colors">
                    {cat.shortName}
                  </h2>
                </div>
                <span className="text-gray-600 group-hover:text-yellow-400 transition-colors text-xl">
                  →
                </span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">{cat.blurb}</p>
              <p className="text-yellow-400 text-xs font-medium mt-4 group-hover:underline">
                Browse jobs →
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="border-t border-gray-800 py-12 px-4 text-center">
        <p className="text-gray-400 mb-2">Looking for work in a specific city?</p>
        <Link
          href="/locations"
          className="text-yellow-400 font-semibold hover:underline"
        >
          Browse jobs by location →
        </Link>
      </section>
    </main>
  )
}
