'use client'

import { useState } from 'react'

// ─────────────────────────────────────────────────────────────────────
// TwoStepAlertForm
//
// The canonical 2-step email capture used site-wide. Step 1 is a
// grid of trade buttons (Electrical, HVAC, Low Voltage, All trades).
// Step 2 is a city/state free-text field + email + submit, plus a
// "show me jobs everywhere" link that submits with location = 'all'.
//
// "All trades" and "all locations" are stored as the literal string
// 'all' in trade_pref and location_pref. Callers should NOT treat
// them as empty/fallback states — they are legitimate selections.
// ─────────────────────────────────────────────────────────────────────

export type TradePref = 'electrical' | 'hvac' | 'low_voltage' | 'all'

const TRADES: { value: TradePref; label: string; icon: string }[] = [
  { value: 'electrical', label: 'Electrical', icon: '⚡' },
  { value: 'hvac', label: 'HVAC', icon: '❄️' },
  { value: 'low_voltage', label: 'Low Voltage', icon: '🔌' },
  { value: 'all', label: 'All trades', icon: '🌐' },
]

export function tradeLabel(t: TradePref | null | undefined): string {
  if (!t || t === 'all') return 'data center trades'
  if (t === 'electrical') return 'electrician'
  if (t === 'hvac') return 'HVAC'
  if (t === 'low_voltage') return 'low voltage'
  return 'data center trades'
}

interface Props {
  source?: string
  defaultTrade?: TradePref
  /** If true, use a compact vertical layout suitable for sticky footer bars. */
  compact?: boolean
  /** Dynamic headline. Defaults to "Get {trade} jobs in your inbox" once trade is picked. */
  headline?: string
  subtext?: string
  /** Called with final outcome status. Lets the host wrap display for the done state. */
  onSuccess?: (status: 'pending' | 'already') => void
}

