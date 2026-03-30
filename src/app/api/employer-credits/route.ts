import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = createAdminClient()

  // Find employer by user_id
  const { data: employer } = await admin
    .from('employers')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!employer) return NextResponse.json({ post_credits: 0, is_pro: false })

  const { data: credits } = await admin
    .from('employer_credits')
    .select('post_credits, is_pro')
    .eq('employer_id', employer.id)
    .maybeSingle()

  return NextResponse.json({
    post_credits: credits?.post_credits ?? 0,
    is_pro: credits?.is_pro ?? false,
  })
}
