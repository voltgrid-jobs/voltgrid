import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { Resend } from 'resend'

const INGEST_SECRET = process.env.INGEST_SECRET

/**
 * Cron: send expiry reminder emails to employers 3 days before listing expires.
 * Trigger: run daily (e.g. via Vercel Cron or external scheduler).
 * Auth: x-cron-secret header must match INGEST_SECRET env var.
 */
export async function GET(req: NextRequest) {
  // Auth check
  const cronSecret = req.headers.get('x-cron-secret')
  const isVercelCron = req.headers.get('x-vercel-cron') === '1'

  if (!isVercelCron && cronSecret !== INGEST_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json({
      skipped: true,
      reason: 'RESEND_API_KEY not configured',
    })
  }

  const resend = new Resend(process.env.RESEND_API_KEY)
  const supabase = createAdminClient()
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://voltgridjobs.com'

  const now = new Date()
  const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000)

  // Query active jobs expiring within 3 days that haven't been reminded yet
  const { data: jobs, error } = await supabase
    .from('jobs')
    .select('id, title, company_name, employer_email, expires_at')
    .eq('is_active', true)
    .neq('expiry_reminder_sent', true)
    .gte('expires_at', now.toISOString())
    .lte('expires_at', threeDaysFromNow.toISOString())

  if (error) {
    console.error('[cron/expiry-reminders] DB error:', error)
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }

  if (!jobs?.length) {
    return NextResponse.json({ reminded: 0, reason: 'No listings due for reminder' })
  }

  let reminded = 0
  let failed = 0

  for (const job of jobs) {
    if (!job.employer_email) continue

    const expiryDate = new Date(job.expires_at).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })

    try {
      await resend.emails.send({
        from: `VoltGrid Jobs <${process.env.RESEND_FROM_EMAIL || 'alerts@voltgridjobs.com'}>`,
        to: job.employer_email,
        subject: 'Your VoltGrid listing expires in 3 days ⏰',
        html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your listing expires soon</title>
</head>
<body style="background:#030712;color:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',system-ui,sans-serif;margin:0;padding:0">
  <div style="max-width:600px;margin:0 auto;padding:40px 24px">
    <div style="margin-bottom:28px">
      <span style="font-size:22px">⚡</span>
      <span style="font-size:20px;font-weight:800;color:#fff;margin-left:8px;letter-spacing:-0.5px">VoltGrid Jobs</span>
    </div>
    <h1 style="color:#fff;font-size:22px;font-weight:800;margin:0 0 16px;letter-spacing:-0.5px">
      Your listing expires in 3 days ⏰
    </h1>
    <p style="color:#d1d5db;font-size:15px;line-height:1.6;margin:0 0 24px">
      Your listing <strong style="color:#fff">'${job.title}'</strong> at <strong style="color:#fff">${job.company_name}</strong> expires on <strong style="color:#facc15">${expiryDate}</strong>.
    </p>
    <p style="color:#d1d5db;font-size:15px;line-height:1.6;margin:0 0 32px">
      Renew for $149 to keep it live and visible to qualified trades workers.
    </p>
    <div style="text-align:left;margin-bottom:40px">
      <a href="${baseUrl}/employers" style="background:#facc15;color:#0a0a0a;padding:14px 32px;border-radius:10px;font-weight:800;font-size:15px;text-decoration:none;display:inline-block;letter-spacing:-0.2px">
        Renew your listing →
      </a>
    </div>
    <div style="border-top:1px solid #1f2937;padding-top:20px">
      <p style="color:#374151;font-size:12px;line-height:1.6;margin:0">
        You're receiving this because you have an active listing on <a href="${baseUrl}" style="color:#374151">voltgridjobs.com</a>.
      </p>
    </div>
  </div>
</body>
</html>`,
      })

      // Mark as reminded
      await supabase
        .from('jobs')
        .update({ expiry_reminder_sent: true })
        .eq('id', job.id)

      reminded++
    } catch (emailErr) {
      console.error(`[cron/expiry-reminders] Failed for job ${job.id}:`, emailErr)
      failed++
    }
  }

  return NextResponse.json({ reminded, failed, total: jobs.length })
}
