'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { TwoStepAlertForm, type TradePref } from './TwoStepAlertForm'

const DISMISSED_KEY = 'vg_sticky_alert_dismissed'
const SIGNED_UP_KEY = 'jobAlertSignedUp'
const SCROLL_THRESHOLD = 0.25 // show at 25% scroll

/**
 * Sticky footer CTA with two states:
 *   1. Collapsed bar — single-line teaser + "Get started" button.
 *      Shown after 25% scroll.
 *   2. Expanded panel — the full 2-step trade + location form.
 *      Triggered by clicking the teaser.
 *
 * Hidden for logged-in users, already-subscribed visitors, and
 * anyone who dismissed it (persistent).
 */
export function StickyFooterAlertCTA({
  source = 'jobs-sticky-footer',
  defaultCategory = null,
}: {
  source?: string
  defaultCategory?: string | null
}) {
  const [visible, setVisible] = useState(false)
  const [dismissed, setDismissed] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [suppressed, setSuppressed] = useState(true) // default suppressed until auth check
  const [doneMessage, setDoneMessage] = useState<null | 'pending' | 'already'>(null)

  // Map legacy defaultCategory prop (comes from /jobs page when a
  // category filter is active) to the new TradePref type.
  const defaultTrade: TradePref | undefined = (() => {
    if (!defaultCategory) return undefined
    if (defaultCategory === 'electrical' || defaultCategory === 'hvac' || defaultCategory === 'low_voltage') {
      return defaultCategory
    }
    return undefined
  })()

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
    setExpanded(false)
    try {
      window.localStorage?.setItem(DISMISSED_KEY, '1')
    } catch {
      /* ignore */
    }
  }

  if (suppressed || dismissed || !visible) return null

  // ── Expanded panel ──────────────────────────────────────────────

  if (expanded) {
    return (
      <>
        <div
          aria-hidden="true"
          onClick={() => setExpanded(false)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 39,
            background: 'rgba(0,0,0,0.55)',
            backdropFilter: 'blur(2px)',
          }}
        />
        <div
          role="dialog"
          aria-label="Get data center trades job alerts"
          style={{
            position: 'fixed',
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 40,
            background: 'var(--bg-raised)',
            borderTop: '1px solid var(--yellow-border)',
            boxShadow: '0 -12px 40px rgba(0,0,0,0.5)',
            maxHeight: '92dvh',
            overflowY: 'auto',
            borderTopLeftRadius: '20px',
            borderTopRightRadius: '20px',
          }}
        >
          <div className="max-w-lg mx-auto px-4 sm:px-6 py-5">
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '0.75rem',
              }}
            >
              <p
                style={{
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: 'var(--yellow)',
                  margin: 0,
                }}
              >
                Daily jobs + per diem alerts
              </p>
              <button
                type="button"
                onClick={doneMessage ? dismiss : () => setExpanded(false)}
                aria-label="Close"
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: '8px',
                  background: 'transparent',
                  color: 'var(--fg-faint)',
                  border: '1px solid var(--border)',
                  fontSize: '0.95rem',
                  cursor: 'pointer',
                }}
              >
                ✕
              </button>
            </div>
            <TwoStepAlertForm
              source={source}
              defaultTrade={defaultTrade}
              compact
              headline="Get matching jobs in your inbox"
              subtext="Data center roles filtered to your trade and region. Weekly digest, unsubscribe anytime."
              onSuccess={(status) => setDoneMessage(status)}
            />
          </div>
        </div>
      </>
    )
  }

  // ── Collapsed bar ────────────────────────────────────────────────

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
        <div style={{ flex: '1 1 220px', minWidth: 0 }}>
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
            Electrician, HVAC, low voltage — filtered to your market.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setExpanded(true)}
          style={{
            padding: '0.6rem 1.1rem',
            borderRadius: '10px',
            background: 'var(--yellow)',
            color: '#0a0a0a',
            fontWeight: 700,
            fontSize: '0.85rem',
            border: 'none',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
          }}
        >
          Get started →
        </button>
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
      </div>
    </div>
  )
}
