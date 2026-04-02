import type { Metadata } from 'next'
import Link from 'next/link'
import { JobAlertInlineForm } from '@/components/jobs/JobAlertInlineForm'

export const metadata: Metadata = {
  title: 'Data Center Trades Career Resources — VoltGrid Jobs',
  description: 'Guides, salary data, and interview prep for electricians, HVAC techs, and low voltage specialists working in data centers and AI infrastructure.',
  alternates: { canonical: 'https://voltgridjobs.com/resources' },
  openGraph: {
    title: 'Data Center Trades Career Resources',
    description: 'Guides, salary data, and interview prep for data center trades workers.',
    type: 'website',
  },
}

const webPageSchema = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: 'Data Center Trades Career Resources',
  description: 'Guides, salary data, and interview prep for electricians, HVAC techs, and low voltage specialists working in data centers and AI infrastructure.',
  url: 'https://voltgridjobs.com/resources',
  publisher: { '@type': 'Organization', name: 'VoltGrid Jobs', url: 'https://voltgridjobs.com' },
  hasPart: [
    {
      '@type': 'Article',
      name: '2026 Data Center Trades Salary Guide',
      url: 'https://voltgridjobs.com/salary-guide',
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Data Center Trades Salary Calculator',
      url: 'https://voltgridjobs.com/salary-calculator',
    },
    {
      '@type': 'Article',
      name: 'How to Break Into Data Center Work as an Electrician or HVAC Tech',
      url: 'https://voltgridjobs.com/break-into-data-center-work',
    },
    {
      '@type': 'Article',
      name: 'Data Center Trades Interview Prep Guide',
      url: 'https://voltgridjobs.com/interview-prep',
    },
  ],
}

const RESOURCES = [
  {
    href: '/salary-guide',
    title: '2026 Data Center Trades Salary Guide',
    description: 'Current pay rates for electricians, HVAC techs, and low voltage specialists on data center and AI infrastructure projects — by role, experience level, and region.',
    badge: 'Salary Data',
    badgeColor: 'var(--green)',
    badgeBg: 'var(--green-dim)',
    icon: '💰',
  },
  {
    href: '/salary-calculator',
    title: 'Data Center Trades Salary Calculator',
    description: 'Estimate your 2026 pay range by trade, city, and experience level. Compare Northern Virginia to Phoenix to Dallas — and see how you stack up against the national average.',
    badge: 'Tool',
    badgeColor: 'var(--yellow)',
    badgeBg: 'var(--yellow-dim)',
    icon: '🧮',
  },
  {
    href: '/break-into-data-center-work',
    title: 'How to Break Into Data Center Work',
    description: 'What data center employers actually look for, what transfers from your current trade, certifications that move your resume to the top, and how to find these roles.',
    badge: 'Career Guide',
    badgeColor: 'var(--yellow)',
    badgeBg: 'var(--yellow-dim)',
    icon: '🚀',
  },
  {
    href: '/interview-prep',
    title: 'Data Center Trades Interview Prep Guide',
    description: 'The 20 questions data center employers actually ask — for electricians, HVAC techs, and low voltage specialists. Technical and behavioral questions with answers.',
    badge: 'Interview Prep',
    badgeColor: 'var(--yellow)',
    badgeBg: 'var(--yellow-dim)',
    icon: '🎯',
  },
]

const COMING_SOON = [
  {
    title: 'Certifications That Pay Off in Data Centers',
    description: 'DCCA, BICSI, NFPA 70E, and OEM certs — which ones actually get you hired faster and which are nice-to-have.',
    icon: '📜',
  },
  {
    title: 'Understanding Data Center Power Systems',
    description: 'A trades worker\'s guide to UPS topology, PDUs, switchgear, and the A/B power path — written for electricians, not engineers.',
    icon: '⚡',
  },
  {
    title: 'Data Center HVAC Systems Explained',
    description: 'CRAC vs. CRAH, chilled water loops, hot/cold aisle containment, and precision cooling — what every DC HVAC tech needs to know.',
    icon: '❄️',
  },
]

