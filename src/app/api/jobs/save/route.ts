import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { job_id } = await req.json()
  if (!job_id) return NextResponse.json({ error: 'Missing job_id' }, { status: 400 })

  // Ensure user exists in public.users
  await supabase.from('users').upsert({
    id: user.id,
    email: user.email!,
    full_name: user.user_metadata?.full_name,
  })

  // Toggle save
  const { data: existing } = await supabase
    .from('saved_jobs')
    .select('id')
    .eq('user_id', user.id)
    .eq('job_id', job_id)
    .single()

  if (existing) {
    await supabase.from('saved_jobs').delete().eq('id', existing.id)
    return NextResponse.json({ saved: false })
  } else {
    await supabase.from('saved_jobs').insert({ user_id: user.id, job_id })
    return NextResponse.json({ saved: true })
  }
}
