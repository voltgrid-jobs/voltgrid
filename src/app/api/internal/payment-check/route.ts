import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const INGEST_SECRET = process.env.INGEST_SECRET

export async function GET(req: NextRequest) {
  // Auth check (same pattern as other cron routes)
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

  const stripe = new Stripe(stripeKey, { apiVersion: '2025-01-27.acacia' })

  const sixHoursAgo = Math.floor(Date.now() / 1000) - 6 * 60 * 60

  const charges = await stripe.charges.list({
    limit: 10,
    created: { gte: sixHoursAgo },
  })

  const payments = charges.data.map((charge) => ({
    id: charge.id,
    amount: charge.amount,
    currency: charge.currency,
    status: charge.status,
    created: charge.created,
    customer_email: charge.billing_details?.email ?? charge.receipt_email ?? null,
  }))

  return NextResponse.json({
    payments,
    count: payments.length,
    timestamp: new Date().toISOString(),
  })
}
