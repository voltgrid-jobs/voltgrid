import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const jobId = new URL(req.url).searchParams.get('job_id')
  if (!jobId) return NextResponse.json({ error: 'Missing job_id' }, { status: 400 })

  const { data: employers } = await supabase
    .from('employers').select('id').eq('user_id', user.id)
  const employerIds = (employers ?? []).map((e: { id: string }) => e.id)
  if (employerIds.length === 0) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })

  const { data: job, error } = await supabase
    .from('jobs')
    .select('*')
    .eq('id', jobId)
    .in('employer_id', employerIds)
    .single()

  if (error || !job) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(job)
}
