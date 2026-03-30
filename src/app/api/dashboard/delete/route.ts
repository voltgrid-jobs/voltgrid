import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { job_id } = await req.json()
  if (!job_id) return NextResponse.json({ error: 'Missing job_id' }, { status: 400 })

  const { data: employer } = await supabase
    .from('employers').select('id').eq('user_id', user.id).single()
  if (!employer) return NextResponse.json({ error: 'No employer profile' }, { status: 403 })

  const { error } = await supabase
    .from('jobs')
    .delete()
    .eq('id', job_id)
    .eq('employer_id', (employer as { id: string }).id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
