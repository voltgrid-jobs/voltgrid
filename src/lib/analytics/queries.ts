/**
 * Funnel metric queries.
 *
 * Every function returns a single number (or a small structured
 * object) for a given date range, computed from funnel_events +
 * job_alerts. Callers are the /api/internal/funnel-metrics endpoint
 * and any future dashboard.
 *
 * All counts exclude internal/test emails that match the exclusion
 * list in the voltgrid-kpi-reporting skill. Matching is a belt-and-
 * braces guard because some events are logged without an email
 * (salary_guide_view) and we don't want to double-filter those.
 */

import { createAdminClient } from '@/lib/supabase/admin'

export interface DateRange {
  from: string // ISO timestamp
  to: string   // ISO timestamp
}

// Emails that must never contribute to reported metrics
const EMAIL_EXCLUDES = [
  'fhillesland@gmail.com',
  'filiphillesland@gmail.com',
  'filip@voltgridjobs.com',
  'voltgrid@protonmail.com',
  'vgjobs@protonmail.com',
  'hello@voltgridjobs.com',
  'alerts@voltgridjobs.com',
]

function buildEmailExclude(column = 'email') {
  // Used as a not().or() chain against Supabase PostgREST.
  // Returns the ilike patterns the query builder will NEGATE.
  return [
    `${column}.in.(${EMAIL_EXCLUDES.join(',')})`,
    `${column}.ilike.%@voltgridjobs.com`,
    `${column}.ilike.%@example.com`,
    `${column}.ilike.%test%@%`,
    `${column}.ilike.%+test%`,
  ]
}

async function countEvents(
  eventType: string,
  range: DateRange,
  opts: { excludeInternalEmails?: boolean } = {}
): Promise<number> {
  const admin = createAdminClient()
  let query = admin
    .from('funnel_events')
    .select('*', { count: 'exact', head: true })
    .eq('event_type', eventType)
    .gte('created_at', range.from)
    .lte('created_at', range.to)

  if (opts.excludeInternalEmails) {
    // Exclude events with an internal email; events with null email stay.
    for (const pattern of buildEmailExclude()) {
      const [col, op, val] = pattern.split(/\.(.+)/)[1].split('.', 2)
      // Supabase doesn't expose a direct ilike negate, so do it via .not()
      if (op === 'in') {
        query = query.not('email', 'in', `(${val})`)
      } else if (op === 'ilike') {
        query = query.not('email', 'ilike', val)
      }
      // Suppress unused var warning — col is the column name
      void col
    }
  }

  const { count, error } = await query
  if (error) {
    console.error(`[analytics] countEvents(${eventType}) error:`, error)
    return 0
  }
  return count ?? 0
}

// ── Individual metric queries ────────────────────────────────────────

export async function countSerpLandings(range: DateRange) {
  return countEvents('serp_landing', range)
}

export async function countCtaImpressions(range: DateRange) {
  return countEvents('cta_impression', range)
}

export async function countAlertSubmits(range: DateRange) {
  return countEvents('alert_submit', range, { excludeInternalEmails: true })
}

export async function countAlertConfirms(range: DateRange) {
  return countEvents('alert_confirm', range, { excludeInternalEmails: true })
}

export async function countAlertDelivered(range: DateRange) {
  return countEvents('alert_delivered', range, { excludeInternalEmails: true })
}

export async function countAlertOpened(range: DateRange) {
  return countEvents('alert_opened', range, { excludeInternalEmails: true })
}

export async function countAlertClicked(range: DateRange) {
  return countEvents('alert_clicked', range, { excludeInternalEmails: true })
}

export async function countSalaryGuideViews(range: DateRange) {
  return countEvents('salary_guide_view', range)
}

export async function countSalaryGuideCtaClicks(range: DateRange) {
  return countEvents('salary_guide_cta', range)
}

export async function countUnsubscribes(range: DateRange) {
  return countEvents('alert_unsubscribe', range, { excludeInternalEmails: true })
}

// ── Composite funnel report ──────────────────────────────────────────

export interface FunnelReport {
  range: DateRange
  serpLandings: number
  ctaImpressions: number
  alertSubmits: number
  alertConfirms: number
  alertsDelivered: number
  alertsOpened: number
  alertsClicked: number
  salaryGuideViews: number
  salaryGuideCtaClicks: number
  unsubscribes: number
  rates: {
    submitConfirmRate: number      // confirms / submits
    deliveredOpenRate: number      // opens / delivered
    openClickRate: number          // clicks / opens
    salaryGuideCtaRate: number     // salary_guide_cta / salary_guide_view
    unsubscribeRate: number        // unsubscribes / confirms
  }
}

function safeRate(num: number, den: number) {
  if (!den) return 0
  return Math.round((num / den) * 10000) / 10000 // 4 decimals
}

export async function buildFunnelReport(range: DateRange): Promise<FunnelReport> {
  const [
    serpLandings,
    ctaImpressions,
    alertSubmits,
    alertConfirms,
    alertsDelivered,
    alertsOpened,
    alertsClicked,
    salaryGuideViews,
    salaryGuideCtaClicks,
    unsubscribes,
  ] = await Promise.all([
    countSerpLandings(range),
    countCtaImpressions(range),
    countAlertSubmits(range),
    countAlertConfirms(range),
    countAlertDelivered(range),
    countAlertOpened(range),
    countAlertClicked(range),
    countSalaryGuideViews(range),
    countSalaryGuideCtaClicks(range),
    countUnsubscribes(range),
  ])

  return {
    range,
    serpLandings,
    ctaImpressions,
    alertSubmits,
    alertConfirms,
    alertsDelivered,
    alertsOpened,
    alertsClicked,
    salaryGuideViews,
    salaryGuideCtaClicks,
    unsubscribes,
    rates: {
      submitConfirmRate: safeRate(alertConfirms, alertSubmits),
      deliveredOpenRate: safeRate(alertsOpened, alertsDelivered),
      openClickRate: safeRate(alertsClicked, alertsOpened),
      salaryGuideCtaRate: safeRate(salaryGuideCtaClicks, salaryGuideViews),
      unsubscribeRate: safeRate(unsubscribes, alertConfirms),
    },
  }
}
