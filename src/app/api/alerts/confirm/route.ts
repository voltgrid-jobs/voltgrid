import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { Resend } from 'resend'
import { buildWelcomeEmail } from '@/lib/emails/alerts'
import { logFunnelEvent } from '@/lib/analytics/events'

/**
 * Confirm a job alert via the token in the confirmation email.
 * Sets confirmed_at, sends the welcome email, and redirects the
 * browser to /alerts/confirmed. Callable as a GET so confirmation
 * links in email work out of the box.
 */
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('t')
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://voltgridjobs.com'

  if (!token || !/^[0-9a-f-]{36}$/i.test(token)) {
    return NextResponse.redirect(`${baseUrl}/alerts/confirmed?status=invalid`, 302)
  }

  const admin = createAdminClient()

  const { data: alert, error } = await admin
    .from('job_alerts')
    .select('id, email, category, confirmed_at, confirmation_token, is_active')
    .eq('confirmation_token', token)
    .maybeSingle()

  if (error || !alert) {
    return NextResponse.redirect(`${baseUrl}/alerts/confirmed?status=notfound`, 302)
  }

  // Already confirmed — idempotent, redirect to success
  if (alert.confirmed_at) {
    return NextResponse.redirect(`${baseUrl}/alerts/confirmed?status=already`, 302)
  }

  const nowIso = new Date().toISOString()
  const { error: updateErr } = await admin
    .from('job_alerts')
    .update({ confirmed_at: nowIso, is_active: true, unsubscribed_at: null })
    .eq('id', alert.id)

  if (updateErr) {
    console.error('[alerts/confirm] update error:', updateErr)
    return NextResponse.redirect(`${baseUrl}/alerts/confirmed?status=error`, 302)
  }

  await logFunnelEvent({
    eventType: 'alert_confirm',
    email: alert.email,
    alertId: alert.id,
    metadata: { category: alert.category },
  })

  // Send the welcome email (the one with the salary guide CTA).
  // Non-blocking — don't let email failure block the redirect.
  try {
    if (process.env.RESEND_API_KEY) {
      const resend = new Resend(process.env.RESEND_API_KEY)
      const tradeLabel = alert.category ? alert.category.replace(/_/g, ' ') : 'trades'
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
    }
  } catch (err) {
    console.error('[alerts/confirm] welcome email error:', err)
  }

  return NextResponse.redirect(`${baseUrl}/alerts/confirmed?status=ok&t=${token}`, 302)
}
