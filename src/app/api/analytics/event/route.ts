import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

/**
 * Client-safe event logger. Accepts POST with { event_type, metadata }.
 * Only a narrow allowlist of event types is accepted — anything else
 * is rejected with 400. Server-side events (alert_confirm, Resend
 * webhooks) must go through the API routes that own them.
 */
const ALLOWED_CLIENT_EVENTS = new Set([
  'salary_guide_view',
  'salary_guide_cta',
  'serp_landing',
  'cta_impression',
])

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const eventType = typeof body.event_type === 'string' ? body.event_type : null
  if (!eventType || !ALLOWED_CLIENT_EVENTS.has(eventType)) {
    return NextResponse.json({ error: 'Invalid event_type' }, { status: 400 })
  }

  const sourcePage = typeof body.source_page === 'string' ? body.source_page : null
  const metadata = (body.metadata && typeof body.metadata === 'object') ? body.metadata : null
  const referrer = req.headers.get('referer')

  try {
    const admin = createAdminClient()
    await admin.from('funnel_events').insert({
      event_type: eventType,
      source_page: sourcePage,
      referrer,
      metadata,
    })
  } catch (err) {
    console.error('[analytics/event] insert error:', err)
    return NextResponse.json({ error: 'Failed to log' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
