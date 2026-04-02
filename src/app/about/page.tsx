import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'About',
  description:
    'VoltGrid Jobs is the job board for trades workers at data centers and AI infrastructure sites — electricians, HVAC techs, and low voltage specialists.',
  alternates: { canonical: 'https://voltgridjobs.com/about' },
}

export default function AboutPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
      <div className="mb-6">
        <Link href="/" className="text-sm transition-colors" style={{ color: 'var(--fg-muted)' }}>
          ← Home
        </Link>
      </div>

      <h1
        className="mb-10 leading-tight"
        style={{
          fontFamily: 'var(--font-display), system-ui, sans-serif',
          fontSize: 'clamp(2rem, 5vw, 3rem)',
          fontWeight: 800,
          letterSpacing: '-0.02em',
          color: 'var(--fg)',
        }}
      >
        The job board for{' '}
        <span style={{ color: 'var(--yellow)' }}>data center trades workers</span>
      </h1>

      <div
        className="space-y-6 text-base leading-relaxed"
        style={{ color: 'var(--fg-muted)', lineHeight: 1.75 }}
      >
        <p>
          VoltGrid Jobs is a focused job board for the trades workers building AI infrastructure —
          electricians, HVAC techs, low voltage specialists, and the project managers who run these sites.
        </p>

        <p>
          Data center construction is the fastest-growing sector in the built environment.
          Hyperscalers are spending $1T+ through 2030. Every job on VoltGrid is at a data center
          or AI infrastructure site — no office roles, no irrelevant listings.
        </p>

        <p>
          For trades workers: find high-paying roles at CoreWeave, xAI, T5, and the contractors
          building their sites. For employers: reach candidates who already know what a PDU is.
        </p>

        <p>
          Questions?{' '}
          <a
            href="mailto:hello@voltgridjobs.com"
            className="transition-colors hover:text-white"
            style={{ color: 'var(--yellow)' }}
          >
            hello@voltgridjobs.com
          </a>
        </p>
      </div>

      <div className="mt-12 flex flex-col sm:flex-row gap-3">
        <Link
          href="/jobs"
          className="px-6 py-3 rounded-xl font-semibold text-base transition-opacity text-center"
          style={{ background: 'var(--yellow)', color: '#0A0A0A' }}
        >
          Browse Jobs
        </Link>
        <Link
          href="/post-job"
          className="px-6 py-3 rounded-xl font-semibold text-base transition-colors text-center"
          style={{ border: '1px solid var(--border-strong)', color: 'var(--fg-muted)' }}
        >
          Post a Job
        </Link>
      </div>
    </div>
  )
}
