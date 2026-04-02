import type { Metadata } from 'next'
import Link from 'next/link'
import { SalaryCalculatorClient } from './SalaryCalculatorClient'

export const metadata: Metadata = {
  title: 'Data Center Trades Salary Calculator (2026)',
  description:
    'Calculate 2026 hourly and annual salary ranges for data center electricians, HVAC techs, low voltage specialists, and more. Compare pay by city and experience level.',
  alternates: { canonical: 'https://voltgridjobs.com/salary-calculator' },
  openGraph: {
    title: 'Data Center Trades Salary Calculator (2026)',
    description:
      'What does a data center electrician earn in Northern Virginia? HVAC tech in Phoenix? Calculate 2026 salary ranges by trade, market, and experience level.',
    type: 'website',
  },
}

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'How much do data center electricians make?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Data center electricians earn $44–$82/hr in 2026 depending on market and experience. Journeyman electricians in Northern Virginia (the world\'s largest data center market) typically earn $65–$82/hr. National average for journeyman-level data center electricians is $44–$58/hr.',
      },
    },
    {
      '@type': 'Question',
      name: 'What is the salary for a data center HVAC technician?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Data center HVAC technicians earn $36–$68/hr in 2026. Precision cooling specialists with CRAC/CRAH and chilled water experience are at the high end. Northern Virginia pays the most ($50–$68/hr journeyman), while the national average is $36–$52/hr.',
      },
    },
    {
      '@type': 'Question',
      name: 'Do data center jobs pay more than commercial construction?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. Data center work typically pays 15–30% above equivalent commercial construction or facilities roles. The premium reflects mission-critical environment requirements, specialized knowledge, and intense demand driven by AI infrastructure buildout.',
      },
    },
    {
      '@type': 'Question',
      name: 'Which city pays the most for data center trades workers?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Northern Virginia (Ashburn/Sterling corridor) consistently pays the highest rates for data center trades — it is the world\'s largest data center market by capacity. Portland, OR is second for electricians due to strong IBEW Local 48 union wages on hyperscale campuses. Phoenix, Dallas, and Chicago all offer above-national-average pay.',
      },
    },
  ],
}

export default function SalaryCalculatorPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        {/* Breadcrumb */}
        <p className="text-sm mb-6" style={{ color: 'var(--fg-faint)' }}>
          <Link href="/" style={{ color: 'var(--fg-faint)' }} className="hover:text-yellow-400 transition-colors">Home</Link>
          {' '}/{' '}
          <Link href="/resources" style={{ color: 'var(--fg-faint)' }} className="hover:text-yellow-400 transition-colors">Resources</Link>
          {' '}/{' '}
          <span style={{ color: 'var(--fg-muted)' }}>Salary Calculator</span>
        </p>

        {/* Eyebrow */}
        <div
          className="inline-flex items-center gap-2 text-xs font-semibold tracking-widest uppercase px-3 py-1.5 rounded-full mb-6"
          style={{ background: 'var(--yellow-dim)', color: 'var(--yellow)', border: '1px solid var(--yellow-border)' }}
        >
          💰 Salary Calculator · 2026
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
          Data Center Trades Salary Calculator
        </h1>
        <p className="text-base mb-10" style={{ color: 'var(--fg-muted)', lineHeight: 1.7, maxWidth: '560px' }}>
          Estimate 2026 pay ranges for electricians, HVAC techs, low voltage specialists, and other trades workers at data centers across the US — by market and experience level.
        </p>

        <SalaryCalculatorClient />

        {/* Static SEO content */}
        <div
          className="mt-16 space-y-10"
          style={{ borderTop: '1px solid var(--border)', paddingTop: '2.5rem' }}
        >
          <section>
            <h2
              className="text-lg font-bold mb-3"
              style={{ color: 'var(--fg)', fontFamily: 'var(--font-display), system-ui, sans-serif' }}
            >
              Data center pay vs. commercial construction
            </h2>
            <p className="text-sm" style={{ color: 'var(--fg-muted)', lineHeight: 1.8 }}>
              Data center work typically pays 15–30% above equivalent commercial electrical, HVAC, or low voltage roles. The premium comes from mission-critical environment requirements, 24/7 operations, and specialized knowledge of precision cooling, power distribution, and structured cabling at density. Hyperscale sites in Northern Virginia and Portland regularly post journeyman electrician roles at $65–$82/hr, compared to $45–$58/hr on standard commercial builds in the same markets.
            </p>
          </section>

          <section>
            <h2
              className="text-lg font-bold mb-3"
              style={{ color: 'var(--fg)', fontFamily: 'var(--font-display), system-ui, sans-serif' }}
            >
              Top-paying markets for data center trades workers
            </h2>
            <p className="text-sm" style={{ color: 'var(--fg-muted)', lineHeight: 1.8 }}>
              Northern Virginia (Ashburn/Sterling corridor) pays the highest rates in the country. It is the world&apos;s largest data center market by capacity, and competition for licensed electricians and HVAC techs is intense. Portland, OR is the second-highest market for electricians due to IBEW Local 48 union density and the Hillsboro hyperscale corridor. Phoenix, Dallas, and Chicago all offer above-national-average pay driven by sustained hyperscale construction demand from Microsoft, Google, and Meta.
            </p>
          </section>

          <section>
            <h2
              className="text-lg font-bold mb-3"
              style={{ color: 'var(--fg)', fontFamily: 'var(--font-display), system-ui, sans-serif' }}
            >
              How experience level affects data center pay
            </h2>
            <p className="text-sm" style={{ color: 'var(--fg-muted)', lineHeight: 1.8 }}>
              Entry-level and apprentice workers typically earn 65–80% of journeyman rates. The jump from apprentice to journeyman (licensed) is the largest single pay increase — often $10–$20/hr. Senior and master-level workers earn a 15–25% premium over journeyman base. Lead technicians and foremen overseeing crews typically earn 30–45% above journeyman, plus overtime and per diem on construction projects.
            </p>
          </section>

          <section>
            <h2
              className="text-lg font-bold mb-3"
              style={{ color: 'var(--fg)', fontFamily: 'var(--font-display), system-ui, sans-serif' }}
            >
              Certifications that increase data center pay
            </h2>
            <p className="text-sm" style={{ color: 'var(--fg-muted)', lineHeight: 1.8 }}>
              For electricians: OSHA-30, NFPA 70E arc flash training, and medium-voltage experience push wages toward the top of the range. IBEW membership adds pension and benefits on union sites. For HVAC techs: EPA 608 is required for refrigerant work; Liebert/Vertiv or Stulz OEM training, NATE, and DCCA (Schneider Electric) are valued for precision cooling roles. For low voltage: BICSI INST1 and INST2 certifications are the primary credentialing path — they can move mid-level pay from $34–$48/hr to $45–$55/hr on hyperscale projects.
            </p>
          </section>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/salary-guide"
              className="inline-block font-semibold px-5 py-3 rounded-xl text-sm transition-colors"
              style={{ background: 'var(--yellow)', color: '#0A0A0A' }}
            >
              2026 Salary Guide →
            </Link>
            <Link
              href="/jobs"
              className="inline-block font-semibold px-5 py-3 rounded-xl text-sm transition-colors"
              style={{ border: '1px solid var(--border)', color: 'var(--fg-muted)' }}
            >
              Browse open jobs →
            </Link>
            <Link
              href="/resources"
              className="inline-block font-semibold px-5 py-3 rounded-xl text-sm transition-colors"
              style={{ border: '1px solid var(--border)', color: 'var(--fg-muted)' }}
            >
              Career resources →
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
