import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const INGEST_SECRET = process.env.INGEST_SECRET

export async function GET(req: NextRequest) {
  // Auth check
  const authHeader = req.headers.get('authorization')

  if (!authHeader || authHeader !== `Bearer ${INGEST_SECRET}` || !INGEST_SECRET) {
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
      { error: 'Stripe API error', detail: message },
      { status: 500 }
    )
  }
}
