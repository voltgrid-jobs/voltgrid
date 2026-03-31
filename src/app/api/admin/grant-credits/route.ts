import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(req: NextRequest) {
  // Bearer token auth — ADMIN_SECRET env var
  const authHeader = req.headers.get('authorization')
  const adminSecret = process.env.ADMIN_SECRET
  if (!adminSecret || authHeader !== `Bearer ${adminSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json().catch(() => null)
  if (!body) return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })

  const { email, credits, reason, grantedBy } = body
  if (!email || !credits || typeof credits !== 'number' || credits < 1 || !Number.isInteger(credits)) {
    return NextResponse.json(
      { error: 'email and credits (positive integer) are required' },
      { status: 400 }
    )
  }

  const supabase = createAdminClient()
  const emailLower = (email as string).toLowerCase().trim()

  // Upsert by email: add to existing record or create new one
  const { data: existing } = await supabase
    .from('employer_credits')
    .select('id, credits_remaining, credits_total_granted')
    .eq('employer_email', emailLower)
    .maybeSingle()

  if (existing) {
    const rec = existing as { id: string; credits_remaining: number; credits_total_granted: number }
    const { error: updateError } = await supabase
      .from('employer_credits')
      .update({
        credits_remaining: rec.credits_remaining + credits,
        credits_total_granted: rec.credits_total_granted + credits,
        granted_by: grantedBy || null,
        reason: reason || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', rec.id)
    if (updateError) {
      console.error('[grant-credits] update error:', updateError)
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }
  } else {
    const { error: insertError } = await supabase
      .from('employer_credits')
      .insert({
        employer_email: emailLower,
        credits_remaining: credits,
        credits_total_granted: credits,
        granted_by: grantedBy || null,
        reason: reason || null,
      })
    if (insertError) {
      console.error('[grant-credits] insert error:', insertError)
      return NextResponse.json({ error: insertError.message }, { status: 500 })
    }
  }

  // Audit trail
  await supabase.from('credit_events').insert({
    employer_email: emailLower,
    event_type: 'granted',
    credits_delta: credits,
    reason: reason || null,
    granted_by: grantedBy || null,
  })

  return NextResponse.json({ ok: true, creditsGranted: credits, employerEmail: emailLower })
}
