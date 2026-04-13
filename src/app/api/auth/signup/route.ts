import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { Resend } from 'resend'

const BG = '#030712'
const FG = '#f9fafb'
const FG_MUTED = '#9ca3af'
const YELLOW = '#facc15'
const BORDER = '#1f2937'

function buildSignupWelcomeEmail(baseUrl: string, fullName: string | null) {
  const name = fullName?.split(' ')[0] || 'there'

  const subject = 'Welcome to VoltGrid Jobs'
  const html = `<div style="font-family:system-ui,sans-serif;max-width:600px;margin:0 auto;padding:32px 24px;background:${BG};color:${FG}">
  <p style="font-size:18px;font-weight:700;color:${YELLOW};margin:0 0 16px 0">⚡ Welcome to VoltGrid Jobs</p>

  <p style="font-size:15px;line-height:1.7;color:${FG_MUTED};margin:0 0 20px 0">
    Hi ${name}, your account is ready. Here is what you can do:
  </p>

  <ul style="margin:0 0 24px 0;padding:0;list-style:none">
    <li style="display:flex;gap:12px;margin-bottom:12px">
      <span style="color:${YELLOW};font-weight:700;flex-shrink:0">→</span>
      <span style="color:${FG_MUTED};font-size:14px;line-height:1.6">
        <strong style="color:${FG}">Browse jobs</strong> at data centers and AI infrastructure sites from CoreWeave, xAI, T5, and more.
      </span>
    </li>
    <li style="display:flex;gap:12px;margin-bottom:12px">
      <span style="color:${YELLOW};font-weight:700;flex-shrink:0">→</span>
      <span style="color:${FG_MUTED};font-size:14px;line-height:1.6">
        <strong style="color:${FG}">Save jobs</strong> and set up daily alerts for new listings matching your trade and location.
      </span>
    </li>
    <li style="display:flex;gap:12px">
      <span style="color:${YELLOW};font-weight:700;flex-shrink:0">→</span>
      <span style="color:${FG_MUTED};font-size:14px;line-height:1.6">
        <strong style="color:${FG}">Post jobs</strong> to reach qualified electricians, HVAC techs, and low voltage specialists.
      </span>
    </li>
  </ul>

  <div style="margin:0 0 16px 0">
    <a href="${baseUrl}/dashboard"
      style="display:inline-block;background:${YELLOW};color:#0a0a0a;padding:12px 24px;border-radius:10px;font-weight:700;font-size:14px;text-decoration:none">
      Go to Dashboard →
    </a>
  </div>

  <div style="margin:0 0 24px 0">
    <a href="${baseUrl}/jobs"
      style="display:inline-block;background:transparent;color:${FG_MUTED};border:1px solid ${BORDER};padding:12px 24px;border-radius:10px;font-weight:600;font-size:14px;text-decoration:none">
      Browse open jobs
    </a>
  </div>

  <!-- Salary guide CTA -->
  <div style="background:#111827;border:1px solid ${BORDER};border-radius:12px;padding:20px;margin:0 0 24px 0">
    <p style="font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:${YELLOW};margin:0 0 8px 0">Free guide</p>
    <p style="font-size:16px;font-weight:700;color:${FG};margin:0 0 6px 0">2026 US Data Center Trades Salary Guide</p>
    <p style="font-size:13px;line-height:1.6;color:${FG_MUTED};margin:0 0 14px 0">
      Real pay bands by market, role taxonomy, and compensation benchmarks.
    </p>
    <a href="${baseUrl}/salary-guide" style="display:inline-block;background:transparent;color:${YELLOW};border:1px solid ${YELLOW};padding:10px 18px;border-radius:8px;font-weight:700;font-size:13px;text-decoration:none">
      Read the salary guide →
    </a>
  </div>

  <p style="font-size:13px;color:#6b7280;border-top:1px solid ${BORDER};padding-top:16px;margin:0">
    VoltGrid Jobs — built for trades workers in the data center industry.<br>
    <a href="${baseUrl}" style="color:${YELLOW};text-decoration:none">voltgridjobs.com</a>
  </p>
</div>`

  const text = `Welcome to VoltGrid Jobs

Hi ${name}, your account is ready. Here's what you can do:

- Browse jobs at data centers and AI infrastructure sites
- Save jobs and set up daily alerts for new listings
- Post jobs to reach qualified trades workers

Go to Dashboard: ${baseUrl}/dashboard
Browse open jobs: ${baseUrl}/jobs
2026 Salary Guide: ${baseUrl}/salary-guide

— voltgridjobs.com`

  return { subject, html, text }
}

export async function POST(req: NextRequest) {
  const { email, password, fullName } = await req.json()

  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password required.' }, { status: 400 })
  }
  if (password.length < 8) {
    return NextResponse.json({ error: 'Password must be at least 8 characters.' }, { status: 400 })
  }

  const admin = createAdminClient()
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://voltgridjobs.com'

  // Create user with password, auto-confirmed (skip Supabase's default email)
  const { data: newUser, error: createErr } = await admin.auth.admin.createUser({
    email: email.toLowerCase().trim(),
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName || null },
  })

  if (createErr) {
    // Check if user already exists
    if (createErr.message?.includes('already') || createErr.message?.includes('duplicate')) {
      return NextResponse.json({ error: 'An account with this email already exists. Try signing in instead.' }, { status: 409 })
    }
    return NextResponse.json({ error: createErr.message }, { status: 400 })
  }

  if (!newUser?.user) {
    return NextResponse.json({ error: 'Failed to create account.' }, { status: 500 })
  }

  // Link any orphaned alerts
  await admin
    .from('job_alerts')
    .update({ user_id: newUser.user.id })
    .eq('email', email.toLowerCase().trim())
    .is('user_id', null)

  // Send branded welcome email via Resend
  try {
    if (process.env.RESEND_API_KEY) {
      const resend = new Resend(process.env.RESEND_API_KEY)
      const { subject, html, text } = buildSignupWelcomeEmail(baseUrl, fullName)
      await resend.emails.send({
        from: `VoltGrid Jobs <${process.env.RESEND_FROM_EMAIL || 'alerts@voltgridjobs.com'}>`,
        to: email.toLowerCase().trim(),
        subject,
        html,
        text,
      })
    }
  } catch (err) {
    console.error('[auth/signup] welcome email error:', err)
  }

  return NextResponse.json({ success: true })
}
