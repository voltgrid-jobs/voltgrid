import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createAdminClient } from '@/lib/supabase/admin'
import type { JobCategory, JobType } from '@/types'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  if (!webhookSecret) {
    console.error('STRIPE_WEBHOOK_SECRET is not configured')
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 })
  }
  if (!sig) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 })
  }

  let event
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
  } catch (err) {
    console.error('Webhook signature error:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object
    const meta = session.metadata || {}
    const supabase = createAdminClient()

    try {
      // Get full description from draft if available
      let description = meta.description || ''
      let applyUrl = meta.apply_url || ''
      let salaryMin = meta.salary_min ? parseInt(meta.salary_min) : null
      let salaryMax = meta.salary_max ? parseInt(meta.salary_max) : null
      let remote = meta.remote === 'true'

      if (meta.draft_id) {
        const { data: draft } = await supabase
          .from('job_drafts' as never)
          .select('*')
          .eq('id', meta.draft_id)
          .single()
        if (draft) {
          const d = draft as Record<string, unknown>
          description = (d.description as string) || description
          applyUrl = (d.apply_url as string) || applyUrl
          salaryMin = (d.salary_min as number) || salaryMin
          salaryMax = (d.salary_max as number) || salaryMax
          remote = (d.remote as boolean) ?? remote
        }
      }

      // Determine apply_url vs apply_email
      const isEmail = applyUrl.includes('@') && !applyUrl.startsWith('http')
      const applyEmail = isEmail ? applyUrl : null
      const applyUrlFinal = !isEmail && applyUrl ? applyUrl : null

      // Create or find employer
      let employerId: string | null = null
      const slug = meta.company_name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')

      const { data: existingEmployer } = await supabase
        .from('employers')
        .select('id')
        .eq('company_slug', slug)
        .single()

      if (existingEmployer) {
        employerId = (existingEmployer as { id: string }).id
      } else {
        const { data: newEmployer } = await supabase
          .from('employers')
          .insert({
            company_name: meta.company_name,
            company_slug: slug,
            user_id: null, // Will be linked when employer creates account
          })
          .select('id')
          .single()
        if (newEmployer) employerId = (newEmployer as { id: string }).id
      }

      // Create the job
      const { data: job, error: jobError } = await supabase
        .from('jobs')
        .insert({
          employer_id: employerId,
          employer_email: meta.company_email || null,
          title: meta.title,
          company_name: meta.company_name,
          category: (meta.category as JobCategory) || 'other',
          job_type: (meta.job_type as JobType) || 'full_time',
          location: meta.location || 'Remote',
          remote,
          salary_min: salaryMin,
          salary_max: salaryMax,
          salary_currency: 'USD',
          description,
          apply_url: applyUrlFinal,
          apply_email: applyEmail,
          source: 'direct',
          is_featured: false,
          is_active: true,
          expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        })
        .select('id')
        .single()

      if (jobError) throw jobError

      // Determine credits to add
      const creditsMap: Record<string, number> = {
        single_post: 0, // already used for this job
        five_pack: 4,   // 1 used now, 4 remaining
        pro_monthly: 999,
        featured_addon: 0,
      }
      const creditsToAdd = creditsMap[meta.plan] ?? 0
      const isPro = meta.plan === 'pro_monthly'

      // Upsert employer credits
      if (employerId) {
        const { data: existing } = await supabase
          .from('employer_credits').select('id, post_credits').eq('employer_id', employerId).single()
        if (existing) {
          await supabase.from('employer_credits').update({
            post_credits: (existing as { post_credits: number }).post_credits + creditsToAdd,
            is_pro: isPro || undefined,
            pro_renews_at: isPro ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() : undefined,
          }).eq('employer_id', employerId)
        } else {
          await supabase.from('employer_credits').insert({
            employer_id: employerId,
            post_credits: creditsToAdd,
            is_pro: isPro,
            pro_renews_at: isPro ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() : null,
          })
        }
      }

      // Record payment
      await supabase.from('payments').insert({
        employer_id: employerId,
        stripe_session_id: session.id,
        stripe_payment_intent_id: session.payment_intent,
        plan: meta.plan,
        amount_cents: session.amount_total,
        currency: session.currency,
        status: 'complete',
        credits_added: creditsToAdd + 1,
      })

      console.log('Job created:', (job as { id: string }).id)

      // AUTOMATION 4: Auto-feature all active Pro employer listings
      if (meta.plan === 'pro_monthly' && meta.company_email) {
        try {
          await supabase
            .from('jobs')
            .update({ featured: true })
            .eq('employer_email', meta.company_email)
            .eq('is_active', true)
          console.log('[webhook] Pro listings featured for:', meta.company_email)
        } catch (featErr) {
          console.error('[webhook] Auto-feature error:', featErr)
        }
      }

      // AUTOMATION 5: Alert on first-ever paid listing
      const isPaidPlan = ['single_post', 'five_pack', 'pro_monthly'].includes(meta.plan)
      if (isPaidPlan && meta.company_email) {
        try {
          // Count prior completed payments for this employer (exclude current session)
          const { count: priorCount } = await supabase
            .from('payments')
            .select('*', { count: 'exact', head: true })
            .eq('employer_id', employerId as string)
            .eq('status', 'complete')
            .neq('stripe_session_id', session.id)

          if (priorCount === 0) {
            // First ever paid listing — notify via OpenClaw gateway
            const gatewayPayload = {
              channel: 'telegram',
              to: '7824040963',
              text: `🎉 First paid VoltGrid listing! Employer: ${meta.company_email}, Plan: ${meta.plan}`,
            }
            try {
              const gwRes = await fetch('http://127.0.0.1:18789/api/v1/outbound', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': 'Bearer 583304355e980be587bf6ffdd3d4ef021a0b42876f11df0d',
                },
                body: JSON.stringify(gatewayPayload),
              })
              if (!gwRes.ok) {
                console.error('[webhook] Gateway notification failed:', gwRes.status, await gwRes.text())
              } else {
                console.log('[webhook] First-paid alert sent for:', meta.company_email)
              }
            } catch (gwErr) {
              console.error('[webhook] Gateway call error (non-critical):', gwErr)
            }
          }
        } catch (firstPaidErr) {
          console.error('[webhook] First-paid check error:', firstPaidErr)
        }
      }

    } catch (err) {
      console.error('Webhook processing error:', err)
      return NextResponse.json({ error: 'Processing failed' }, { status: 500 })
    }
  }

  return NextResponse.json({ received: true })
}
