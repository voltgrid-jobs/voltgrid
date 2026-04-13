import { createClient } from '@supabase/supabase-js'

// Service role client — only use in server-side code / API routes
export function createAdminClient() {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    console.error('[createAdminClient] Missing required env vars:', {
      hasSupabaseUrl: !!supabaseUrl,
      hasServiceRoleKey: !!serviceRoleKey,
      supabaseUrl: supabaseUrl ? '***' : 'MISSING',
      serviceRoleKeyLength: serviceRoleKey ? serviceRoleKey.length : 0,
    })
  }

  return createClient(
    supabaseUrl!,
    serviceRoleKey!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}
