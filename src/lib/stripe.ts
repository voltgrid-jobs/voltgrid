import Stripe from 'stripe'

let _stripe: Stripe | null = null

export function getStripe(): Stripe {
  if (!_stripe) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY is not set')
    }
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2026-03-25.dahlia',
    })
  }
  return _stripe
}

// Lazy singleton — use getStripe() in route handlers
export const stripe = new Proxy({} as Stripe, {
  get(_target, prop) {
    return (getStripe() as unknown as Record<string | symbol, unknown>)[prop]
  },
})

export const PLANS = {
  single_post: {
    name: 'Single Job Post',
    description: '1 listing, active for 30 days',
    price_cents: 14900,
    credits: 1,
  },
  five_pack: {
    name: '5-Pack',
    description: '5 listings at $99 each — use any time',
    price_cents: 49900,
    credits: 5,
  },
  pro_monthly: {
    name: 'Pro Monthly',
    description: 'Unlimited listings + featured badge on every listing',
    price_cents: 79900,
    credits: 999,
    recurring: true,
  },
  featured_addon: {
    name: 'Featured Listing',
    description: 'Pin to top of category for 30 days',
    price_cents: 9900,
    credits: 0,
  },
} as const
