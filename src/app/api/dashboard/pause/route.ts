import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { job_id, active } = await req.json()
  if (!job_id) return NextResponse.json({ error: 'Missing job_id' }, { status: 400 })

  const { data: employers } = await supabase
    .from('employers').select('id').eq('user_id', user.id).order('created_at', { ascending: false })
  const employerIds = (employers ?? []).map((e: { id: string }) => e.id)
  if (employerIds.length === 0) return NextResponse.json({ error: 'No employer profile' }, { status: 403 })

  const { error } = await supabase
    .from('jobs')
    .update({ is_active: active })
    .eq('id', job_id)
    .in('employer_id', employerIds)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true, is_active: active })
}
