import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Support both JSON and form data
  let alertId: string | null = null
  const contentType = req.headers.get('content-type') || ''
  if (contentType.includes('application/json')) {
    const body = await req.json()
    alertId = body.alert_id
  } else {
    const formData = await req.formData()
    alertId = formData.get('alert_id') as string
  }

  if (!alertId) return NextResponse.json({ error: 'Missing alert_id' }, { status: 400 })

  await supabase.from('job_alerts').delete().eq('id', alertId).eq('user_id', user.id)
  return NextResponse.json({ deleted: true })
}
