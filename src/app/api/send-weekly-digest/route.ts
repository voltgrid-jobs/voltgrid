import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { Resend } from 'resend'
import { logFunnelEvent } from '@/lib/analytics/events'
import { buildLocationOrFilter } from '@/lib/alerts/location-match'

const INGEST_SECRET = process.env.INGEST_SECRET

interface Job {
  id: string
  title: string
  company_name: string
  location: string
  category: string | null
  salary_min: number | null
  salary_max: number | null
  created_at: string
}

interface JobAlert {
  id: string
  email: string
  keywords: string | null
  location: string | null
  category: string | null
  last_digest_sent_at: string | null
  is_active: boolean
  confirmation_token: string
  per_diem_only: boolean
}

function formatSalary(min: number | null, max: number | null): string | null {
  if (!min) return null
  const minK = Math.round(min / 1000)
  if (max) {
    const maxK = Math.round(max / 1000)
    return `$${minK}k–$${maxK}k /yr`
  }
  return `$${minK}k+ /yr`
}

function buildEmailHtml(jobs: Job[], alert: JobAlert, baseUrl: string, totalJobs: number): string {
  const jobCount = jobs.length
  const searchDesc = [
    alert.keywords,
    alert.category,
    alert.location,
  ].filter(Boolean).join(', ') || 'data center trades'

  const jobListHtml = jobs.map(job => {
    const salary = formatSalary(job.salary_min, job.salary_max)
    const jobUrl = `${baseUrl}/jobs/${job.id}`
    return `
      <tr>
        <td style="padding:16px 0;border-bottom:1px solid #1f2937">
          <table style="width:100%;border-collapse:collapse">
            <tr>
              <td style="width:28px;vertical-align:top;padding-top:2px">
                <span style="font-size:16px">⚡</span>
              </td>
              <td>
                <a href="${jobUrl}" style="color:#facc15;font-weight:700;text-decoration:none;font-size:15px;line-height:1.3">
                  ${job.title}
                </a>
                <div style="margin-top:4px">
                  <span style="color:#d1d5db;font-size:13px">${job.company_name}</span>
                  <span style="color:#4b5563;font-size:13px"> · </span>
                  <span style="color:#9ca3af;font-size:13px">${job.location}</span>
                  ${salary ? `<span style="color:#4b5563;font-size:13px"> · </span><span style="color:#4ade80;font-size:13px;font-weight:600">${salary}</span>` : ''}
                </div>
                <div style="margin-top:8px">
                  <a href="${jobUrl}" style="color:#facc15;font-size:13px;text-decoration:none;font-weight:600">
                    View job →
                  </a>
                </div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    `
  }).join('')

  const manageUrl = `${baseUrl}/alerts/manage?t=${alert.confirmation_token}`
  const unsubscribeUrl = `${baseUrl}/alerts/unsubscribe?t=${alert.confirmation_token}`

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your weekly VoltGrid digest</title>
</head>
<body style="background:#030712;color:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',system-ui,sans-serif;margin:0;padding:0">
  <div style="max-width:600px;margin:0 auto;padding:40px 24px">

    <!-- Header -->
    <div style="margin-bottom:32px;padding-bottom:20px;border-bottom:1px solid #1f2937">
      <a href="${baseUrl}" style="text-decoration:none;display:inline-flex;align-items:center;gap:8px">
        <span style="font-size:22px">⚡</span>
        <span style="font-size:20px;font-weight:800;color:#fff;letter-spacing:-0.5px">VoltGrid Jobs</span>
      </a>
    </div>

    <!-- Title -->
    <h1 style="color:#fff;font-size:24px;font-weight:800;margin:0 0 8px;letter-spacing:-0.5px">
      ${jobCount} new ${searchDesc} job${jobCount !== 1 ? 's' : ''} this week
    </h1>
    <p style="color:#6b7280;font-size:14px;margin:0 0 28px;line-height:1.5">
      Hi there — here are the newest data center trades jobs matching your search on VoltGrid.
    </p>

    <!-- Job list -->
    <table style="width:100%;border-collapse:collapse;margin-bottom:32px">
      ${jobListHtml}
    </table>

    <!-- CTA -->
    <div style="text-align:center;padding:8px 0 40px">
      <a href="${baseUrl}/jobs" style="background:#facc15;color:#0a0a0a;padding:14px 36px;border-radius:10px;font-weight:800;font-size:15px;text-decoration:none;display:inline-block;letter-spacing:-0.2px">
        Browse all ${totalJobs.toLocaleString()} jobs on VoltGrid →
      </a>
    </div>

    <!-- Footer -->
    <div style="border-top:1px solid #1f2937;padding-top:24px;text-align:center">
      <p style="color:#374151;font-size:12px;line-height:1.6;margin:0">
        You confirmed a job alert at <a href="${baseUrl}" style="color:#374151">voltgridjobs.com</a>.<br>
        <a href="${manageUrl}" style="color:#4b5563;text-decoration:underline">Manage alerts</a>
        &nbsp;·&nbsp;
        <a href="${unsubscribeUrl}" style="color:#4b5563;text-decoration:underline">Unsubscribe</a>
      </p>
    </div>

  </div>
</body>
</html>`
}

export async function GET(req: NextRequest) {
  // Auth: accept Bearer token OR Vercel cron header
  if (!INGEST_SECRET) {
    console.error('[send-weekly-digest] INGEST_SECRET is not configured')
    return NextResponse.json({ error: 'Not configured' }, { status: 500 })
  }
  const authHeader = req.headers.get('authorization')
  const isVercelCron = req.headers.get('x-vercel-cron') === '1'
  const isAuthorized = authHeader === `Bearer ${INGEST_SECRET}` || isVercelCron

  if (!isAuthorized) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Resend check — route is ready but won't fire without the key
  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json({
      skipped: true,
      reason: 'RESEND_API_KEY not configured. Set it in your environment variables to activate the weekly digest.',
    })
  }

  const resend = new Resend(process.env.RESEND_API_KEY)
  const supabase = createAdminClient()
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://voltgridjobs.com'

  // Only send once per week: skip if last digest was sent within the last 6 days
  const sixDaysAgo = new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString()
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

  // Fetch all active subscribers not yet sent a digest this week.
  // NOTE: requires migration 20260329_digest_tracking.sql to be applied:
  //   ALTER TABLE public.job_alerts ADD COLUMN IF NOT EXISTS last_digest_sent_at TIMESTAMPTZ;
  // If the column doesn't exist yet, fall back to fetching all active subscribers.
  let alerts: JobAlert[] | null = null
  let alertsError: unknown = null

  // IMPORTANT: only send the Monday digest to subscribers who explicitly
  // chose weekly frequency. Daily subscribers already receive alerts every
  // morning via /api/send-alerts — sending them a weekly summary on top of
  // that would mean 8 emails/week and guaranteed unsubscribes.
  const { data: alertsWithDedup, error: dedupError } = await supabase
    .from('job_alerts')
    .select('id, email, keywords, location, category, last_digest_sent_at, is_active, confirmation_token, per_diem_only')
    .eq('is_active', true)
    .eq('frequency', 'weekly')
    .not('confirmed_at', 'is', null)
    .or(`last_digest_sent_at.is.null,last_digest_sent_at.lt.${sixDaysAgo}`)

  if (dedupError) {
    // Column likely doesn't exist yet — fall back to all active weekly subscribers (no dedup)
    console.warn('[send-weekly-digest] last_digest_sent_at column missing, falling back without dedup. Apply migration 20260329_digest_tracking.sql.')
    const { data: allAlerts, error: fallbackError } = await supabase
      .from('job_alerts')
      .select('id, email, keywords, location, category, is_active, confirmation_token')
      .eq('is_active', true)
      .eq('frequency', 'weekly')
      .not('confirmed_at', 'is', null)
    alerts = allAlerts as JobAlert[] | null
    alertsError = fallbackError
  } else {
    alerts = alertsWithDedup as JobAlert[] | null
  }

  if (alertsError) {
    console.error('[send-weekly-digest] Error fetching alerts:', alertsError)
    return NextResponse.json({ error: 'Failed to fetch alerts' }, { status: 500 })
  }

  if (!alerts?.length) {
    return NextResponse.json({ sent: 0, reason: 'No subscribers due for digest' })
  }

  // Get total active job count for CTA button
  const { count: totalJobs } = await supabase
    .from('jobs')
    .select('*', { count: 'exact', head: true })
    .eq('is_active', true)

  let sent = 0
  let skipped = 0
  let failed = 0

  for (const alert of alerts as JobAlert[]) {
    try {
      // Build job query for this subscriber — jobs from the last 7 days
      let query = supabase
        .from('jobs')
        .select('id, title, company_name, location, category, salary_min, salary_max, created_at')
        .eq('is_active', true)
        .gte('created_at', sevenDaysAgo)
        .order('created_at', { ascending: false })
        .limit(8)

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

      // Only send if there are >= 3 matching jobs
      if (!jobs || jobs.length < 3) {
        skipped++
        continue
      }

      const jobCount = jobs.length
      const searchDesc = [alert.keywords, alert.category, alert.location]
        .filter(Boolean)
        .join(', ') || 'data center trades'

      const subject = `${jobCount} new ${searchDesc} job${jobCount !== 1 ? 's' : ''} this week — VoltGrid Jobs`
      const html = buildEmailHtml(jobs, alert, baseUrl, totalJobs || 0)

      const sendResult = await resend.emails.send({
        from: `VoltGrid Jobs <${process.env.RESEND_FROM_EMAIL || 'alerts@voltgridjobs.com'}>`,
        to: alert.email,
        subject,
        html,
      })

      // Update last_digest_sent_at to prevent duplicate sends this week
      // (silently skip if column doesn't exist — migration not yet applied)
      await supabase
        .from('job_alerts')
        .update({ last_digest_sent_at: new Date().toISOString() } as Record<string, unknown>)
        .eq('id', alert.id)

      // Log for funnel analytics
      await logFunnelEvent({
        eventType: 'alert_delivered',
        email: alert.email,
        alertId: alert.id,
        resendMessageId: sendResult.data?.id ?? null,
        metadata: { job_count: jobCount, cadence: 'weekly' },
      })

      sent++
    } catch (err) {
      console.error(`[send-weekly-digest] Failed for ${alert.email}:`, err)
      failed++
    }
  }

  return NextResponse.json({
    sent,
    skipped,
    failed,
    total: alerts.length,
    message: `Weekly digest complete. ${sent} sent, ${skipped} skipped (< 3 matches), ${failed} failed.`,
  })
}
