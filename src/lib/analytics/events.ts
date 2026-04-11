/**
 * Server-side funnel event logger.
 *
 * Every write uses the admin (service role) Supabase client so it
 * bypasses RLS. Call from API routes, not from client components.
 * Errors are logged and swallowed — an analytics write must never
 * break a user-visible action.
 */

import { createAdminClient } from '@/lib/supabase/admin'

export type FunnelEventType =
  | 'alert_submit'
  | 'alert_confirm'
  | 'alert_unsubscribe'
  | 'alert_delivered'
  | 'alert_opened'
  | 'alert_clicked'
  | 'alert_bounced'
  | 'alert_complained'
  | 'salary_guide_view'
  | 'salary_guide_cta'
  | 'serp_landing'
  | 'cta_impression'

interface LogArgs {
  eventType: FunnelEventType
  email?: string | null
  alertId?: string | null
  sourcePage?: string | null
  referrer?: string | null
  resendMessageId?: string | null
  metadata?: Record<string, unknown> | null
}

export async function logFunnelEvent(args: LogArgs): Promise<void> {
  try {
    const admin = createAdminClient()
    await admin.from('funnel_events').insert({
      event_type: args.eventType,
      email: args.email ?? null,
      alert_id: args.alertId ?? null,
      source_page: args.sourcePage ?? null,
      referrer: args.referrer ?? null,
      resend_message_id: args.resendMessageId ?? null,
      metadata: args.metadata ?? null,
    })
  } catch (err) {
    console.error('[analytics] logFunnelEvent error:', err)
    // Intentionally swallow — never block a user-facing action.
  }
}
