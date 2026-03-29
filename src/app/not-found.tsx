import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-24 text-center">
      <div
        className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-8 text-3xl"
        style={{ background: 'var(--yellow-dim)', border: '1px solid var(--yellow-border)' }}
      >
        ⚡
      </div>
      <p className="text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: 'var(--yellow)' }}>
        404 — Not Found
      </p>
      <h1
        className="mb-4 leading-tight"
        style={{
          fontFamily: 'var(--font-display), system-ui, sans-serif',
          fontSize: 'clamp(2rem, 5vw, 3rem)',
          fontWeight: 800,
          color: 'var(--fg)',
          letterSpacing: '-0.01em',
        }}
      >
        This page doesn&apos;t exist
      </h1>
      <p className="text-base mb-10 max-w-md mx-auto" style={{ color: 'var(--fg-muted)', lineHeight: 1.6 }}>
        The job may have expired or the link is broken. Browse current openings or post your own.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link
          href="/jobs"
          className="px-8 py-3 rounded-xl font-semibold transition-opacity"
          style={{ background: 'var(--yellow)', color: '#0A0A0A' }}
        >
          Browse All Jobs
        </Link>
        <Link
          href="/post-job"
          className="px-8 py-3 rounded-xl font-semibold transition-colors"
          style={{ border: '1px solid var(--border-strong)', color: 'var(--fg-muted)' }}
        >
          Post a Job — $149
        </Link>
      </div>
    </div>
  )
}
