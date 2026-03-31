import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import type { JobCategory, JobType } from '@/types'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = createAdminClient()
  const userEmail = user.email?.toLowerCase()

  // ── Determine credit source ────────────────────────────────────────────────
  // 1. Free credits by email (admin-granted outreach)
  let freeCreditsRecord: { id: string; credits_remaining: number } | null = null
  if (userEmail) {
    const { data } = await admin
      .from('employer_credits')
      .select('id, credits_remaining')
      .eq('employer_email', userEmail)
      .maybeSingle()
    if (data && (data as { credits_remaining: number }).credits_remaining > 0) {
      freeCreditsRecord = data as { id: string; credits_remaining: number }
    }
  }

  // 2. Paid credits by employer_id (Stripe 5-pack / pro_monthly)
  const { data: employers } = await admin
    .from('employers')
    .select('id')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const employerIds = (employers ?? []).map((e: { id: string }) => e.id)
  let paidCreditsRecord: { id: string; post_credits: number; is_pro: boolean } | null = null

  if (employerIds.length > 0) {
    const { data } = await admin
      .from('employer_credits')
      .select('id, post_credits, is_pro')
      .in('employer_id', employerIds)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()
    if (data) {
      const rec = data as { id: string; post_credits: number; is_pro: boolean }
      if (rec.is_pro || rec.post_credits > 0) paidCreditsRecord = rec
    }
  }

  const useFreeCredit = !!freeCreditsRecord
  const usePaidCredit = !useFreeCredit && !!paidCreditsRecord
  if (!useFreeCredit && !usePaidCredit) {
    return NextResponse.json({ error: 'no_credits' }, { status: 403 })
  }

  // ── Create or find employer record ─────────────────────────────────────────
  const body = await req.json()
  const {
    company_name, company_email, title, category, job_type,
    location, remote, salary_min, salary_max, description, apply_url,
    per_diem, per_diem_rate, travel_required, shift_type, contract_length, is_union,
  } = body

  if (!company_name || !company_email || !title || !description || !location || !apply_url) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  // Find or create employer by slug
  let employerId: string | null = employerIds[0] ?? null
  if (!employerId) {
    const slug = (company_name as string)
      .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
    const { data: existingEmp } = await admin
      .from('employers').select('id').eq('company_slug', slug).maybeSingle()
    if (existingEmp) {
      employerId = (existingEmp as { id: string }).id
    } else {
      const { data: newEmp } = await admin.from('employers').insert({
        company_name, company_slug: slug, user_id: user.id,
      }).select('id').single()
      if (newEmp) employerId = (newEmp as { id: string }).id
    }
  }

  // ── Create job ─────────────────────────────────────────────────────────────
  const isEmail = (apply_url as string).includes('@') && !(apply_url as string).startsWith('http')
  // Free credit listings are featured (the cold outreach promise)
  const isFeatured = useFreeCredit || (paidCreditsRecord?.is_pro ?? false)

  const { data: job, error: jobError } = await admin
    .from('jobs')
    .insert({
      employer_id: employerId,
      employer_email: company_email,
      title,
      company_name,
      category: (category as JobCategory) || 'other',
      job_type: (job_type as JobType) || 'full_time',
      location,
      remote: !!remote,
      salary_min: salary_min ? parseInt(salary_min as string) : null,
      salary_max: salary_max ? parseInt(salary_max as string) : null,
      salary_currency: 'USD',
      description,
      apply_url: !isEmail ? apply_url : null,
      apply_email: isEmail ? apply_url : null,
      source: 'direct',
      is_active: true,
      is_featured: isFeatured,
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      per_diem: !!per_diem,
      per_diem_rate: per_diem_rate ? parseInt(per_diem_rate as string) : null,
      travel_required: travel_required || null,
      shift_type: shift_type || null,
      contract_length: contract_length || null,
      is_union: !!is_union,
    })
    .select('id')
    .single()

  if (jobError) {
    console.error('[post-with-credit] Job insert error:', jobError)
    return NextResponse.json({ error: 'Failed to create job' }, { status: 500 })
  }

  const jobId = (job as { id: string }).id

  // ── Consume credit ─────────────────────────────────────────────────────────
  if (useFreeCredit && freeCreditsRecord) {
    const newRemaining = Math.max(0, freeCreditsRecord.credits_remaining - 1)
    await admin.from('employer_credits')
      .update({ credits_remaining: newRemaining, updated_at: new Date().toISOString() })
      .eq('id', freeCreditsRecord.id)

    // Audit trail
    await admin.from('credit_events').insert({
      employer_email: userEmail!,
      event_type: 'used',
      credits_delta: -1,
      reason: 'job_posting',
      job_id: jobId,
    })
  } else if (usePaidCredit && paidCreditsRecord && !paidCreditsRecord.is_pro) {
    await admin.from('employer_credits')
      .update({ post_credits: Math.max(0, paidCreditsRecord.post_credits - 1) })
      .eq('id', paidCreditsRecord.id)
  }

  // Record in payments table
  await admin.from('payments').insert({
    employer_id: employerId,
    stripe_session_id: null,
    stripe_payment_intent_id: null,
    plan: useFreeCredit ? 'free_credit' : 'credit_redemption',
    amount_cents: 0,
    currency: 'usd',
    status: 'complete',
    credits_added: -1,
  })

  return NextResponse.json({ success: true, job_id: jobId })
}
