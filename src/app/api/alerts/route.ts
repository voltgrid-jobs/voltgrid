import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { buildConfirmationEmail } from '@/lib/emails/alerts'

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
    return true
  }
  if (record.count >= RATE_LIMIT_MAX) return false
  record.count++
  return true
}

function tradeLabelFor(category: string | null | undefined) {
  if (!category) return 'trades'
  return category.replace(/_/g, ' ')
}

async function sendConfirmation(
  email: string,
  confirmToken: string,
  category: string | null | undefined,
  baseUrl: string
) {
  if (!process.env.RESEND_API_KEY) return
  const resend = new Resend(process.env.RESEND_API_KEY)
  const { subject, html, text } = buildConfirmationEmail({
    email,
    confirmToken,
    tradeLabel: tradeLabelFor(category),
    baseUrl,
  })
  await resend.emails.send({
    from: `VoltGrid Jobs <${process.env.RESEND_FROM_EMAIL || 'alerts@voltgridjobs.com'}>`,
    to: email,
    subject,
    html,
    text,
  })
}

export async function POST(req: NextRequest) {
  // Rate limiting — 10 signups per IP per hour
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
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Invalid email address' }, { status: 400 })
  }

  const normalizedEmail = email.toLowerCase().trim()
  const normalizedCategory = category || null
  const adminClient = createAdminClient()
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://voltgridjobs.com'

  // Cap: max 5 active alerts per email (prevents abuse)
  const { count } = await adminClient
    .from('job_alerts')
    .select('*', { count: 'exact', head: true })
    .eq('email', normalizedEmail)
    .eq('is_active', true)

  if (count !== null && count >= 5) {
    return NextResponse.json(
      { error: 'Maximum alert limit reached for this email.' },
      { status: 429 }
    )
  }

  // Source page — best effort from referer header
  const sourcePage = req.headers.get('referer') || null

  // Get user if logged in (best-effort — doesn't block unauthenticated signups)
  const { data: { user } } = await supabase.auth.getUser()

  // Check if a row already exists for this (email, category) — the table
  // has a unique constraint on that pair. Three scenarios:
  //   1. No existing row                 → INSERT, send confirmation email
  //   2. Existing row, unconfirmed       → RESEND confirmation (user likely missed it)
  //   3. Existing row, already confirmed → no-op, return success so form says "you're already subscribed"
  const { data: existing } = await adminClient
    .from('job_alerts')
    .select('id, confirmation_token, confirmed_at, is_active')
    .eq('email', normalizedEmail)
    .eq('category', normalizedCategory)
    .maybeSingle()

  if (existing) {
    if (existing.confirmed_at && existing.is_active) {
      return NextResponse.json({
        success: true,
        status: 'already_subscribed',
        message: "You're already subscribed to these alerts.",
      })
    }

    // Unconfirmed (or previously unsubscribed) — reactivate and resend confirmation
    await adminClient
      .from('job_alerts')
      .update({
        is_active: true,
        unsubscribed_at: null,
        keywords: keywords || null,
        location: location || null,
        frequency: frequency || 'daily',
        ...(background && { background }),
        ...(sourcePage && { source_page: sourcePage }),
      })
      .eq('id', existing.id)

    try {
      await sendConfirmation(normalizedEmail, existing.confirmation_token, normalizedCategory, baseUrl)
    } catch (err) {
      console.error('[alerts] resend confirmation error:', err)
    }

    return NextResponse.json({
      success: true,
      status: 'confirmation_resent',
      message: 'Check your email to confirm your alert.',
    })
  }

  // New row — insert with confirmation_token defaulted by the DB, read it back
  const { data: inserted, error } = await adminClient
    .from('job_alerts')
    .insert({
      email: normalizedEmail,
      user_id: user?.id || null,
      keywords: keywords || null,
      location: location || null,
      category: normalizedCategory,
      frequency: frequency || 'daily',
      is_active: true,
      confirmed_at: null,
      ...(background && { background }),
      ...(job_id && { source_job_id: job_id }),
      ...(sourcePage && { source_page: sourcePage }),
    })
    .select('id, confirmation_token')
    .single()

  if (error || !inserted) {
    return NextResponse.json(
      { error: error?.message || 'Failed to create alert' },
      { status: 500 }
    )
  }

  try {
    await sendConfirmation(normalizedEmail, inserted.confirmation_token, normalizedCategory, baseUrl)
  } catch (err) {
    // Non-critical — the row is saved, the user can request a resend
    console.error('[alerts] confirmation email error:', err)
  }

  // Employer notification for matching listings — unchanged behaviour
  try {
    if (process.env.RESEND_API_KEY) {
      const resend = new Resend(process.env.RESEND_API_KEY)
      let jobQuery = adminClient
        .from('jobs')
        .select('id, title, company_name, location, category, employer_email')
        .eq('is_active', true)
      if (normalizedCategory) jobQuery = jobQuery.eq('category', normalizedCategory)
      if (location) jobQuery = jobQuery.ilike('location', `%${location}%`)
      const { data: matchingJobs } = await jobQuery.limit(20)

      if (matchingJobs?.length) {
        const categoryLabel = normalizedCategory || 'trades'
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
    console.error('[alerts] Employer notification error:', notifyErr)
  }

  return NextResponse.json({
    success: true,
    status: 'confirmation_sent',
    message: 'Check your email to confirm your alert.',
  })
}
