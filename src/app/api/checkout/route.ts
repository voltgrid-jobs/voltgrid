import { NextRequest, NextResponse } from 'next/server'
import { stripe, PLANS } from '@/lib/stripe'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      plan,
      company_name,
      company_email,
      title,
      category,
      job_type,
      location,
      remote,
      salary_min,
      salary_max,
      description,
      apply_url,
    } = body

    if (!plan || !PLANS[plan as keyof typeof PLANS]) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
    }
    if (!company_name || !company_email || !title || !description) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const planDetails = PLANS[plan as keyof typeof PLANS]
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

    // Store draft job data in Stripe metadata so we can create it on webhook
    const metadata: Record<string, string> = {
      plan,
      company_name,
      company_email,
      title,
      category: category || 'other',
      job_type: job_type || 'full_time',
      location,
      remote: remote ? 'true' : 'false',
      salary_min: salary_min?.toString() || '',
      salary_max: salary_max?.toString() || '',
      description: description.substring(0, 500), // Stripe metadata 500 char limit per value
      apply_url: apply_url || '',
    }

    // Store full description in Supabase draft
    const supabase = createAdminClient()
    const { data: draft, error: draftError } = await supabase
      .from('job_drafts' as never)
      .insert({
        company_name,
        company_email,
        title,
        category,
        job_type,
        location,
        remote: !!remote,
        salary_min: salary_min ? parseInt(salary_min) : null,
        salary_max: salary_max ? parseInt(salary_max) : null,
        description,
        apply_url,
        plan,
      })
      .select('id')
      .single()

    if (!draftError && draft) {
      metadata.draft_id = (draft as { id: string }).id
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: planDetails.name,
              description: planDetails.description,
            },
            unit_amount: planDetails.price_cents,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      customer_email: company_email,
      success_url: `${siteUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/post-job`,
      metadata,
    })

    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error('Checkout error:', err)
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 })
  }
}
