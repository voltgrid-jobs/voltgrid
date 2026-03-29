import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Your Listing is Live — VoltGrid Jobs',
}

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string; job_id?: string }>
}) {
  const params = await searchParams
  const jobId = params.job_id || null

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-20 text-center">
      <div
        className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-6 text-2xl"
        style={{ background: 'var(--yellow-dim)', border: '1px solid var(--yellow-border)' }}
      >
        ⚡
      </div>

      <h1
        className="text-3xl font-bold mb-4"
        style={{ color: 'var(--fg)', fontFamily: 'var(--font-display), system-ui, sans-serif' }}
      >
        Your listing is live.
      </h1>

      <p className="text-lg mb-4" style={{ color: 'var(--fg-muted)', lineHeight: 1.7 }}>
        Qualified electricians, HVAC techs, and low-voltage specialists can find it now.
        Applications will come directly to your email.
      </p>

      <p className="text-sm mb-10" style={{ color: 'var(--fg-faint)' }}>
        Your listing will remain active for 30 days. A confirmation was sent to your email.
      </p>

      <div className="flex flex-col sm:flex-row gap-3 justify-center mb-12">
        {jobId ? (
          <Link
            href={`/jobs/${jobId}`}
            className="px-8 py-3 rounded-xl font-semibold transition-opacity"
            style={{ background: 'var(--yellow)', color: '#0A0A0A' }}
          >
            View Your Listing →
          </Link>
        ) : (
          <Link
            href="/jobs"
            className="px-8 py-3 rounded-xl font-semibold transition-opacity"
            style={{ background: 'var(--yellow)', color: '#0A0A0A' }}
          >
            Browse All Jobs
          </Link>
        )}
        <Link
          href="/post-job"
          className="px-8 py-3 rounded-xl font-semibold transition-colors"
          style={{ border: '1px solid var(--border)', color: 'var(--fg-muted)' }}
        >
          Post Another Job
        </Link>
      </div>

      <div
        className="rounded-2xl p-6 text-left"
        style={{ background: 'var(--bg-raised)', border: '1px solid var(--border)' }}
      >
        <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--fg-faint)' }}>
          Questions?
        </p>
        <p className="text-sm" style={{ color: 'var(--fg-muted)', lineHeight: 1.7 }}>
          Reach us at{' '}
          <a
            href="mailto:hello@voltgridjobs.com"
            className="transition-colors"
            style={{ color: 'var(--yellow)' }}
          >
            hello@voltgridjobs.com
          </a>
          {' '}— we typically respond within a few hours.
        </p>
      </div>
    </div>
  )
}
