'use client'

import { useEffect } from 'react'

/**
 * Fire-and-forget client tracker for the salary guide page.
 * Logs a salary_guide_view event on mount, a serp_landing event
 * if the referrer looks like a search engine, and exposes a data
 * attribute that the inline JobAlertInlineForm CTA click handler
 * can use to log salary_guide_cta events when the user clicks
 * the alert signup button on this page.
 */

function looksLikeSerp(referrer: string | null): boolean {
  if (!referrer) return false
  try {
    const host = new URL(referrer).hostname
    return /google\.|bing\.|duckduckgo\.|yahoo\.|ecosia\.|brave\.|kagi\./.test(host)
  } catch {
    return false
  }
}

async function post(eventType: string, metadata?: Record<string, unknown>) {
  try {
    await fetch('/api/analytics/event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event_type: eventType,
        source_page: '/salary-guide',
        metadata,
      }),
      keepalive: true,
    })
  } catch {
    // Swallow — analytics must never break the page
  }
}

export function SalaryGuideTracker() {
  useEffect(() => {
    // Page view
    post('salary_guide_view')

    // Search-engine referral (fires once on first load with matching referrer)
    if (looksLikeSerp(document.referrer)) {
      post('serp_landing', { from: document.referrer })
    }

    // CTA click tracking — any link within the page that points to
    // /start, /jobs, or /api/alerts is a conversion candidate. We also
    // listen for form submits on the inline job alert form.
    function onClick(e: MouseEvent) {
      const target = e.target as HTMLElement | null
      if (!target) return
      const anchor = target.closest('a') as HTMLAnchorElement | null
      if (anchor && anchor.href) {
        try {
          const url = new URL(anchor.href)
          if (url.pathname === '/jobs' || url.pathname === '/start' || url.pathname.startsWith('/jobs?')) {
            post('salary_guide_cta', { target: url.pathname })
          }
        } catch {
          /* ignore */
        }
      }
    }

    function onSubmit(e: SubmitEvent) {
      const form = e.target as HTMLFormElement | null
      if (!form) return
      // Only care about forms that POST to /api/alerts — heuristic
      const hasEmailInput = form.querySelector('input[type="email"]')
      if (hasEmailInput) {
        post('salary_guide_cta', { target: 'alert_signup' })
      }
    }

    document.addEventListener('click', onClick)
    document.addEventListener('submit', onSubmit)
    return () => {
      document.removeEventListener('click', onClick)
      document.removeEventListener('submit', onSubmit)
    }
  }, [])

  return null
}
