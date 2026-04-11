import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

/**
 * Token-based unsubscribe. Accepts GET so the link in email works
 * without a form submission. Sets is_active=false and records
 * unsubscribed_at. Redirects to /alerts/unsubscribed with a status
 * indicator the page can read to show the right copy.
 */
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('t')
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://voltgridjobs.com'

  if (!token || !/^[0-9a-f-]{36}$/i.test(token)) {
    return NextResponse.redirect(`${baseUrl}/alerts/unsubscribed?status=invalid`, 302)
  }

  const admin = createAdminClient()
  const nowIso = new Date().toISOString()

  const { data, error } = await admin
    .from('job_alerts')
    .update({ is_active: false, unsubscribed_at: nowIso })
    .eq('confirmation_token', token)
    .select('id')
    .maybeSingle()

  if (error) {
    console.error('[alerts/unsubscribe] update error:', error)
    return NextResponse.redirect(`${baseUrl}/alerts/unsubscribed?status=error`, 302)
  }
  if (!data) {
    return NextResponse.redirect(`${baseUrl}/alerts/unsubscribed?status=notfound`, 302)
  }

  return NextResponse.redirect(`${baseUrl}/alerts/unsubscribed?status=ok`, 302)
}
