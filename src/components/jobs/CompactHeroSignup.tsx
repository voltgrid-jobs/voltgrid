'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

// ─────────────────────────────────────────────────────────────────────
// CompactHeroSignup
//
// Single-step 3-field form used directly under the homepage hero CTA
// and in other high-intent placements where a 2-step flow would add
// too much friction. Trade dropdown prefilled to Electrical, ZIP
// code, email. Submits straight to /api/alerts with trade_pref and
// location_pref populated from the form values.
//
// Not used on the salary guide or sticky footer — those still use
// the 2-step form.
// ─────────────────────────────────────────────────────────────────────

type Trade = 'electrical' | 'hvac' | 'low_voltage' | 'all'

const TRADES: { value: Trade; label: string }[] = [
  { value: 'electrical', label: 'Electrical' },
  { value: 'hvac', label: 'HVAC' },
  { value: 'low_voltage', label: 'Low Voltage' },
  { value: 'all', label: 'All trades' },
]

interface Props {
  /** Analytics source tag. Defaults to 'homepage-hero'. */
  source?: string
  /** Trade prefilled in the dropdown. Defaults to 'electrical'. */
  defaultTrade?: Trade
  /** Optional trust line rendered under the form. */
  trustLine?: string
  /** Optional headline override. */
  headline?: string
  /** Optional subtext override. */
  subtext?: string
}

export function CompactHeroSignup({
  source = 'homepage-hero',
  defaultTrade = 'electrical',
  trustLine,
  headline,
  subtext,
}: Props) {
  const [trade, setTrade] = useState<Trade>(defaultTrade)
  const [zip, setZip] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [doneStatus, setDoneStatus] = useState<'pending' | 'already'>('pending')
  const [error, setError] = useState('')
  const [isAuth, setIsAuth] = useState(false)
  const [authChecking, setAuthChecking] = useState(true)

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (window.localStorage?.getItem('jobAlertSignedUp') === 'true') {
      setDone(true)
      setAuthChecking(false)
      return
    }
    const supabase = createClient()
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setIsAuth(true)
      setAuthChecking(false)
    })
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Enter a valid email address.')
      return
    }
    // ZIP is optional — if empty, we treat it as "all locations"
    const trimmedZip = zip.trim()
    if (trimmedZip && !/^\d{5}(-\d{4})?$/.test(trimmedZip)) {
      setError('Enter a 5-digit US ZIP code or leave it blank.')
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
          // Legacy columns for the existing cron filters
          category: trade === 'all' ? null : trade,
          location: trimmedZip || '',
          frequency: 'daily',
          // Explicit preference columns
          trade_pref: trade,
          location_pref: trimmedZip || 'all',
          source,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (res.ok && data?.success) {
        try {
          localStorage.setItem('jobAlertSignedUp', 'true')
        } catch {
          /* private mode — ignore */
        }
        setDoneStatus(data.status === 'already_subscribed' ? 'already' : 'pending')
        setDone(true)
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

  if (authChecking) return null
  if (isAuth) return null

  if (done) {
    const isAlready = doneStatus === 'already'
    return (
      <div
        className="rounded-2xl p-5"
        style={{
          background: isAlready ? 'var(--yellow-dim)' : 'var(--green-dim)',
          border: `1px solid ${isAlready ? 'var(--yellow-border)' : 'rgba(74,222,128,0.25)'}`,
        }}
      >
        <p
          className="font-semibold"
          style={{ color: isAlready ? 'var(--yellow)' : 'var(--green)' }}
        >
          {isAlready ? '✓ Already subscribed' : '📬 Check your email to confirm'}
        </p>
        <p className="text-sm mt-1" style={{ color: 'var(--fg-muted)' }}>
          {isAlready
            ? "You're already getting these alerts. Matching jobs keep arriving daily."
            : 'We sent a one-click confirmation link. Your first alert arrives after you confirm.'}
        </p>
      </div>
    )
  }

  return (
    <div
      className="rounded-2xl p-5 sm:p-6"
      style={{
        background: 'var(--bg-raised)',
        border: '1px solid var(--border)',
      }}
    >
      {headline && (
        <p
          className="text-base sm:text-lg font-bold mb-1"
          style={{ color: 'var(--fg)' }}
        >
          {headline}
        </p>
      )}
      {subtext && (
        <p className="text-sm mb-4" style={{ color: 'var(--fg-muted)' }}>
          {subtext}
        </p>
      )}

      <form
        onSubmit={handleSubmit}
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: '0.6rem',
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(130px, auto) minmax(100px, 1fr)',
            gap: '0.6rem',
          }}
        >
          <label style={{ display: 'block' }}>
            <span className="sr-only">Trade</span>
            <select
              value={trade}
              onChange={(e) => setTrade(e.target.value as Trade)}
              className="w-full px-3 py-2.5 rounded-lg text-sm focus:outline-none"
              style={{
                background: 'var(--bg)',
                border: '1px solid var(--border-strong)',
                color: 'var(--fg)',
                fontWeight: 600,
              }}
            >
              {TRADES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </label>

          <label style={{ display: 'block' }}>
            <span className="sr-only">ZIP code</span>
            <input
              type="text"
              inputMode="numeric"
              name="postal_code"
              autoComplete="postal-code"
              maxLength={10}
              placeholder="ZIP code"
              value={zip}
              onChange={(e) => {
                setZip(e.target.value)
                if (error) setError('')
              }}
              className="w-full px-3 py-2.5 rounded-lg text-sm focus:outline-none autofill-bg-dark"
              style={{
                background: 'var(--bg)',
                border: '1px solid var(--border-strong)',
                color: 'var(--fg)',
              }}
            />
          </label>
        </div>

        <label style={{ display: 'block' }}>
          <span className="sr-only">Email</span>
          <input
            type="email"
            name="email"
            autoComplete="email"
            required
            placeholder="your@email.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              if (error) setError('')
            }}
            className="w-full px-3 py-2.5 rounded-lg text-sm focus:outline-none autofill-bg-dark"
            style={{
              background: 'var(--bg)',
              border: `1px solid ${error ? '#F87171' : 'var(--border-strong)'}`,
              color: 'var(--fg)',
            }}
          />
        </label>

        <button
          type="submit"
          disabled={loading}
          className="w-full font-bold transition-opacity disabled:opacity-60"
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
          {loading ? 'Sending…' : 'Send Me Jobs'}
        </button>
      </form>

      {error && (
        <p className="text-xs mt-2" style={{ color: '#F87171' }}>
          {error}
        </p>
      )}

      {trustLine && (
        <p className="text-xs mt-3" style={{ color: 'var(--fg-faint)' }}>
          ✓ {trustLine}
        </p>
      )}
    </div>
  )
}
