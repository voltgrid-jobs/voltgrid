import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import type { JobCategory, JobType } from '@/types'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: employers } = await supabase
    .from('employers').select('id').eq('user_id', user.id)
  const employerIds = (employers ?? []).map((e: { id: string }) => e.id)
  if (employerIds.length === 0) return NextResponse.json({ error: 'No employer profile' }, { status: 403 })

  const body = await req.json()
  const {
    job_id, company_name, company_email, title, category, job_type,
    location, remote, salary_min, salary_max, description, apply_url,
    per_diem, per_diem_rate, travel_required, shift_type, contract_length, is_union,
  } = body

  if (!job_id) return NextResponse.json({ error: 'Missing job_id' }, { status: 400 })
  if (!title || !description || !location) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const isEmail = (apply_url as string)?.includes('@') && !(apply_url as string)?.startsWith('http')

  const { error } = await supabase
    .from('jobs')
    .update({
      title,
      company_name,
      employer_email: company_email || null,
      category: (category as JobCategory) || 'other',
      job_type: (job_type as JobType) || 'full_time',
      location,
      remote: !!remote,
      salary_min: salary_min ? parseInt(salary_min) : null,
      salary_max: salary_max ? parseInt(salary_max) : null,
      description,
      apply_url: !isEmail && apply_url ? apply_url : null,
      apply_email: isEmail ? apply_url : null,
      per_diem: !!per_diem,
      per_diem_rate: per_diem_rate ? parseInt(per_diem_rate) : null,
      travel_required: travel_required || null,
      shift_type: shift_type || null,
      contract_length: contract_length || null,
      is_union: !!is_union,
    })
    .eq('id', job_id)
    .in('employer_id', employerIds)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
