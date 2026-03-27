import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const formData = await req.formData()
  const jobId = formData.get('job_id') as string

  // Verify ownership
  const { data: employer } = await supabase
    .from('employers').select('id').eq('user_id', user.id).single()
  if (!employer) return NextResponse.json({ error: 'No employer profile' }, { status: 403 })

  await supabase
    .from('jobs')
    .update({ is_active: false })
    .eq('id', jobId)
    .eq('employer_id', (employer as { id: string }).id)

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  return NextResponse.redirect(`${siteUrl}/dashboard`)
}
