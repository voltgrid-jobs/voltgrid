import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextRequest, NextResponse } from 'next/server'

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
  return NextResponse.json({ success: true })
}
