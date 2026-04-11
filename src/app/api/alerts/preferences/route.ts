import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

/**
 * Token-based preference update. Subscriber pastes their manage link,
 * edits the form, and POSTs here. Only the fields the preference
 * center lets you change are accepted — no write access to email,
 * confirmation_token, or audit timestamps.
 */
const ALLOWED_FREQUENCIES = new Set(['daily', 'weekly'])

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 })
  }

  const { token, frequency, keywords, location } = body as {
    token?: string
    frequency?: string
    keywords?: string
    location?: string
  }

  if (!token || !/^[0-9a-f-]{36}$/i.test(token)) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 400 })
  }
  if (frequency && !ALLOWED_FREQUENCIES.has(frequency)) {
    return NextResponse.json({ error: 'Invalid frequency' }, { status: 400 })
  }

  const admin = createAdminClient()

  const updates: Record<string, unknown> = {}
  if (frequency) updates.frequency = frequency
  if (keywords !== undefined) updates.keywords = keywords || null
  if (location !== undefined) updates.location = location || null

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'No changes' }, { status: 400 })
  }

  const { data, error } = await admin
    .from('job_alerts')
    .update(updates)
    .eq('confirmation_token', token)
    .select('id')
    .maybeSingle()

  if (error) {
    console.error('[alerts/preferences] update error:', error)
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 })
  }
  if (!data) {
    return NextResponse.json({ error: 'Alert not found' }, { status: 404 })
  }

  return NextResponse.json({ success: true })
}