export function TwoStepAlertForm({
  source,
  defaultTrade,
  compact = false,
  headline,
  subtext,
  onSuccess,
}: Props) {
  const [step, setStep] = useState<'trade' | 'details'>(defaultTrade ? 'details' : 'trade')
  const [trade, setTrade] = useState<TradePref | null>(defaultTrade ?? null)
  const [location, setLocation] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [doneStatus, setDoneStatus] = useState<'pending' | 'already'>('pending')
  const [error, setError] = useState('')

  function pickTrade(t: TradePref) {
    setTrade(t)
    setStep('details')
  }

  function goBack() {
    setStep('trade')
    setError('')
  }

  async function submitWithLocation(finalLocationPref: string) {
    if (!trade) return
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Enter a valid email address.')
      return
    }

    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          // Legacy columns (for existing cron filters)
          category: trade === 'all' ? null : trade,
          location: finalLocationPref === 'all' ? '' : finalLocationPref,
          frequency: 'daily',
          // Explicit preference columns
          trade_pref: trade,
          location_pref: finalLocationPref,
          ...(source && { source }),
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (res.ok && data?.success) {
        try {
          localStorage.setItem('jobAlertSignedUp', 'true')
        } catch {
          /* private mode — ignore */
        }
        const status = data.status === 'already_subscribed' ? 'already' : 'pending'
        setDoneStatus(status)
        setDone(true)
        onSuccess?.(status)
      } else if (res.status === 429) {
        setError(data?.error || 'Too many signups. Try again in an hour.')
      } else {
        setError(data?.error || 'Something went wrong. Try again.')
      }
    } catch {
      setError('Something went wrong. Try again.')
    } finally {
      setLoading(false)
    }
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    const locationPref = location.trim() || 'all'
    void submitWithLocation(locationPref)
  }

  function onSkipLocation(e: React.MouseEvent) {
    e.preventDefault()
    void submitWithLocation('all')
  }

  // ── Done state ────────────────────────────────────────────────────

  if (done) {
    const isAlready = doneStatus === 'already'
    return (
      <div
        className="rounded-xl p-4 text-center"
        style={{
          background: isAlready ? 'var(--yellow-dim)' : 'var(--green-dim)',
          border: `1px solid ${isAlready ? 'var(--yellow-border)' : 'rgba(74,222,128,0.25)'}`,
        }}
      >
        <p
          className="font-semibold text-sm"
          style={{ color: isAlready ? 'var(--yellow)' : 'var(--green)' }}
        >
          {isAlready ? '✓ Already subscribed' : '📬 Check your email to confirm'}
        </p>
        <p className="text-xs mt-1" style={{ color: 'var(--fg-muted)' }}>
          {isAlready
            ? "You're already getting these alerts. Matching jobs keep arriving on your usual schedule."
            : 'We sent a one-click confirmation link. Your first alert arrives after you confirm.'}
        </p>
      </div>
    )
  }

  // ── Step 1 — Trade selection ──────────────────────────────────────

  if (step === 'trade') {
    return (
      <div>
        {headline && (
          <p
            className="text-base font-semibold mb-1"
            style={{ color: 'var(--fg)' }}
          >
            {headline}
          </p>
        )}
        {subtext && (
          <p className="text-sm mb-3" style={{ color: 'var(--fg-muted)' }}>
            {subtext}
          </p>
        )}
        <p
          className="text-xs font-semibold uppercase tracking-widest mb-3"
          style={{ color: 'var(--fg-faint)' }}
        >
          What do you do?
        </p>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: compact
              ? 'repeat(2, minmax(0, 1fr))'
              : 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: '0.5rem',
          }}
        >
          {TRADES.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => pickTrade(t.value)}
              className="transition-colors"
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.3rem',
                padding: '0.9rem 0.5rem',
                minHeight: 68,
                borderRadius: '12px',
                border: '1px solid var(--border-strong)',
                background: 'var(--bg)',
                color: 'var(--fg)',
                fontWeight: 700,
                fontSize: '0.9rem',
                cursor: 'pointer',
              }}
            >
              <span style={{ fontSize: '1.35rem' }} aria-hidden="true">
                {t.icon}
              </span>
              <span>{t.label}</span>
            </button>
          ))}
        </div>
      </div>
    )
  }

  // ── Step 2 — Location + email ─────────────────────────────────────

  const selectedTrade = TRADES.find((t) => t.value === trade)

  return (
    <form onSubmit={onSubmit} style={{ display: 'grid', gap: '0.75rem' }}>
      {/* Trade chip with change link */}
      <div
        className="flex items-center justify-between"
        style={{ marginBottom: '0.25rem' }}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.35rem 0.7rem',
            borderRadius: '999px',
            background: 'var(--yellow-dim)',
            border: '1px solid var(--yellow-border)',
            fontSize: '0.8rem',
            fontWeight: 700,
            color: 'var(--yellow)',
          }}
        >
          <span aria-hidden="true">{selectedTrade?.icon}</span>
          <span>{selectedTrade?.label}</span>
        </div>
        <button
          type="button"
          onClick={goBack}
          className="text-xs"
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--fg-faint)',
            cursor: 'pointer',
            textDecoration: 'underline',
          }}
        >
          change
        </button>
      </div>

      <label style={{ display: 'block' }}>
        <span
          className="text-xs font-semibold uppercase tracking-wide"
          style={{ color: 'var(--fg-faint)' }}
        >
          City or state
        </span>
        <input
          type="text"
          name="location"
          value={location}
          onChange={(e) => {
            setLocation(e.target.value)
            if (error) setError('')
          }}
          placeholder="e.g. Phoenix, Northern Virginia, Texas"
          autoComplete="address-level2"
          className="w-full px-3 py-2.5 rounded-lg text-sm focus:outline-none autofill-bg-dark"
          style={{
            marginTop: '0.25rem',
            background: 'var(--bg)',
            border: '1px solid var(--border-strong)',
            color: 'var(--fg)',
          }}
        />
      </label>

      <label style={{ display: 'block' }}>
        <span
          className="text-xs font-semibold uppercase tracking-wide"
          style={{ color: 'var(--fg-faint)' }}
        >
          Email
        </span>
        <input
          type="email"
          name="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value)
            if (error) setError('')
          }}
          required
          placeholder="your@email.com"
          autoComplete="email"
          className="w-full px-3 py-2.5 rounded-lg text-sm focus:outline-none autofill-bg-dark"
          style={{
            marginTop: '0.25rem',
            background: 'var(--bg)',
            border: `1px solid ${error ? '#F87171' : 'var(--border-strong)'}`,
            color: 'var(--fg)',
          }}
        />
      </label>

      <button
        type="submit"
        disabled={loading}
        className="w-full font-semibold transition-opacity disabled:opacity-60"
        style={{
          padding: '0.85rem 1.25rem',
          borderRadius: '12px',
          background: 'var(--yellow)',
          color: '#0A0A0A',
          fontSize: '0.95rem',
          border: 'none',
          cursor: loading ? 'not-allowed' : 'pointer',
        }}
      >
        {loading ? 'Sending…' : 'Send me jobs'}
      </button>

      <button
        type="button"
        onClick={onSkipLocation}
        disabled={loading}
        className="transition-colors"
        style={{
          background: 'transparent',
          border: 'none',
          color: 'var(--fg-faint)',
          fontSize: '0.8rem',
          cursor: loading ? 'not-allowed' : 'pointer',
          textDecoration: 'underline',
          textAlign: 'center',
          padding: 0,
        }}
      >
        Show me jobs everywhere →
      </button>

      {error && (
        <p className="text-xs" style={{ color: '#F87171', margin: 0 }}>
          {error}
        </p>
      )}
    </form>
  )
}
