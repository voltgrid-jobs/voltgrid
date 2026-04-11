'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

const DISMISSED_KEY = 'vg_sticky_alert_dismissed'
const SIGNED_UP_KEY = 'jobAlertSignedUp'
const SCROLL_THRESHOLD = 0.25 // 25% of document height

/**
 * Sticky footer CTA that appears after 25% scroll on a page.
 * Single-field email capture. Dismissible (persisted in localStorage).
 * Hidden for logged-in users, already-subscribed users, and on the
 * job alert confirmation pages.
 *
 * Uses /api/alerts directly rather than rendering a nested
 * JobAlertInlineForm so the layout can stay truly single-row.
 */
export function StickyFooterAlertCTA({
  source = 'sticky-footer',
  defaultCategory = null,
}: {
  source?: string
  defaultCategory?: string | null
}) {
  const [visible, setVisible] = useState(false)
  const [dismissed, setDismissed] = useState(false)
  const [suppressed, setSuppressed] = useState(true) // default suppressed until auth check
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  // Initial suppression check (auth + localStorage flags)
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (window.localStorage?.getItem(DISMISSED_KEY) === '1') {
      setDismissed(true)
      setSuppressed(true)
      return
    }
    if (window.localStorage?.getItem(SIGNED_UP_KEY) === 'true') {
      setSuppressed(true)
      return
    }
    const supabase = createClient()
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSuppressed(!!session)
    })
  }, [])

  // Scroll listener — show at 25% scroll, hide again if they scroll back to top
  useEffect(() => {
    if (suppressed || dismissed) return
    function onScroll() {
      if (typeof window === 'undefined') return
      const scrolled = window.scrollY + window.innerHeight
      const threshold = document.documentElement.scrollHeight * SCROLL_THRESHOLD
      setVisible(scrolled >= threshold)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [suppressed, dismissed])

  function dismiss() {
    setDismissed(true)
    setVisible(false)
    try {
      window.localStorage?.setItem(DISMISSED_KEY, '1')
    } catch {
      /* ignore */
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Enter a valid email.')
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
          category: defaultCategory,
          frequency: 'daily',
          source,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (res.ok && data?.success) {
        try {
          window.localStorage?.setItem(SIGNED_UP_KEY, 'true')
        } catch {
          /* ignore */
        }
        setDone(true)
      } else if (res.status === 429) {
        setError(data?.error || 'Too many signups. Try later.')
      } else {
        setError(data?.error || 'Something went wrong.')
      }
    } catch {
      setError('Connection error. Try again.')
    } finally {
      setLoading(false)
    }
  }

  if (suppressed || dismissed || !visible) return null

  return (
    <div
      role="region"
      aria-label="Sign up for job alerts"
      style={{
        position: 'fixed',
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 40,
        background: 'var(--bg-subtle)',
        borderTop: '1px solid var(--yellow-border)',
        boxShadow: '0 -4px 16px rgba(0,0,0,0.4)',
      }}
    >
      <div
        className="max-w-6xl mx-auto px-4 sm:px-6 py-3 sm:py-4"
        style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}
      >
        {done ? (
          <>
            <span style={{ fontSize: '0.9rem', color: 'var(--green, #4ade80)', fontWeight: 600 }}>
              📬 Check your email to confirm
            </span>
            <span style={{ fontSize: '0.8rem', color: 'var(--fg-muted)' }}>
              First alert arrives after you click the link.
            </span>
            <button
              type="button"
              onClick={dismiss}
              style={{
                marginLeft: 'auto',
                padding: '0.4rem 0.75rem',
                borderRadius: '8px',
                background: 'transparent',
                color: 'var(--fg-faint)',
                border: '1px solid var(--border)',
                fontSize: '0.8rem',
                cursor: 'pointer',
              }}
            >
              Close
            </button>
          </>
        ) : (
          <>
            <div style={{ flex: '1 1 260px', minWidth: 0 }}>
              <p
                style={{
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  color: 'var(--yellow)',
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  margin: 0,
                }}
              >
                Daily jobs + per diem alerts
              </p>
              <p
                style={{
                  fontSize: '0.85rem',
                  color: 'var(--fg-muted)',
                  margin: '0.15rem 0 0 0',
                  lineHeight: 1.4,
                }}
              >
                Data center electrician, HVAC, and low voltage roles.
              </p>
            </div>
            <form
              onSubmit={handleSubmit}
              style={{ display: 'flex', gap: '0.5rem', flex: '2 1 320px', minWidth: 0 }}
            >
              <label htmlFor="sticky-alert-email" className="sr-only">
                Email address
              </label>
              <input
                id="sticky-alert-email"
                type="email"
                name="email"
                autoComplete="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  if (error) setError('')
                }}
                className="autofill-bg-dark"
                style={{
                  flex: 1,
                  minWidth: 0,
                  padding: '0.6rem 0.85rem',
                  borderRadius: '10px',
                  border: `1px solid ${error ? '#F87171' : 'var(--border-strong)'}`,
                  background: 'var(--bg)',
                  color: 'var(--fg)',
                  fontSize: '0.9rem',
                  outline: 'none',
                }}
              />
              <button
                type="submit"
                disabled={loading}
                style={{
                  padding: '0.6rem 1.1rem',
                  borderRadius: '10px',
                  background: 'var(--yellow)',
                  color: '#0a0a0a',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  border: 'none',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.6 : 1,
                  whiteSpace: 'nowrap',
                }}
              >
                {loading ? '…' : 'Send me jobs'}
              </button>
            </form>
            <button
              type="button"
              onClick={dismiss}
              aria-label="Dismiss"
              style={{
                padding: '0.4rem 0.6rem',
                borderRadius: '8px',
                background: 'transparent',
                color: 'var(--fg-faint)',
                border: '1px solid var(--border)',
                fontSize: '0.85rem',
                cursor: 'pointer',
              }}
            >
              ✕
            </button>
          </>
        )}
      </div>
      {error && (
        <p
          className="max-w-6xl mx-auto px-4 sm:px-6"
          style={{ fontSize: '0.75rem', color: '#F87171', paddingBottom: '0.5rem', margin: 0 }}
        >
          {error}
        </p>
      )}
    </div>
  )
}
