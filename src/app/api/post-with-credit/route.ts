import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import type { JobCategory, JobType } from '@/types'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = createAdminClient()

  // Find employer by user_id
  const { data: employer } = await admin
    .from('employers')
    .select('id, company_name')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!employer) {
    return NextResponse.json({ error: 'No employer account found' }, { status: 403 })
  }

  // Check credits
  const { data: credits } = await admin
    .from('employer_credits')
    .select('id, post_credits, is_pro')
    .eq('employer_id', employer.id)
    .maybeSingle()

  const hasCreditAvailable = (credits?.is_pro) || (credits?.post_credits ?? 0) > 0
  if (!hasCreditAvailable) {
    return NextResponse.json({ error: 'no_credits' }, { status: 403 })
  }

  const body = await req.json()
  const {
    company_name, company_email, title, category, job_type,
    location, remote, salary_min, salary_max, description, apply_url,
    per_diem, per_diem_rate, travel_required, shift_type, contract_length, is_union,
  } = body

  if (!company_name || !company_email || !title || !description || !location || !apply_url) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const isEmail = (apply_url as string).includes('@') && !(apply_url as string).startsWith('http')

  // Create job
  const { data: job, error: jobError } = await admin
    .from('jobs')
    .insert({
      employer_id: (employer as { id: string }).id,
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
      is_featured: credits?.is_pro ?? false,
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

  // Decrement credits (skip for pro)
  if (!credits?.is_pro && credits?.id) {
    await admin
      .from('employer_credits')
      .update({ post_credits: Math.max(0, (credits.post_credits ?? 1) - 1) })
      .eq('id', credits.id)
  }

  // Record in payments table
  await admin.from('payments').insert({
    employer_id: (employer as { id: string }).id,
    stripe_session_id: null,
    stripe_payment_intent_id: null,
    plan: 'credit_redemption',
    amount_cents: 0,
    currency: 'usd',
    status: 'complete',
    credits_added: credits?.is_pro ? 0 : -1,
  })

  const remainingCredits = credits?.is_pro ? 999 : Math.max(0, (credits?.post_credits ?? 1) - 1)

  return NextResponse.json({
    success: true,
    job_id: (job as { id: string }).id,
    credits_remaining: remainingCredits,
  })
}
