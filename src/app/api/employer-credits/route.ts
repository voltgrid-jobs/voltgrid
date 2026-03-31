import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

// Returns available credits for the PostJobForm credit check.
// Combines free credits (email-keyed admin grants) and paid credits (employer_id Stripe).
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ post_credits: 0, is_pro: false })

  const admin = createAdminClient()

  // Check free credits by email (admin-granted outreach credits)
  let freeCredits = 0
  if (user.email) {
    const { data: emailRecord } = await admin
      .from('employer_credits')
      .select('credits_remaining')
      .eq('employer_email', user.email.toLowerCase())
      .maybeSingle()
    freeCredits = (emailRecord as { credits_remaining: number } | null)?.credits_remaining ?? 0
  }

  // Check paid credits by employer_id (Stripe 5-pack / pro_monthly)
  const { data: employers } = await admin
    .from('employers')
    .select('id')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const employerIds = (employers ?? []).map((e: { id: string }) => e.id)
  let paidCredits = 0
  let isPro = false

  if (employerIds.length > 0) {
    const { data: paidRecord } = await admin
      .from('employer_credits')
      .select('post_credits, is_pro')
      .in('employer_id', employerIds)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (paidRecord) {
      paidCredits = (paidRecord as { post_credits: number }).post_credits ?? 0
      isPro = (paidRecord as { is_pro: boolean }).is_pro ?? false
    }
  }

  return NextResponse.json({
    post_credits: freeCredits + paidCredits,
    is_pro: isPro,
  })
}
