import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Alert confirmed',
  robots: { index: false, follow: false },
}

const COPY: Record<string, { heading: string; body: string; tone: 'success' | 'neutral' | 'error' }> = {
  ok: {
    heading: "You're confirmed.",
    body: "Your data center trades job alert is live. We'll start sending matching roles tomorrow morning. Check your inbox for the welcome email with the 2026 salary guide.",
    tone: 'success',
  },
  already: {
    heading: "Already confirmed.",
    body: "This alert was already confirmed. You don't need to do anything — matching jobs will keep arriving on your usual schedule.",
    tone: 'neutral',
  },
  invalid: {
    heading: 'That link looks wrong.',
    body: "The confirmation token is missing or malformed. If you clicked it from an email, try copying the full URL into your browser. Otherwise, sign up for alerts again from any job listing.",
    tone: 'error',
  },
  notfound: {
    heading: "We couldn't find that alert.",
    body: 'The link may have expired or the alert was already removed. Sign up again from any job listing and we will resend the confirmation.',
    tone: 'error',
  },
  error: {
    heading: 'Something went wrong.',
    body: "We could not confirm your alert. Please try the link again in a minute, or sign up once more.",
    tone: 'error',
  },
}

export default async function AlertsConfirmedPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; t?: string }>
}) {
  const params = await searchParams
  const status = (params.status ?? 'ok') as keyof typeof COPY
  const copy = COPY[status] ?? COPY.ok
  const manageHref = params.t ? `/alerts/manage?t=${params.t}` : null

  const accent =
    copy.tone === 'success' ? 'var(--yellow)' : copy.tone === 'error' ? '#f87171' : 'var(--fg-muted)'

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
          {copy.tone === 'success' ? '⚡ Confirmed' : copy.tone === 'error' ? '⚠ Issue' : '✓ Already set'}
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
              background: 'var(--yellow)',
              color: '#0a0a0a',
              fontWeight: 700,
              fontSize: '0.95rem',
              textDecoration: 'none',
            }}
          >
            Browse open jobs →
          </Link>
          <Link
            href="/salary-guide"
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
            Read the 2026 salary guide
          </Link>
          {manageHref && (
            <Link
              href={manageHref}
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
              Manage this alert
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
