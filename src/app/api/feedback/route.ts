import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { user_type, rating, message, page_url } = body

    if (rating !== undefined && (typeof rating !== 'number' || rating < 1 || rating > 5)) {
      return NextResponse.json({ error: 'Invalid rating' }, { status: 400 })
    }
    if (user_type && !['job_seeker', 'employer'].includes(user_type)) {
      return NextResponse.json({ error: 'Invalid user_type' }, { status: 400 })
    }

    const supabase = createAdminClient()
    const { error } = await supabase.from('feedback').insert({
      user_type: user_type || null,
      rating: rating || null,
      message: message ? String(message).slice(0, 2000) : null,
      page_url: page_url ? String(page_url).slice(0, 500) : null,
    })

    if (error) {
      console.error('feedback insert error:', error)
      return NextResponse.json({ error: 'Failed to save' }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}
