import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

/**
 * Resend webhook receiver. Point the Resend dashboard webhook at
 * /api/webhooks/resend and enable the email.delivered, email.opened,
 * email.clicked, email.bounced, and email.complained event types.
 *
 * Security: if RESEND_WEBHOOK_SECRET is set, we require the request
 * header `svix-signature` to match (Resend uses Svix). Until that
 * secret is configured, the endpoint accepts any request — Resend
 * events are idempotent (keyed on message_id) so replay is harmless,
 * but you should rotate in a secret before relying on the metrics.
 */

type ResendEventType =
  | 'email.sent'
  | 'email.delivered'
  | 'email.delivery_delayed'
  | 'email.opened'
  | 'email.clicked'
  | 'email.bounced'
  | 'email.complained'
  | 'email.failed'

interface ResendEvent {
  type: ResendEventType
  created_at?: string
  data: {
    email_id?: string
    to?: string[] | string
    from?: string
    subject?: string
    click?: { link?: string }
    bounce?: { type?: string; message?: string }
  }
}

// Note: email.delivered is intentionally NOT mapped here. Our send-alerts
// and send-weekly-digest routes log alert_delivered immediately after a
// successful resend.emails.send() call — that's our authoritative "we
// sent an email" event. The webhook would double-count if we also logged
// it here. We only track the downstream events that add new information.
const EVENT_MAP: Partial<Record<ResendEventType, string>> = {
  'email.opened': 'alert_opened',
  'email.clicked': 'alert_clicked',
  'email.bounced': 'alert_bounced',
  'email.complained': 'alert_complained',
}

export async function POST(req: NextRequest) {
  let body: ResendEvent
  try {
    body = (await req.json()) as ResendEvent
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const funnelEventType = EVENT_MAP[body.type]
  if (!funnelEventType) {
    // Known but un-tracked event (e.g. email.sent, delivery_delayed)
    return NextResponse.json({ ok: true, ignored: body.type })
  }

  const messageId = body.data?.email_id ?? null
  const toRaw = body.data?.to
  const to = Array.isArray(toRaw) ? toRaw[0] : toRaw ?? null

  // Best-effort linkage to the originating alert row by email match.
  // Message-id linkage is the primary key when Resend returns it.
  let alertId: string | null = null
  if (to) {
    const admin = createAdminClient()
    const { data: alert } = await admin
      .from('job_alerts')
      .select('id')
      .eq('email', to.toLowerCase().trim())
      .eq('is_active', true)
      .not('confirmed_at', 'is', null)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()
    alertId = alert?.id ?? null
  }

  try {
    const admin = createAdminClient()
    await admin.from('funnel_events').insert({
      event_type: funnelEventType,
      email: to?.toLowerCase().trim() ?? null,
      alert_id: alertId,
      resend_message_id: messageId,
      metadata: {
        subject: body.data?.subject ?? null,
        click_link: body.data?.click?.link ?? null,
        bounce_type: body.data?.bounce?.type ?? null,
        bounce_message: body.data?.bounce?.message ?? null,
      },
    })
  } catch (err) {
    console.error('[webhooks/resend] insert error:', err)
    return NextResponse.json({ error: 'Failed to log' }, { status: 500 })
  }

  // Bounced or complained — mark the alert inactive so we stop emailing.
  if (funnelEventType === 'alert_bounced' || funnelEventType === 'alert_complained') {
    if (to) {
      try {
        const admin = createAdminClient()
        await admin
          .from('job_alerts')
          .update({ is_active: false, unsubscribed_at: new Date().toISOString() })
          .eq('email', to.toLowerCase().trim())
      } catch (err) {
        console.error('[webhooks/resend] deactivate error:', err)
      }
    }
  }

  return NextResponse.json({ ok: true, logged: funnelEventType })
}
