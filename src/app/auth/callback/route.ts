import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const { searchParams, origin } = new URL(req.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      // Link orphaned alerts to this user
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user?.email) {
          const admin = createAdminClient()
          await admin
            .from('job_alerts')
            .update({ user_id: user.id })
            .eq('email', user.email)
            .is('user_id', null)
        }
      } catch {
        // Non-critical
      }
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/auth/login?error=auth_failed`)
}
