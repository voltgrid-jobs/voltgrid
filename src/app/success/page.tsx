import Link from 'next/link'
import type { Metadata } from 'next'
import { stripe } from '@/lib/stripe'
import { createAdminClient } from '@/lib/supabase/admin'

export const metadata: Metadata = {
  title: 'Your Listing is Live',
}

const CATEGORY_LABELS: Record<string, string> = {
  electrical: 'electricians',
  hvac: 'HVAC techs',
  low_voltage: 'low voltage techs',
  construction: 'construction trades workers',
  project_management: 'project managers',
  operations: 'operations techs',
  other: 'trades workers',
}

async function getJobSeekerCount(sessionId: string): Promise<{
  count: number
  trade: string
  location: string
  jobId: string | null
}> {
  const fallback = { count: 0, trade: 'trades workers', location: '', jobId: null }

  try {
    // Try to look up the activated job in Supabase first (webhook may have already run)
    const supabase = createAdminClient()
    const { data: job } = await supabase
      .from('jobs')
      .select('id, category, location')
      .eq('stripe_session_id', sessionId)
      .maybeSingle()

    let category: string | null = null
    let location: string | null = null
    let jobId: string | null = null

    if (job) {
      category = (job as { id: string; category: string; location: string }).category
      location = (job as { id: string; category: string; location: string }).location
      jobId = (job as { id: string; category: string; location: string }).id
    } else {
      // Webhook hasn't run yet — read category/location from Stripe session metadata
      const session = await stripe.checkout.sessions.retrieve(sessionId)
      category = session.metadata?.category ?? null
      location = session.metadata?.location ?? null
    }

    if (!category) return fallback

    const trade = CATEGORY_LABELS[category] ?? 'trades workers'

    // Count active job alerts matching this category
    let query = supabase
      .from('job_alerts')
      .select('*', { count: 'exact', head: true })
      .eq('category', category)
      .eq('is_active', true)

    // Narrow by location if available (match on first keyword)
    if (location) {
      const firstWord = location.split(/[\s,]+/)[0]
      if (firstWord.length > 2) {
        query = query.ilike('location', `%${firstWord}%`)
      }
    }

    const { count } = await query

    return {
      count: count ?? 0,
      trade,
      location: location ?? '',
      jobId,
    }
  } catch {
    return fallback
  }
}

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string; job_id?: string }>
}) {
  const params = await searchParams
  const sessionId = params.session_id || null
  const jobIdParam = params.job_id || null

  const { count, trade, location, jobId: resolvedJobId } = sessionId
    ? await getJobSeekerCount(sessionId)
    : { count: 0, trade: 'trades workers', location: '', jobId: null }

  const jobId = resolvedJobId || jobIdParam

  const locationDisplay = location
    ? location.split(',')[0].trim()
    : null

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-20 text-center">
      {/* 3-step progress — all done */}
      <div className="flex items-center justify-center gap-2 mb-10">
        {[
          { n: 1, label: 'Job Details' },
          { n: 2, label: 'Payment' },
          { n: 3, label: 'Live!' },
        ].map(({ n, label }, i) => (
          <div key={n} className="flex items-center gap-2">
            {i > 0 && (
              <div className="h-px w-8" style={{ background: 'var(--yellow)' }} />
            )}
            <div className="flex items-center gap-1.5">
              <span
                className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                style={{ background: 'var(--yellow)', color: '#0A0A0A' }}
              >
                ✓
              </span>
              <span className="text-xs font-medium hidden sm:block" style={{ color: 'var(--fg-muted)' }}>
                {label}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div
        className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-6 text-2xl"
        style={{ background: 'var(--yellow-dim)', border: '1px solid var(--yellow-border)' }}
      >
        ⚡
      </div>

      <h1
        className="text-3xl font-bold mb-4"
        style={{ color: 'var(--fg)', fontFamily: 'var(--font-display), system-ui, sans-serif' }}
      >
        Your listing is live.
      </h1>

      {count > 0 ? (
        <p className="text-lg mb-4" style={{ color: 'var(--fg-muted)', lineHeight: 1.7 }}>
          We&apos;ve already queued alerts to{' '}
          <strong style={{ color: 'var(--fg)' }}>{count} {trade}</strong>
          {locationDisplay ? (
            <> in <strong style={{ color: 'var(--fg)' }}>{locationDisplay}</strong></>
          ) : null}
          . Check back in 24 hours for applicant activity.
        </p>
      ) : (
        <p className="text-lg mb-4" style={{ color: 'var(--fg-muted)', lineHeight: 1.7 }}>
          Qualified {trade} and other data center specialists can find it now.
          Applications will come directly to your email.
        </p>
      )}

      <p className="text-sm mb-10" style={{ color: 'var(--fg-faint)' }}>
        Your listing will remain active for 30 days. A confirmation was sent to your email.
      </p>

      {/* Stats callout if we have a count */}
      {count > 0 && (
        <div
          className="rounded-2xl p-5 mb-8 flex items-center gap-4 text-left"
          style={{ background: 'var(--yellow-dim)', border: '1px solid var(--yellow-border)' }}
        >
          <span className="text-3xl font-bold flex-shrink-0" style={{ color: 'var(--yellow)' }}>
            {count}
          </span>
          <div>
            <p className="text-sm font-semibold" style={{ color: 'var(--fg)' }}>
              {trade} will be notified
            </p>
            <p className="text-xs" style={{ color: 'var(--fg-faint)' }}>
              Active job alert subscribers matching your listing&apos;s trade
              {locationDisplay ? ` in ${locationDisplay}` : ''}.
            </p>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 justify-center mb-12">
        {jobId ? (
          <Link
            href={`/jobs/${jobId}`}
            className="px-8 py-3 rounded-xl font-semibold transition-opacity"
            style={{ background: 'var(--yellow)', color: '#0A0A0A' }}
          >
            View Your Listing →
          </Link>
        ) : (
          <Link
            href="/jobs"
            className="px-8 py-3 rounded-xl font-semibold transition-opacity"
            style={{ background: 'var(--yellow)', color: '#0A0A0A' }}
          >
            Browse All Jobs
          </Link>
        )}
        <Link
          href="/post-job"
          className="px-8 py-3 rounded-xl font-semibold transition-colors"
          style={{ border: '1px solid var(--border)', color: 'var(--fg-muted)' }}
        >
          Post Another Job
        </Link>
      </div>

      <div
        className="rounded-2xl p-6 text-left"
        style={{ background: 'var(--bg-raised)', border: '1px solid var(--border)' }}
      >
        <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--fg-faint)' }}>
          Questions?
        </p>
        <p className="text-sm" style={{ color: 'var(--fg-muted)', lineHeight: 1.7 }}>
          Reach us at{' '}
          <a
            href="mailto:hello@voltgridjobs.com"
            className="transition-colors"
            style={{ color: 'var(--yellow)' }}
          >
            hello@voltgridjobs.com
          </a>
          {' '}— we typically respond within a few hours.
        </p>
      </div>
    </div>
  )
}
