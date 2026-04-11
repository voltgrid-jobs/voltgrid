import type { Metadata } from 'next'
import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase/admin'
import { ManageForm } from './ManageForm'

export const metadata: Metadata = {
  title: 'Manage your job alert — VoltGrid Jobs',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

export default async function ManageAlertPage({
  searchParams,
}: {
  searchParams: Promise<{ t?: string }>
}) {
  const params = await searchParams
  const token = params.t

  if (!token || !/^[0-9a-f-]{36}$/i.test(token)) {
    return <ErrorPanel heading="Link not valid" body="This preference-center link is missing or malformed. Open it from your email or sign up for alerts again." />
  }

  const admin = createAdminClient()
  const { data: alert } = await admin
    .from('job_alerts')
    .select('id, email, category, frequency, keywords, location, confirmed_at, is_active, created_at')
    .eq('confirmation_token', token)
    .maybeSingle()

  if (!alert) {
    return <ErrorPanel heading="Alert not found" body="This link is either expired or the alert was already removed. Sign up again from any job listing if you want to resubscribe." />
  }

  if (!alert.is_active) {
    return (
      <ErrorPanel
        heading="This alert is unsubscribed"
        body="We are not sending emails for this subscription any more. If you change your mind, sign up again from any job listing."
      />
    )
  }

  if (!alert.confirmed_at) {
    return (
      <ErrorPanel
        heading="Please confirm your alert first"
        body="This alert is waiting for you to click the confirmation link we emailed. Check your inbox for the message titled 'Confirm your VoltGrid job alert'."
      />
    )
  }

  const categoryLabel = alert.category ? alert.category.replace(/_/g, ' ') : 'all trades'
  const unsubUrl = `/api/alerts/unsubscribe?t=${token}`

  return (
    <div style={{ background: 'var(--bg)', minHeight: '70vh' }}>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.4rem 0.85rem',
            borderRadius: '999px',
            background: 'var(--bg-raised)',
            border: '1px solid var(--border)',
            fontSize: '0.7rem',
            fontWeight: 700,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: 'var(--yellow)',
            marginBottom: '1.5rem',
          }}
        >
          ⚡ Preference center
        </div>

        <h1
          style={{
            fontFamily: 'var(--font-display), system-ui, sans-serif',
            fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
            fontWeight: 800,
            letterSpacing: '-0.02em',
            color: 'var(--fg)',
            marginBottom: '0.5rem',
          }}
        >
          Manage your alert
        </h1>
        <p style={{ fontSize: '0.95rem', color: 'var(--fg-muted)', lineHeight: 1.65, marginBottom: '0.25rem' }}>
          <strong style={{ color: 'var(--fg)' }}>{alert.email}</strong> — alert for{' '}
          <strong style={{ color: 'var(--yellow)' }}>{categoryLabel}</strong> jobs.
        </p>
        <p style={{ fontSize: '0.8rem', color: 'var(--fg-faint)', marginBottom: '2rem' }}>
          Created {new Date(alert.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}.
        </p>

        <div
          style={{
            background: 'var(--bg-raised)',
            border: '1px solid var(--border)',
            borderRadius: '14px',
            padding: '1.5rem',
            marginBottom: '1.5rem',
          }}
        >
          <ManageForm
            token={token}
            initialFrequency={(alert.frequency ?? 'daily') as 'daily' | 'weekly'}
            initialKeywords={alert.keywords ?? ''}
            initialLocation={alert.location ?? ''}
          />
        </div>

        <div
          style={{
            background: 'var(--bg-raised)',
            border: '1px solid var(--border)',
            borderRadius: '14px',
            padding: '1.25rem 1.5rem',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
          }}
        >
          <div>
            <p style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--fg)', margin: '0 0 0.25rem 0' }}>
              Done with alerts?
            </p>
            <p style={{ fontSize: '0.8rem', color: 'var(--fg-faint)', margin: 0 }}>
              One click to stop. You can always sign up again.
            </p>
          </div>
          <a
            href={unsubUrl}
            style={{
              padding: '0.65rem 1.25rem',
              borderRadius: '10px',
              background: 'transparent',
              color: '#f87171',
              border: '1px solid #7f1d1d',
              fontWeight: 700,
              fontSize: '0.85rem',
              textDecoration: 'none',
              whiteSpace: 'nowrap',
            }}
          >
            Unsubscribe
          </a>
        </div>

        <div
          style={{
            marginTop: '2rem',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '1.5rem',
            fontSize: '0.85rem',
          }}
        >
          <Link href="/jobs" style={{ color: 'var(--yellow)', textDecoration: 'none', fontWeight: 600 }}>
            → Browse open jobs
          </Link>
          <Link href="/salary-guide" style={{ color: 'var(--yellow)', textDecoration: 'none', fontWeight: 600 }}>
            → 2026 salary guide
          </Link>
        </div>
      </div>
    </div>
  )
}

function ErrorPanel({ heading, body }: { heading: string; body: string }) {
  return (
    <div style={{ background: 'var(--bg)', minHeight: '70vh' }}>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-20 sm:py-28">
        <h1
          style={{
            fontFamily: 'var(--font-display), system-ui, sans-serif',
            fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
            fontWeight: 800,
            color: 'var(--fg)',
            marginBottom: '1rem',
          }}
        >
          {heading}
        </h1>
        <p style={{ fontSize: '0.95rem', color: 'var(--fg-muted)', lineHeight: 1.7, marginBottom: '2rem', maxWidth: '520px' }}>
          {body}
        </p>
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
      </div>
    </div>
  )
}
