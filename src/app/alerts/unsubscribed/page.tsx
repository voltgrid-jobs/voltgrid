import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Unsubscribed',
  robots: { index: false, follow: false },
}

const COPY: Record<string, { heading: string; body: string; tone: 'success' | 'error' }> = {
  ok: {
    heading: "You're unsubscribed.",
    body: "You will not receive any more emails for this alert. If you want job updates again later, sign up on any job listing — we don't hold a grudge.",
    tone: 'success',
  },
  invalid: {
    heading: 'That link looks wrong.',
    body: 'The unsubscribe token is missing or malformed. Copy the full URL from your email and try again.',
    tone: 'error',
  },
  notfound: {
    heading: "We couldn't find that alert.",
    body: 'The alert may have already been removed. No further emails will be sent for that subscription.',
    tone: 'error',
  },
  error: {
    heading: 'Something went wrong.',
    body: 'We could not complete the unsubscribe. Please try the link again in a minute. If that still fails, reply to any VoltGrid email and we will remove you by hand.',
    tone: 'error',
  },
}

export default async function AlertsUnsubscribedPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const params = await searchParams
  const status = (params.status ?? 'ok') as keyof typeof COPY
  const copy = COPY[status] ?? COPY.ok
  const accent = copy.tone === 'error' ? '#f87171' : 'var(--yellow)'

  return (
    <div style={{ background: 'var(--bg)', minHeight: '70vh' }}>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-20 sm:py-28">
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.4rem 0.85rem',
            borderRadius: '999px',
            background: 'var(--bg-raised)',
            border: `1px solid ${accent === 'var(--yellow)' ? 'var(--yellow-border)' : 'var(--border)'}`,
            fontSize: '0.7rem',
            fontWeight: 700,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: accent,
            marginBottom: '1.5rem',
          }}
        >
          {copy.tone === 'success' ? '✓ Removed' : '⚠ Issue'}
        </div>

        <h1
          style={{
            fontFamily: 'var(--font-display), system-ui, sans-serif',
            fontSize: 'clamp(2rem, 5vw, 3rem)',
            fontWeight: 800,
            letterSpacing: '-0.02em',
            color: 'var(--fg)',
            marginBottom: '1rem',
          }}
        >
          {copy.heading}
        </h1>
        <p style={{ fontSize: '1rem', color: 'var(--fg-muted)', lineHeight: 1.7, marginBottom: '2rem', maxWidth: '560px' }}>
          {copy.body}
        </p>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
          <Link
            href="/jobs"
            style={{
              display: 'inline-block',
              padding: '0.875rem 1.5rem',
              borderRadius: '10px',
              background: 'transparent',
              color: 'var(--yellow)',
              border: '1px solid var(--yellow-border)',
              fontWeight: 700,
              fontSize: '0.95rem',
              textDecoration: 'none',
            }}
          >
            Browse open jobs
          </Link>
          <Link
            href="/"
            style={{
              display: 'inline-block',
              padding: '0.875rem 1.5rem',
              borderRadius: '10px',
              background: 'transparent',
              color: 'var(--fg-faint)',
              border: '1px solid var(--border)',
              fontWeight: 600,
              fontSize: '0.95rem',
              textDecoration: 'none',
            }}
          >
            Back to VoltGrid
          </Link>
        </div>
      </div>
    </div>
  )
}
