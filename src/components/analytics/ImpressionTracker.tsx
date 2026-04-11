'use client'

import { useEffect, useRef } from 'react'

/**
 * Fires a single cta_impression event when the wrapped element
 * enters the viewport. Designed for email capture placements so
 * we can measure impression-to-submit conversion per placement.
 *
 * - Uses IntersectionObserver — zero scroll listeners
 * - Fires at most once per mount (per React instance)
 * - Debounced via a localStorage day-key so repeat visitors don't
 *   inflate impression counts on the same day
 * - Fire-and-forget; errors are swallowed
 */
export function ImpressionTracker({
  source,
  children,
  threshold = 0.5,
}: {
  source: string
  children: React.ReactNode
  threshold?: number
}) {
  const ref = useRef<HTMLDivElement | null>(null)
  const fired = useRef(false)

  useEffect(() => {
    if (!ref.current || typeof IntersectionObserver === 'undefined') return

    // Per-day dedupe so refreshing the page doesn't re-fire
    const dayKey = `vg_imp_${source}_${new Date().toISOString().slice(0, 10)}`
    if (typeof window !== 'undefined' && window.localStorage?.getItem(dayKey) === '1') {
      fired.current = true
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && !fired.current) {
            fired.current = true
            try {
              window.localStorage?.setItem(dayKey, '1')
            } catch {
              /* private mode / storage full — ignore */
            }
            void fetch('/api/analytics/event', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                event_type: 'cta_impression',
                source_page: window.location.pathname,
                metadata: { source },
              }),
              keepalive: true,
            }).catch(() => {
              /* analytics must never break the page */
            })
            observer.disconnect()
          }
        }
      },
      { threshold }
    )
    observer.observe(ref.current)
    return () => observer.disconnect()
  }, [source, threshold])

  return <div ref={ref}>{children}</div>
}
