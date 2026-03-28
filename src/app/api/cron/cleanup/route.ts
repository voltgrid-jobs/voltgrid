import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

const INGEST_SECRET = process.env.INGEST_SECRET

/**
 * Maintenance cron to deactivate expired jobs.
 * Runs via Vercel Cron.
 */
export async function GET(req: NextRequest) {
  // Auth check (matches ingest/send-alerts pattern)
  const authHeader = req.headers.get('authorization')
  const searchParams = req.nextUrl.searchParams
  const secretParam = searchParams.get('secret')
  
  const isAuthorized = 
    authHeader === `Bearer ${INGEST_SECRET}` || 
    (secretParam === INGEST_SECRET && !!INGEST_SECRET) ||
    req.headers.get('x-vercel-cron') === '1' // Trust Vercel's internal cron header if preferred

  if (!isAuthorized) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createAdminClient()
  const now = new Date().toISOString()

  // Deactivate jobs where expires_at < now
  const { data, error, count } = await supabase
    .from('jobs')
    .update({ is_active: false })
    .eq('is_active', true)
    .lt('expires_at', now)
    .select('id')

  if (error) {
    console.error('[cron/cleanup] Error:', error)
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }

  return NextResponse.json({ 
    success: true, 
    deactivated: data?.length || 0 
  })
}
