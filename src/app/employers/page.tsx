import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Post a Job — VoltGrid Jobs',
  description: 'Hire electricians, HVAC techs, and low voltage specialists for your data center project. Starting at $149.',
}

const PLANS = [
  {
    name: 'Single Post',
    price: '$149',
    period: 'one-time',
    description: '1 listing, active for 30 days',
    features: ['1 job listing', '30 days active', 'Standard placement', 'Apply via your URL or email'],
    cta: 'Post One Job',
    href: '/post-job?plan=single_post',
    highlighted: false,
  },
  {
    name: '5-Pack',
    price: '$499',
    period: 'one-time',
    description: '5 listings at $99 each',
    features: ['5 job listings', '60-day window to use', 'Standard placement', 'Best for ongoing hiring'],
    cta: 'Buy 5-Pack',
    href: '/post-job?plan=five_pack',
    highlighted: true,
  },
  {
    name: 'Pro Monthly',
    price: '$799',
    period: '/ month',
    description: 'Unlimited postings for power hirers',
    features: ['Unlimited listings', 'Featured employer profile', 'Featured badge on listings', 'Priority support'],
    cta: 'Go Pro',
    href: '/post-job?plan=pro_monthly',
    highlighted: false,
  },
]

export default function EmployersPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16">
      <div className="text-center mb-14">
        <h1 className="text-4xl font-bold text-white mb-4">
          Hire the trades workers building AI infrastructure
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          VoltGrid is the only job board built specifically for data center and AI infrastructure trades roles.
          Reach electricians, HVAC techs, and low voltage specialists who are actively looking.
        </p>
      </div>

      {/* Why VoltGrid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-16">
        {[
          { icon: '🎯', title: 'Niche audience', desc: 'Every visitor is a trades professional looking for exactly this type of work.' },
          { icon: '⚡', title: 'Fast to post', desc: 'Your job goes live in under 5 minutes. No approval process, no waiting.' },
          { icon: '💰', title: 'Pay per result', desc: 'Flat pricing, no pay-per-click. Know your cost upfront.' },
        ].map((item) => (
          <div key={item.title} className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <div className="text-2xl mb-3">{item.icon}</div>
            <h3 className="font-semibold text-white mb-2">{item.title}</h3>
            <p className="text-gray-400 text-sm">{item.desc}</p>
          </div>
        ))}
      </div>

      {/* Pricing */}
      <h2 className="text-2xl font-bold text-white text-center mb-8">Simple, flat pricing</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
        {PLANS.map((plan) => (
          <div
            key={plan.name}
            className={`rounded-2xl border p-6 flex flex-col ${
              plan.highlighted
                ? 'border-yellow-400 bg-yellow-400/5'
                : 'border-gray-800 bg-gray-900'
            }`}
          >
            {plan.highlighted && (
              <div className="text-yellow-400 text-xs font-semibold uppercase tracking-wider mb-3">
                Most Popular
              </div>
            )}
            <h3 className="text-xl font-bold text-white mb-1">{plan.name}</h3>
            <div className="flex items-baseline gap-1 mb-1">
              <span className="text-3xl font-bold text-white">{plan.price}</span>
              <span className="text-gray-500 text-sm">{plan.period}</span>
            </div>
            <p className="text-gray-400 text-sm mb-6">{plan.description}</p>
            <ul className="space-y-2 mb-8 flex-1">
              {plan.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-gray-300">
                  <span className="text-green-400 mt-0.5">✓</span>
                  {f}
                </li>
              ))}
            </ul>
            <Link
              href={plan.href}
              className={`block text-center py-3 rounded-xl font-semibold transition-colors ${
                plan.highlighted
                  ? 'bg-yellow-400 text-gray-950 hover:bg-yellow-300'
                  : 'border border-gray-700 text-white hover:border-gray-500'
              }`}
            >
              {plan.cta}
            </Link>
          </div>
        ))}
      </div>

      <p className="text-center text-gray-500 text-sm">
        Need a featured add-on? Add +$99 to any listing to pin it to the top of its category for 30 days.
        <br />Questions? Email <a href="mailto:hello@voltgridjobs.com" className="text-yellow-400 hover:text-yellow-300">hello@voltgridjobs.com</a>
      </p>
    </div>
  )
}
