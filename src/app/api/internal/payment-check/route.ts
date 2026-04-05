import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const PAYMENT_CHECK_SECRET = process.env.PAYMENT_CHECK_SECRET

export async function GET(req: NextRequest) {
  // Auth via query parameter (Felix's web_fetch does not support custom headers)
  const secret = req.nextUrl.searchParams.get('secret')

  if (!PAYMENT_CHECK_SECRET || secret !== PAYMENT_CHECK_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const stripeKey = process.env.STRIPE_SECRET_KEY
  if (!stripeKey) {
    return NextResponse.json(
      { error: 'STRIPE_SECRET_KEY is not configured' },
      { status: 500 }
    )
  }

  try {
    const stripe = new Stripe(stripeKey, { apiVersion: '2026-03-25.dahlia' })

    const sixHoursAgo = Math.floor(Date.now() / 1000) - 6 * 60 * 60

    const charges = await stripe.charges.list({
      limit: 10,
      created: { gte: sixHoursAgo },
    })

    const payments = charges.data
      .filter((charge) => charge.status === 'succeeded')
      .map((charge) => ({
        id: charge.id,
        amount: charge.amount,
        currency: charge.currency,
        status: charge.status,
        created: charge.created,
        customer_email: charge.billing_details?.email ?? charge.receipt_email ?? null,
        description: charge.description ?? null,
      }))

    return NextResponse.json({
      payments,
      count: payments.length,
      timestamp: new Date().toISOString(),
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[payment-check] Stripe error:', message)
    return NextResponse.json(
      { error: 'Failed to fetch payment data' },
      { status: 500 }
    )
  }
}
