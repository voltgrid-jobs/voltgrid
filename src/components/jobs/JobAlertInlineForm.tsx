'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { TwoStepAlertForm, type TradePref } from './TwoStepAlertForm'

/**
 * Public email capture component. Two visual variants wrap the same
 * TwoStepAlertForm:
 *   - variant="homepage" — full-bleed bordered section, for placements
 *     that live between major page sections (homepage, resources,
 *     blog index, /salary-guide-bottom CTA).
 *   - variant="jobs" — compact card, for placements that live inside
 *     an already-framed container (in-content cards on /salary-guide,
 *     /jobs sidebar, post-FAQ callouts).
 *
 * All signups flow through /api/alerts which dual-writes the legacy
 * (category, location) columns AND the explicit (trade_pref,
 * location_pref) columns.
 */
export function JobAlertInlineForm({
  variant = 'homepage',
  defaultTrade,
  subscriberCount,
  source,
  headline,
  subtext,
}: {
  variant?: 'homepage' | 'jobs'
  /** Pre-select a trade and skip step 1. Use when the caller already knows the user's trade (e.g. trade landing pages). */
  defaultTrade?: TradePref
  subscriberCount?: number
  /** Source identifier for funnel analytics (e.g. 'salary-guide-top'). */
  source?: string
  /** Optional heading. Only shown in step 1 of the form. */
  headline?: string
  /** Optional subtitle. Only shown in step 1 of the form. */
  subtext?: string
  /** @deprecated Not used by the 2-step form but kept for backward compat with existing callers. */
  jobId?: string
  /** @deprecated The 2-step form always uses "Send me jobs". */
  buttonLabel?: string
}) {
  const [isAuth, setIsAuth] = useState(false)
  const [authChecking, setAuthChecking] = useState(true)
  const [alreadySignedUp, setAlreadySignedUp] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (window.localStorage?.getItem('jobAlertSignedUp') === 'true') {
      setAlreadySignedUp(true)
      setAuthChecking(false)
      return
    }
    const supabase = createClient()
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setIsAuth(true)
      setAuthChecking(false)
    })
  }, [])

  // While checking auth/localStorage, render nothing to avoid form flash
  if (authChecking) return null

  // Logged-in users manage alerts in their dashboard — no widget needed
  if (isAuth) return null

  // Returning visitor who already signed up — show a compact "already in" state
  if (alreadySignedUp) {
    return (
      <div
        className="rounded-xl p-4 text-center"
        style={{
          background: 'var(--green-dim)',
          border: '1px solid rgba(74,222,128,0.25)',
        }}
      >
        <p className="font-semibold text-sm" style={{ color: 'var(--green)' }}>
          ✓ You&apos;re on the list
        </p>
        <p className="text-xs mt-1" style={{ color: 'var(--fg-muted)' }}>
          Matching jobs arrive daily. Check your inbox.
        </p>
      </div>
    )
  }

  const defaultHeadline = headline ?? 'Get data center trades jobs in your inbox'
  const defaultSubtext =
    subtext ?? 'Filtered to your trade and region. Daily alerts. Unsubscribe anytime.'

  // ── Homepage variant — full section wrapper ───────────────────────
  if (variant === 'homepage') {
    return (
      <section
        style={{
          background: 'var(--bg-subtle)',
          borderTop: '1px solid var(--border)',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
          <div className="max-w-xl">
            <p
              className="text-xs font-semibold tracking-widest uppercase mb-2"
              style={{ color: 'var(--yellow)' }}
            >
              Stay in the loop
            </p>
            <TwoStepAlertForm
              source={source}
              defaultTrade={defaultTrade}
              headline={defaultHeadline}
              subtext={defaultSubtext}
            />
            {subscriberCount != null && subscriberCount > 0 && (
              <p className="text-xs mt-3" style={{ color: 'var(--fg-faint)' }}>
                ✓ Join{' '}
                {subscriberCount >= 1000
                  ? `${Math.floor(subscriberCount / 100) * 100}+`
                  : `${subscriberCount}+`}{' '}
                electricians, HVAC techs, and trades workers already subscribed
              </p>
            )}
          </div>
        </div>
      </section>
    )
  }

  // ── Jobs variant — compact card ──────────────────────────────────
  return (
    <div
      className="rounded-xl p-5"
      style={{ background: 'var(--bg-raised)', border: '1px solid var(--border)' }}
    >
      <TwoStepAlertForm
        source={source}
        defaultTrade={defaultTrade}
        headline={defaultHeadline}
        subtext={defaultSubtext}
      />
      {subscriberCount != null && subscriberCount > 0 && (
        <p className="text-xs mt-3 text-center" style={{ color: 'var(--fg-faint)' }}>
          ✓ Join{' '}
          {subscriberCount >= 1000
            ? `${Math.floor(subscriberCount / 100) * 100}+`
            : `${subscriberCount}+`}{' '}
          trades workers already subscribed
        </p>
      )}
    </div>
  )
}
