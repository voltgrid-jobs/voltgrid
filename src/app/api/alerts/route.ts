import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

// In-memory rate limit store (per cold-start instance)
// For production scale, replace with Redis/KV — adequate for current traffic
const rateLimitStore = new Map<string, { count: number; resetAt: number }>()
const RATE_LIMIT_MAX = 10     // max 10 alert signups per IP per hour
const RATE_LIMIT_WINDOW = 60 * 60 * 1000  // per hour per IP

function getClientIp(req: NextRequest): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    req.headers.get('x-real-ip') ||
    'unknown'
  )
}

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const record = rateLimitStore.get(ip)

  if (!record || now > record.resetAt) {
    rateLimitStore.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW })
    return true // allowed
  }

  if (record.count >= RATE_LIMIT_MAX) {
    return false // blocked
  }

  record.count++
  return true // allowed
}

export async function POST(req: NextRequest) {
  // Rate limiting — 3 signups per IP per hour
  const ip = getClientIp(req)
  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429 }
    )
  }

  const supabase = await createClient()
  const body = await req.json()
  const { email, keywords, location, category, frequency, background, job_id } = body

  if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 })

  // Basic email format check
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Invalid email address' }, { status: 400 })
  }

  // Prevent abuse: cap alerts per email address (check via admin client)
  const adminClient = createAdminClient()
  const { count } = await adminClient
    .from('job_alerts')
    .select('*', { count: 'exact', head: true })
    .eq('email', email.toLowerCase())
    .eq('is_active', true)

  if (count !== null && count >= 5) {
    return NextResponse.json(
      { error: 'Maximum alert limit reached for this email.' },
      { status: 429 }
    )
  }

  // Get user if logged in (best-effort — doesn't block unauthenticated signups)
  const { data: { user } } = await supabase.auth.getUser()

  // Use adminClient to bypass RLS — this is a server-side API route with its own
  // validation (rate limit + email format check + per-email cap above).
  // Upsert on (email, category) to prevent duplicate alerts for the same trade.
  const { error } = await adminClient.from('job_alerts').upsert({
    email: email.toLowerCase().trim(),
    ...(background && { background }),
    user_id: user?.id || null,
    keywords: keywords || null,
    location: location || null,
    category: category || null,
    frequency: frequency || 'daily',
    is_active: true,
    ...(job_id && { source_job_id: job_id }),
  }, { onConflict: 'email,category', ignoreDuplicates: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Welcome email — Email 1 of 3 in the onboarding sequence
  try {
    if (process.env.RESEND_API_KEY) {
      const resend = new Resend(process.env.RESEND_API_KEY)
      const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://voltgridjobs.com'
      const tradeLabel = category ? category.replace(/_/g, ' ') : 'trades'
      await resend.emails.send({
        from: `VoltGrid Jobs <${process.env.RESEND_FROM_EMAIL || 'alerts@voltgridjobs.com'}>`,
        to: email.toLowerCase().trim(),
        subject: "You're in — here's what to expect",
        html: `<div style="font-family:system-ui,sans-serif;max-width:600px;margin:0 auto;padding:32px 24px;background:#030712;color:#f9fafb">
          <p style="font-size:18px;font-weight:700;color:#facc15;margin-bottom:16px">⚡ You're on the list</p>

          <p style="font-size:15px;line-height:1.7;color:#d1d5db;margin-bottom:16px">
            Your alert is set up. Here's what happens next:
          </p>

          <ul style="margin:0 0 20px 0;padding:0;list-style:none">
            <li style="display:flex;gap:12px;margin-bottom:12px">
              <span style="color:#facc15;font-weight:700;flex-shrink:0">→</span>
              <span style="color:#d1d5db;font-size:14px;line-height:1.6">
                <strong style="color:#fff">Daily alerts</strong> when new <strong style="color:#facc15">${tradeLabel}</strong> jobs post at data centers and AI infrastructure sites.
              </span>
            </li>
            <li style="display:flex;gap:12px;margin-bottom:12px">
              <span style="color:#facc15;font-weight:700;flex-shrink:0">→</span>
              <span style="color:#d1d5db;font-size:14px;line-height:1.6">
                <strong style="color:#fff">Weekly digest</strong> every Monday — top 10 highest-paying open roles.
              </span>
            </li>
            <li style="display:flex;gap:12px">
              <span style="color:#facc15;font-weight:700;flex-shrink:0">→</span>
              <span style="color:#d1d5db;font-size:14px;line-height:1.6">
                <strong style="color:#fff">No spam.</strong> Only real job alerts — we don't sell your email.
              </span>
            </li>
          </ul>

          <p style="font-size:15px;font-weight:600;color:#fff;margin-bottom:8px">Bonus resource:</p>
          <p style="font-size:14px;line-height:1.6;color:#d1d5db;margin-bottom:20px">
            Download the <a href="${baseUrl}/salary-guide?unlocked=true" style="color:#facc15;text-decoration:underline">2026 Data Center Trades Salary Guide</a>
            — see what electricians, HVAC techs, and low voltage specialists are actually earning on these projects.
          </p>

          <div style="margin-bottom:24px">
            <a href="${baseUrl}/jobs${category ? `?category=${category}` : ''}"
              style="display:inline-block;background:#facc15;color:#0a0a0a;padding:12px 24px;border-radius:10px;font-weight:700;font-size:14px;text-decoration:none">
              Browse open ${tradeLabel} jobs →
            </a>
          </div>

          <p style="font-size:13px;color:#6b7280;border-top:1px solid #1f2937;padding-top:16px;margin-top:8px">
            VoltGrid Jobs — Built for trades workers in the data center industry.<br>
            <a href="${baseUrl}" style="color:#facc15">voltgridjobs.com</a>
            &nbsp;·&nbsp;
            <a href="${baseUrl}/unsubscribe" style="color:#6b7280">Unsubscribe</a>
          </p>
        </div>`,
      })
    }
  } catch (confirmErr) {
    // Non-critical — don't break the signup flow
    console.error('[alerts] Welcome email error:', confirmErr)
  }

  // AUTOMATION 1: Notify employers of matching active listings
  try {
    if (process.env.RESEND_API_KEY) {
      const resend = new Resend(process.env.RESEND_API_KEY)
      const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://voltgridjobs.com'

      // Build query for active jobs matching this alert's criteria
      let jobQuery = adminClient
        .from('jobs')
        .select('id, title, company_name, location, category, employer_email')
        .eq('is_active', true)

      if (category) jobQuery = jobQuery.eq('category', category)
      if (location) jobQuery = jobQuery.ilike('location', `%${location}%`)

      const { data: matchingJobs } = await jobQuery.limit(20)

      if (matchingJobs?.length) {
        const categoryLabel = category || 'trades'
        const locationLabel = location || 'your area'

        for (const job of matchingJobs) {
          if (!job.employer_email) continue
          try {
            await resend.emails.send({
              from: `VoltGrid Jobs <${process.env.RESEND_FROM_EMAIL || 'alerts@voltgridjobs.com'}>`,
              to: job.employer_email,
              subject: 'A candidate is looking for your role 👀',
              html: `<div style="font-family:system-ui,sans-serif;max-width:600px;margin:0 auto;padding:32px 24px;background:#030712;color:#f9fafb">
                <p style="font-size:16px;line-height:1.6;color:#d1d5db">
                  Good news — someone just signed up for job alerts matching <strong style="color:#facc15">${categoryLabel}</strong> jobs in <strong style="color:#facc15">${locationLabel}</strong>.
                  Your listing <strong style="color:#fff">'${job.title}'</strong> is a great match.
                  Make sure it's up to date: <a href="${baseUrl}" style="color:#facc15">${baseUrl}</a>
                </p>
              </div>`,
            })
          } catch (emailErr) {
            console.error('[alerts] Failed to notify employer:', emailErr)
          }
        }
      }
    }
  } catch (notifyErr) {
    // Non-critical — log and continue
    console.error('[alerts] Employer notification error:', notifyErr)
  }

  return NextResponse.json({ success: true })
}
