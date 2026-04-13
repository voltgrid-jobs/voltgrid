import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

/**
 * Set password for a user identified by their alert confirmation token.
 * This allows users who were auto-created (passwordless) during alert
 * signup to set a password from the confirmation page without needing
 * an active session.
 */
export async function POST(req: NextRequest) {
  const { token, password } = await req.json()

  if (!token || !password) {
    return NextResponse.json({ error: 'Token and password required.' }, { status: 400 })
  }
  if (password.length < 8) {
    return NextResponse.json({ error: 'Password must be at least 8 characters.' }, { status: 400 })
  }

  const admin = createAdminClient()

  // Look up the alert to get the email
  const { data: alert } = await admin
    .from('job_alerts')
    .select('email, confirmed_at')
    .eq('confirmation_token', token)
    .maybeSingle()

  if (!alert || !alert.confirmed_at) {
    return NextResponse.json({ error: 'Invalid or unconfirmed token.' }, { status: 400 })
  }

  // Find the auth user for this email
  const { data: { users } } = await admin.auth.admin.listUsers({ perPage: 50, page: 1 })
  const authUser = users?.find(u => u.email === alert.email)

  if (!authUser) {
    return NextResponse.json({ error: 'No account found for this email.' }, { status: 404 })
  }

  // Set the password
  const { error } = await admin.auth.admin.updateUserById(authUser.id, { password })
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
