import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { Resend } from 'resend'
import { buildWelcomeEmail } from '@/lib/emails/alerts'

/**
 * One-off backfill: confirm all unconfirmed alerts and send welcome emails.
 * Also triggers a manual alert send for all confirmed subscribers.
 * Protected by OpsGrid API key.
 *
 * GET /api/internal/backfill-alerts
 */
export async function GET(req: NextRequest) {
  const apiKey = req.headers.get('x-api-key')
  if (apiKey !== '5323c76261c136d86d2df19d8ac890647dd079d54a5999c78ac279cd87752049') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const admin = createAdminClient()
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://voltgridjobs.com'
  const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

  // 1. Get all alerts
  const { data: allAlerts } = await admin
    .from('job_alerts')
    .select('id, email, category, confirmed_at, is_active, confirmation_token, trade_pref, last_sent_at')
    .eq('is_active', true)

  if (!allAlerts) return NextResponse.json({ error: 'No alerts found' })

  let confirmed = 0
  let welcomesSent = 0
  const details: { email: string; wasConfirmed: boolean; welcomeSent: boolean }[] = []

  for (const alert of allAlerts) {
    const wasAlreadyConfirmed = !!alert.confirmed_at

    // Auto-confirm any unconfirmed alerts
    if (!alert.confirmed_at) {
      await admin
        .from('job_alerts')
        .update({ confirmed_at: new Date().toISOString() })
        .eq('id', alert.id)
      confirmed++
    }

    // Send welcome email if they haven't received any alerts yet
    if (!alert.last_sent_at && resend) {
      try {
        const tradeLabel = alert.trade_pref === 'all' || !alert.trade_pref
          ? 'trades'
          : alert.trade_pref.replace(/_/g, ' ')
        const { subject, html, text } = buildWelcomeEmail({
          tradeLabel,
          manageToken: alert.confirmation_token,
          baseUrl,
          category: alert.category,
        })
        await resend.emails.send({
          from: `VoltGrid Jobs <${process.env.RESEND_FROM_EMAIL || 'alerts@voltgridjobs.com'}>`,
          to: alert.email,
          subject,
          html,
          text,
        })
        welcomesSent++
        details.push({ email: alert.email, wasConfirmed: wasAlreadyConfirmed, welcomeSent: true })
      } catch (err) {
        console.error(`[backfill] welcome email error for ${alert.email}:`, err)
        details.push({ email: alert.email, wasConfirmed: wasAlreadyConfirmed, welcomeSent: false })
      }
    } else {
      details.push({ email: alert.email, wasConfirmed: wasAlreadyConfirmed, welcomeSent: false })
    }
  }

  return NextResponse.json({
    totalAlerts: allAlerts.length,
    newlyConfirmed: confirmed,
    welcomeEmailsSent: welcomesSent,
    details,
  })
}
