export const dynamic = 'force-dynamic'

export async function GET() {
  return Response.json({
    SUPABASE_URL: process.env.SUPABASE_URL ? 'present_len_'+process.env.SUPABASE_URL.length : 'missing',
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'present_len_'+process.env.NEXT_PUBLIC_SUPABASE_URL.length : 'missing',
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY ? 'present_len_'+process.env.SUPABASE_ANON_KEY.length : 'missing',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'present_len_'+process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.length : 'missing',
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY ? 'present_len_'+process.env.STRIPE_SECRET_KEY.length : 'missing',
    NODE_ENV: process.env.NODE_ENV,
  })
}
