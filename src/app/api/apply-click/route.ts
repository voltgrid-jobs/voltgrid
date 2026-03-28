import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(req: NextRequest) {
  try {
    const { job_id, source } = await req.json()

    if (!job_id || typeof job_id !== 'string') {
      return NextResponse.json({ error: 'Missing job_id' }, { status: 400 })
    }

    const supabase = createAdminClient()
    const { error } = await supabase.from('apply_clicks').insert({
      job_id,
      source: source ?? 'unknown',
    })

    if (error) {
      console.error('[apply-click] Supabase error:', error)
      return NextResponse.json({ error: 'DB error' }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[apply-click] Unexpected error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
