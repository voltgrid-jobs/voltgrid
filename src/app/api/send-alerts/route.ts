import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { Resend } from 'resend'
import { logFunnelEvent } from '@/lib/analytics/events'
import { buildLocationOrFilter } from '@/lib/alerts/location-match'

const INGEST_SECRET = process.env.INGEST_SECRET

export async function GET(req: NextRequest) {
  if (!INGEST_SECRET) {
    console.error('[send-alerts] INGEST_SECRET is not configured')
    return NextResponse.json({ error: 'Not configured' }, { status: 500 })
  }
  const authHeader = req.headers.get('authorization')
  const isVercelCron = req.headers.get('x-vercel-cron') === '1'
  if (!isVercelCron && authHeader !== `Bearer ${INGEST_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json({ skipped: true, reason: 'RESEND_API_KEY not configured' })
  }

  const resend = new Resend(process.env.RESEND_API_KEY)
  const supabase = createAdminClient()

  // Get all active, confirmed daily alerts not sent in last 23 hours.
  // Rows with confirmed_at IS NULL are pending double opt-in and must
  // not receive any content emails until the user clicks the confirm link.
  const { data: alerts } = await supabase
    .from('job_alerts')
    .select('id, email, category, keywords, location, last_sent_at, confirmation_token, per_diem_only')
    .eq('is_active', true)
    .eq('frequency', 'daily')
    .not('confirmed_at', 'is', null)
    .or('last_sent_at.is.null,last_sent_at.lt.' + new Date(Date.now() - 23 * 60 * 60 * 1000).toISOString())

  if (!alerts?.length) return NextResponse.json({ sent: 0, reason: 'No alerts due' })

  let sent = 0
  let failed = 0

  for (const alert of alerts) {
    try {
      // Find matching jobs posted since last alert send
      const since = alert.last_sent_at
        ? new Date(alert.last_sent_at).toISOString()
        : new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

      let query = supabase
        .from('jobs')
        .select('id, title, company_name, location, category, salary_min, salary_max, created_at')
        .eq('is_active', true)
        .gte('created_at', since)
        .order('created_at', { ascending: false })
        .limit(10)

      if (alert.category) query = query.eq('category', alert.category)
      if (alert.per_diem_only) query = query.eq('per_diem', true)
      const locationFilter = buildLocationOrFilter(alert.location)
      if (locationFilter) query = query.or(locationFilter)
      if (alert.keywords) {
        query = query.or(
          `title.ilike.%${alert.keywords}%,company_name.ilike.%${alert.keywords}%`
        )
      }

      const { data: jobs } = await query
      if (!jobs?.length) continue // Nothing new to send

      const baseUrl = 'https://voltgridjobs.com'
      const jobListHtml = jobs.map(job => `
        <tr>
          <td style="padding:12px 0;border-bottom:1px solid #1f2937">
            <a href="${baseUrl}/jobs/${job.id}" style="color:#facc15;font-weight:600;text-decoration:none;font-size:15px">${job.title}</a><br>
            <span style="color:#9ca3af;font-size:13px">${job.company_name} · ${job.location}</span>
            ${job.salary_min ? `<br><span style="color:#4ade80;font-size:13px">$${Math.round(job.salary_min / 1000)}k${job.salary_max ? `–$${Math.round(job.salary_max / 1000)}k` : '+'}</span>` : ''}
          </td>
        </tr>
      `).join('')

      const emailHtml = `
        <!DOCTYPE html>
        <html>
        <body style="background:#030712;color:#f9fafb;font-family:system-ui,sans-serif;margin:0;padding:0">
          <div style="max-width:600px;margin:0 auto;padding:32px 24px">
            <div style="margin-bottom:24px">
              <span style="font-size:24px">⚡</span>
              <span style="font-size:20px;font-weight:700;color:#fff;margin-left:8px">VoltGrid Jobs</span>
            </div>
            <h1 style="color:#fff;font-size:22px;margin-bottom:8px">
              ${jobs.length} new job${jobs.length > 1 ? 's' : ''} matching your alert
            </h1>
            <p style="color:#9ca3af;font-size:14px;margin-bottom:24px">
              ${alert.keywords ? `Keywords: <strong style="color:#d1d5db">${alert.keywords}</strong>` : ''}
              ${alert.location ? ` · Location: <strong style="color:#d1d5db">${alert.location}</strong>` : ''}
            </p>
            <table style="width:100%;border-collapse:collapse">
              ${jobListHtml}
            </table>
            <div style="margin-top:32px;text-align:center">
              <a href="${baseUrl}/jobs" style="background:#facc15;color:#030712;padding:12px 32px;border-radius:8px;font-weight:700;text-decoration:none;display:inline-block">
                Browse All Jobs →
              </a>
            </div>
            <p style="color:#4b5563;font-size:12px;margin-top:32px;text-align:center;line-height:1.6">
              You're receiving this because you confirmed a job alert on VoltGrid Jobs.<br>
              <a href="${baseUrl}/alerts/manage?t=${alert.confirmation_token}" style="color:#4b5563;text-decoration:underline">Manage alerts</a>
              &nbsp;·&nbsp;
              <a href="${baseUrl}/alerts/unsubscribe?t=${alert.confirmation_token}" style="color:#4b5563;text-decoration:underline">Unsubscribe</a>
            </p>
          </div>
        </body>
        </html>
      `

      const sendResult = await resend.emails.send({
        from: 'VoltGrid Jobs <alerts@voltgridjobs.com>',
        to: alert.email,
        subject: `${jobs.length} new ${alert.keywords || alert.category || 'trades'} job${jobs.length > 1 ? 's' : ''} on VoltGrid`,
        html: emailHtml,
      })

      // Update last sent
      await supabase
        .from('job_alerts')
        .update({ last_sent_at: new Date().toISOString() })
        .eq('id', alert.id)

      // Log the send so Resend webhook events can be joined on message_id
      await logFunnelEvent({
        eventType: 'alert_delivered',
        email: alert.email,
        alertId: alert.id,
        resendMessageId: sendResult.data?.id ?? null,
        metadata: { job_count: jobs.length, cadence: 'daily' },
      })

      sent++
    } catch {
      failed++
    }
  }

  return NextResponse.json({ sent, failed, total: alerts.length })
}
