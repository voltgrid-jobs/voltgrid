import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createAdminClient } from '@/lib/supabase/admin'
import type { JobCategory, JobType } from '@/types'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  let event
  try {
    if (webhookSecret && sig) {
      event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
    } else {
      // Dev mode: parse directly
      event = JSON.parse(body)
    }
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

      // Record payment
      await supabase.from('payments').insert({
        employer_id: employerId,
        stripe_session_id: session.id,
        stripe_payment_intent_id: session.payment_intent,
        plan: meta.plan,
        amount_cents: session.amount_total,
        currency: session.currency,
        status: 'complete',
        credits_added: 1,
      })

      console.log('Job created:', (job as { id: string }).id)
    } catch (err) {
      console.error('Webhook processing error:', err)
      return NextResponse.json({ error: 'Processing failed' }, { status: 500 })
    }
  }

  return NextResponse.json({ received: true })
}
