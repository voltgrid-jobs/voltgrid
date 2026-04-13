export const dynamic = 'force-dynamic'

import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { SetPasswordWithToken } from './SetPasswordWithToken'

export const metadata: Metadata = {
  title: 'Alert confirmed',
  robots: { index: false, follow: false },
}

const COPY: Record<string, { heading: string; body: string; tone: 'success' | 'neutral' | 'error' }> = {
  ok: {
    heading: "You're confirmed.",
    body: "Your job alert is live. Matching roles will arrive in your inbox starting tomorrow morning.",
    tone: 'success',
  },
  already: {
    heading: "Already confirmed.",
    body: "This alert was already confirmed. Matching jobs will keep arriving on your usual schedule.",
    tone: 'neutral',
  },
  invalid: {
    heading: 'That link looks wrong.',
    body: "The confirmation token is missing or malformed. Try copying the full URL from your email into your browser.",
    tone: 'error',
  },
  notfound: {
    heading: "We couldn't find that alert.",
    body: 'The link may have expired or the alert was already removed. Sign up again from any job listing.',
    tone: 'error',
  },
  error: {
    heading: 'Something went wrong.',
    body: "We could not confirm your alert. Please try the link again in a minute.",
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
  const token = params.t || null

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const isSignedIn = !!user
  const hasPassword = user?.identities?.some(i => i.provider === 'email') ?? false

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

        {/* Password setup prompt — show for successful confirms when user needs a password */}
        {copy.tone === 'success' && token && (!isSignedIn || !hasPassword) && (
          <div
            className="rounded-xl p-5 mb-6"
            style={{ background: 'var(--bg-raised)', border: '1px solid var(--yellow-border)', maxWidth: '420px' }}
          >
            <p className="text-sm font-semibold mb-1" style={{ color: 'var(--yellow)' }}>
              Set up your account
            </p>
            <p className="text-xs mb-4" style={{ color: 'var(--fg-muted)' }}>
              Create a password to manage alerts, save jobs, and access your dashboard.
            </p>
            <SetPasswordWithToken alertToken={token} />
          </div>
        )}

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
          {isSignedIn && hasPassword ? (
            <Link
              href="/dashboard"
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
              Go to Dashboard →
            </Link>
          ) : (
            <Link
              href="/jobs"
              style={{
                display: 'inline-block',
                padding: '0.875rem 1.5rem',
                borderRadius: '10px',
                background: copy.tone === 'success' && token && !isSignedIn ? 'transparent' : 'var(--yellow)',
                color: copy.tone === 'success' && token && !isSignedIn ? 'var(--fg-muted)' : '#0a0a0a',
                border: copy.tone === 'success' && token && !isSignedIn ? '1px solid var(--border)' : 'none',
                fontWeight: 700,
                fontSize: '0.95rem',
                textDecoration: 'none',
              }}
            >
              Browse open jobs
            </Link>
          )}

          {isSignedIn && (
            <Link
              href="/jobs"
              style={{
                display: 'inline-block',
                padding: '0.875rem 1.5rem',
                borderRadius: '10px',
                background: 'transparent',
                color: 'var(--fg-muted)',
                border: '1px solid var(--border)',
                fontWeight: 600,
                fontSize: '0.95rem',
                textDecoration: 'none',
              }}
            >
              Browse open jobs
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
