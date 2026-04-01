import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { Resend } from 'resend'

const CATEGORY_LABELS: Record<string, string> = {
  electrical: 'electricians',
  hvac: 'HVAC techs',
  low_voltage: 'low voltage techs',
  construction: 'construction trades workers',
  project_management: 'project managers',
  operations: 'operations techs',
  other: 'trades workers',
}

export async function GET() {
  const supabase = createAdminClient()
  const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://voltgridjobs.com'
  const now = new Date()

  let sent24h = 0
  let sent7d = 0

  // ── 24h email: jobs created 23–25h ago with no 24h email sent ────────────
  const cutoff24hStart = new Date(now.getTime() - 25 * 60 * 60 * 1000).toISOString()
  const cutoff24hEnd = new Date(now.getTime() - 23 * 60 * 60 * 1000).toISOString()

  const { data: jobs24h } = await supabase
    .from('jobs')
    .select('id, title, company_name, employer_email, category, location, created_at, expires_at')
    .eq('is_active', true)
    .gte('created_at', cutoff24hStart)
    .lte('created_at', cutoff24hEnd)
    .is('onboarding_24h_sent_at', null)
    .not('employer_email', 'is', null)

  for (const job of jobs24h ?? []) {
    const j = job as {
      id: string
      title: string
      company_name: string
      employer_email: string
      category: string
      location: string
      created_at: string
      expires_at: string
    }

    try {
      // Count apply clicks
      const { count: clickCount } = await supabase
        .from('apply_clicks')
        .select('*', { count: 'exact', head: true })
        .eq('job_id', j.id)

      // Count matching job alerts
      let alertQuery = supabase
        .from('job_alerts')
        .select('*', { count: 'exact', head: true })
        .eq('category', j.category)
        .eq('is_active', true)
      if (j.location) {
        const firstWord = j.location.split(/[\s,]+/)[0]
        if (firstWord.length > 2) {
          alertQuery = alertQuery.ilike('location', `%${firstWord}%`)
        }
      }
      const { count: alertCount } = await alertQuery

      const clicks = clickCount ?? 0
      const alerts = alertCount ?? 0
      const tradeLabel = CATEGORY_LABELS[j.category] ?? 'trades workers'
      const locationDisplay = j.location ? j.location.split(',')[0].trim() : null

      if (resend) {
        await resend.emails.send({
          from: `VoltGrid Jobs <${process.env.RESEND_FROM_EMAIL || 'alerts@voltgridjobs.com'}>`,
          to: j.employer_email,
          subject: `24 hours in — how your listing is performing`,
          html: `<div style="font-family:system-ui,sans-serif;max-width:600px;margin:0 auto;padding:32px 24px;background:#030712;color:#f9fafb">
            <p style="font-size:18px;font-weight:700;color:#facc15;margin-bottom:16px">⚡ 24 hours in</p>
            <p style="font-size:15px;line-height:1.6;color:#d1d5db;margin-bottom:20px">
              <strong style="color:#fff">${j.title}</strong> at <strong style="color:#fff">${j.company_name}</strong> has been live for 24 hours.
            </p>
            <table style="width:100%;border-collapse:collapse;margin-bottom:24px">
              <tr>
                <td style="padding:10px 0;color:#9ca3af;font-size:14px;border-bottom:1px solid #1f2937">Apply clicks</td>
                <td style="padding:10px 0;color:#f9fafb;font-size:16px;font-weight:700;text-align:right;border-bottom:1px solid #1f2937">${clicks}</td>
              </tr>
              <tr>
                <td style="padding:10px 0;color:#9ca3af;font-size:14px">Matching job seekers alerted${locationDisplay ? ` in ${locationDisplay}` : ''}</td>
                <td style="padding:10px 0;color:#facc15;font-size:16px;font-weight:700;text-align:right">${alerts > 0 ? alerts : '—'}</td>
              </tr>
            </table>
            ${clicks === 0 ? `<p style="font-size:14px;line-height:1.6;color:#d1d5db;margin-bottom:20px">
              No clicks yet — this is normal for day one. ${tradeLabel} check listings throughout the week.
              Consider <a href="${baseUrl}/post-job?upgrade=1" style="color:#facc15">upgrading to Featured</a> for a bump to the top of the category.
            </p>` : `<p style="font-size:14px;line-height:1.6;color:#d1d5db;margin-bottom:20px">
              ${clicks} ${clicks === 1 ? 'candidate has' : 'candidates have'} clicked through to apply. Keep an eye on your inbox.
            </p>`}
            <p style="margin-bottom:24px">
              <a href="${baseUrl}/jobs/${j.id}"
                style="display:inline-block;background:#facc15;color:#0a0a0a;padding:12px 24px;border-radius:10px;font-weight:700;font-size:14px;text-decoration:none">
                View your listing →
              </a>
            </p>
            <p style="font-size:13px;color:#6b7280;border-top:1px solid #1f2937;padding-top:16px">
              VoltGrid Jobs &mdash; <a href="${baseUrl}" style="color:#facc15">voltgridjobs.com</a>
              &nbsp;&middot;&nbsp;
              <a href="mailto:hello@voltgridjobs.com" style="color:#6b7280">hello@voltgridjobs.com</a>
            </p>
          </div>`,
        })
      }

      await supabase
        .from('jobs')
        .update({ onboarding_24h_sent_at: now.toISOString() })
        .eq('id', j.id)

      sent24h++
    } catch (err) {
      console.error('[employer-onboarding] 24h email error for job', j.id, err)
    }
  }

  // ── 7d email: jobs created 6d23h–7d4h ago with no 7d email sent ──────────
  const cutoff7dStart = new Date(now.getTime() - (7 * 24 + 4) * 60 * 60 * 1000).toISOString()
  const cutoff7dEnd = new Date(now.getTime() - (7 * 24 - 1) * 60 * 60 * 1000).toISOString()

  const { data: jobs7d } = await supabase
    .from('jobs')
    .select('id, title, company_name, employer_email, category, location, created_at, expires_at')
    .eq('is_active', true)
    .gte('created_at', cutoff7dStart)
    .lte('created_at', cutoff7dEnd)
    .is('onboarding_7d_sent_at', null)
    .not('employer_email', 'is', null)

  for (const job of jobs7d ?? []) {
    const j = job as {
      id: string
      title: string
      company_name: string
      employer_email: string
      category: string
      location: string
      created_at: string
      expires_at: string
    }

    try {
      // Count apply clicks
      const { count: clickCount } = await supabase
        .from('apply_clicks')
        .select('*', { count: 'exact', head: true })
        .eq('job_id', j.id)

      const clicks = clickCount ?? 0
      const expiresAt = j.expires_at ? new Date(j.expires_at) : null
      const daysLeft = expiresAt
        ? Math.max(0, Math.round((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
        : 23
      const expiresFormatted = expiresAt
        ? expiresAt.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })
        : null

      if (resend) {
        await resend.emails.send({
          from: `VoltGrid Jobs <${process.env.RESEND_FROM_EMAIL || 'alerts@voltgridjobs.com'}>`,
          to: j.employer_email,
          subject: `1 week in — ${daysLeft} days remaining on your listing`,
          html: `<div style="font-family:system-ui,sans-serif;max-width:600px;margin:0 auto;padding:32px 24px;background:#030712;color:#f9fafb">
            <p style="font-size:18px;font-weight:700;color:#facc15;margin-bottom:16px">⚡ 1 week in</p>
            <p style="font-size:15px;line-height:1.6;color:#d1d5db;margin-bottom:20px">
              <strong style="color:#fff">${j.title}</strong> at <strong style="color:#fff">${j.company_name}</strong> — here's your 7-day summary.
            </p>
            <table style="width:100%;border-collapse:collapse;margin-bottom:24px">
              <tr>
                <td style="padding:10px 0;color:#9ca3af;font-size:14px;border-bottom:1px solid #1f2937">Total apply clicks</td>
                <td style="padding:10px 0;color:#f9fafb;font-size:16px;font-weight:700;text-align:right;border-bottom:1px solid #1f2937">${clicks}</td>
              </tr>
              <tr>
                <td style="padding:10px 0;color:#9ca3af;font-size:14px">Days remaining</td>
                <td style="padding:10px 0;color:#facc15;font-size:16px;font-weight:700;text-align:right">${daysLeft}${expiresFormatted ? ` (expires ${expiresFormatted})` : ''}</td>
              </tr>
            </table>
            <p style="font-size:14px;line-height:1.6;color:#d1d5db;margin-bottom:20px">
              ${daysLeft > 0
                ? `You have ${daysLeft} days left. Post another role now to maintain continuity, or renew when this one expires.`
                : `This listing has expired. Post a new job to keep your pipeline active.`}
            </p>
            <div style="display:flex;gap:12px;flex-wrap:wrap;margin-bottom:24px">
              <a href="${baseUrl}/jobs/${j.id}"
                style="display:inline-block;background:#facc15;color:#0a0a0a;padding:12px 24px;border-radius:10px;font-weight:700;font-size:14px;text-decoration:none">
                View listing →
              </a>
              <a href="${baseUrl}/post-job"
                style="display:inline-block;border:1px solid #374151;color:#d1d5db;padding:12px 24px;border-radius:10px;font-weight:600;font-size:14px;text-decoration:none">
                Post another job →
              </a>
            </div>
            <p style="font-size:13px;color:#6b7280;border-top:1px solid #1f2937;padding-top:16px">
              VoltGrid Jobs &mdash; <a href="${baseUrl}" style="color:#facc15">voltgridjobs.com</a>
              &nbsp;&middot;&nbsp;
              <a href="mailto:hello@voltgridjobs.com" style="color:#6b7280">hello@voltgridjobs.com</a>
            </p>
          </div>`,
        })
      }

      await supabase
        .from('jobs')
        .update({ onboarding_7d_sent_at: now.toISOString() })
        .eq('id', j.id)

      sent7d++
    } catch (err) {
      console.error('[employer-onboarding] 7d email error for job', j.id, err)
    }
  }

  return NextResponse.json({ sent24h, sent7d })
}
