import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const body = await req.json()
  const { email, keywords, location, category, frequency } = body

  if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 })

  // Get user if logged in
  const { data: { user } } = await supabase.auth.getUser()

  const { error } = await supabase.from('job_alerts').insert({
    email,
    user_id: user?.id || null,
    keywords: keywords || null,
    location: location || null,
    category: category || null,
    frequency: frequency || 'daily',
    is_active: true,
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
