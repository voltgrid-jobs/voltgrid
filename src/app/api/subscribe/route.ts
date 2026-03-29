import { createAdminClient } from '@/lib/supabase/admin'
import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

// In-memory rate limit: 3 submits per IP per hour
const rateLimitStore = new Map<string, { count: number; resetAt: number }>()
const RATE_LIMIT_MAX = 3
const RATE_LIMIT_WINDOW = 60 * 60 * 1000

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

export async function POST(req: NextRequest) {
  const ip = getClientIp(req)
  if (!checkRateLimit(ip)) {
    return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 })
  }

  const body = await req.json()
  const email = typeof body.email === 'string' ? body.email.toLowerCase().trim() : ''

  if (!email) {
    return NextResponse.json({ error: 'Email required' }, { status: 400 })
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Invalid email address' }, { status: 400 })
  }

  const adminClient = createAdminClient()
  const { error } = await adminClient
    .from('email_subscribers')
    .upsert({ email, source: 'homepage' }, { onConflict: 'email', ignoreDuplicates: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Confirmation email
  try {
    if (process.env.RESEND_API_KEY) {
      const resend = new Resend(process.env.RESEND_API_KEY)
      await resend.emails.send({
        from: `VoltGrid Jobs <${process.env.RESEND_FROM_EMAIL || 'alerts@voltgridjobs.com'}>`,
        to: email,
        subject: "You're on the VoltGrid list",
        html: `<div style="font-family:system-ui,sans-serif;max-width:600px;margin:0 auto;padding:32px 24px;background:#030712;color:#f9fafb">
          <p style="font-size:18px;font-weight:700;color:#facc15;margin-bottom:12px">⚡ You're on the list</p>
          <p style="font-size:15px;line-height:1.6;color:#d1d5db">
            We'll keep you in the loop on high-paying trades jobs at data centers and AI infrastructure sites.
          </p>
          <p style="font-size:13px;color:#6b7280;margin-top:24px">
            VoltGrid Jobs &mdash; Built for trades workers in the data center industry.<br>
            <a href="https://voltgridjobs.com" style="color:#facc15">voltgridjobs.com</a>
          </p>
        </div>`,
      })
    }
  } catch (emailErr) {
    // Non-critical — don't break the signup flow
    console.error('[subscribe] Confirmation email error:', emailErr)
  }

  return NextResponse.json({ success: true })
}