export default function ResourcesPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageSchema) }} />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        {/* Breadcrumb */}
        <p className="text-sm mb-6" style={{ color: 'var(--fg-faint)' }}>
          <Link href="/" style={{ color: 'var(--fg-faint)' }} className="hover:text-yellow-400 transition-colors">Home</Link>
          {' '}/{' '}
          <span style={{ color: 'var(--fg-muted)' }}>Resources</span>
        </p>

        {/* Hero */}
        <div className="mb-10">
          <div
            className="inline-flex items-center gap-2 text-xs font-semibold tracking-widest uppercase px-3 py-1.5 rounded-full mb-6"
            style={{ background: 'var(--yellow-dim)', color: 'var(--yellow)', border: '1px solid var(--yellow-border)' }}
          >
            ⚡ Career Resources
          </div>
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
            Data Center Trades Knowledge Hub
          </h1>
          <p className="text-base" style={{ color: 'var(--fg-muted)', lineHeight: 1.7, maxWidth: '600px' }}>
            Guides, salary data, and interview prep built specifically for electricians, HVAC techs, and low voltage specialists working in data centers and AI infrastructure.
          </p>
        </div>

        {/* Job alert signup strip */}
        <div className="mb-10 -mx-4 sm:-mx-6">
          <JobAlertInlineForm variant="homepage" />
        </div>

        {/* Resource cards */}
        <section className="mb-12">
          <h2 className="text-sm font-semibold uppercase tracking-widest mb-5" style={{ color: 'var(--fg-faint)' }}>
            Available now
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {RESOURCES.map((resource) => (
              <Link
                key={resource.href}
                href={resource.href}
                className="group rounded-xl p-5 flex flex-col gap-3 transition-colors"
                style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-2xl">{resource.icon}</span>
                  <span
                    className="text-xs font-semibold px-2 py-0.5 rounded-full"
                    style={{ color: resource.badgeColor, background: resource.badgeBg }}
                  >
                    {resource.badge}
                  </span>
                </div>
                <div>
                  <p
                    className="font-bold mb-1.5 group-hover:text-yellow-400 transition-colors"
                    style={{ color: 'var(--fg)', fontFamily: 'var(--font-display), system-ui, sans-serif' }}
                  >
                    {resource.title}
                  </p>
                  <p className="text-sm" style={{ color: 'var(--fg-muted)', lineHeight: 1.6 }}>
                    {resource.description}
                  </p>
                </div>
                <p className="text-sm font-semibold mt-auto" style={{ color: 'var(--yellow)' }}>
                  Read guide →
                </p>
              </Link>
            ))}
          </div>
        </section>

        {/* Coming soon */}
        <section className="mb-12">
          <h2 className="text-sm font-semibold uppercase tracking-widest mb-5" style={{ color: 'var(--fg-faint)' }}>
            Coming soon
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {COMING_SOON.map((item) => (
              <div
                key={item.title}
                className="rounded-xl p-5"
                style={{ background: 'var(--surface)', border: '1px solid var(--border)', opacity: 0.5 }}
              >
                <span className="text-2xl mb-3 block">{item.icon}</span>
                <p className="font-bold mb-1.5" style={{ color: 'var(--fg)', fontFamily: 'var(--font-display), system-ui, sans-serif' }}>
                  {item.title}
                </p>
                <p className="text-sm" style={{ color: 'var(--fg-muted)', lineHeight: 1.6 }}>
                  {item.description}
                </p>
                <p className="text-xs mt-3 font-semibold" style={{ color: 'var(--fg-faint)' }}>
                  Coming soon
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Job alert CTA */}
        <div
          className="rounded-xl px-6 py-8 text-center"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
        >
          <p className="text-lg font-bold mb-2" style={{ color: 'var(--fg)', fontFamily: 'var(--font-display), system-ui, sans-serif' }}>
            Ready to find your next role?
          </p>
          <p className="text-sm mb-5" style={{ color: 'var(--fg-muted)' }}>
            Browse data center trades jobs — electricians, HVAC techs, low voltage specialists, and more.
          </p>
          <Link
            href="/jobs"
            className="inline-block font-bold px-6 py-3 rounded-xl transition-colors"
            style={{ background: 'var(--yellow)', color: '#0A0A0A' }}
          >
            Browse all open jobs →
          </Link>
        </div>
      </div>
    </>
  )
}
