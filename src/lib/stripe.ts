import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-03-25.dahlia',
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
    description: '5 listings at $99 each, use within 60 days',
    price_cents: 49900,
    credits: 5,
  },
  pro_monthly: {
    name: 'Pro Monthly',
    description: 'Unlimited listings + featured employer profile',
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
