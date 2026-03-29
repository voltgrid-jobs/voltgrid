import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

// In-memory rate limit store (per cold-start instance)
// For production scale, replace with Redis/KV — adequate for current traffic
const rateLimitStore = new Map<string, { count: number; resetAt: number }>()
const RATE_LIMIT_MAX = 3      // max 3 alert signups
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
  const { email, keywords, location, category, frequency } = body

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

  // Get user if logged in
  const { data: { user } } = await supabase.auth.getUser()

  const { error } = await supabase.from('job_alerts').insert({
    email: email.toLowerCase().trim(),
    user_id: user?.id || null,
    keywords: keywords || null,
    location: location || null,
    category: category || null,
    frequency: frequency || 'daily',
    is_active: true,
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Confirmation email to the subscriber
  try {
    if (process.env.RESEND_API_KEY) {
      const resend = new Resend(process.env.RESEND_API_KEY)
      const tradeLabel = category
        ? category.replace(/_/g, ' ')
        : 'trades'
      await resend.emails.send({
        from: `VoltGrid Jobs <alerts@voltgridjobs.com>`,
        to: email.toLowerCase().trim(),
        subject: "Job alerts set up — you're on the list",
        html: `<div style="font-family:system-ui,sans-serif;max-width:600px;margin:0 auto;padding:32px 24px;background:#030712;color:#f9fafb">
          <p style="font-size:16px;line-height:1.6;color:#d1d5db">
            You'll get notified when new <strong style="color:#facc15">${tradeLabel}</strong> jobs land at data centers and AI sites.
            Manage your alerts at <a href="https://voltgridjobs.com" style="color:#facc15">voltgridjobs.com</a>.
          </p>
          <p style="font-size:13px;color:#6b7280;margin-top:24px">
            VoltGrid Jobs &mdash; Built for trades workers in the data center industry.
          </p>
        </div>`,
      })
    }
  } catch (confirmErr) {
    // Non-critical — don't break the signup flow
    console.error('[alerts] Confirmation email error:', confirmErr)
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
