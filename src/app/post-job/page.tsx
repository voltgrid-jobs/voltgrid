import type { Metadata } from 'next'
import { PostJobForm } from '@/components/jobs/PostJobForm'

export const metadata: Metadata = {
  title: 'Post a Job — VoltGrid Jobs',
  alternates: { canonical: 'https://voltgridjobs.com/post-job' },
}

function TrustRail() {
  return (
    <aside className="flex flex-col gap-4">
      {/* Mini stat */}
      <div
        className="rounded-xl p-4"
        style={{ background: 'var(--yellow-dim)', border: '1px solid var(--yellow-border)' }}
      >
        <p className="font-bold text-base" style={{ color: 'var(--yellow)' }}>
          ⚡ 97+ trades workers browse VoltGrid daily
        </p>
      </div>

      {/* Trust bullets */}
      <div className="rounded-xl p-4 flex flex-col gap-3" style={{ background: 'var(--bg-raised)', border: '1px solid var(--border)' }}>
        {[
          'Your listing goes live in under 5 minutes',
          'Reaches electricians, HVAC techs & low voltage specialists who know what a data center is',
          'Flat pricing — no bidding, no surprises',
          '14-day guarantee — technical issues? We\'ll make it right',
        ].map((point) => (
          <div key={point} className="flex items-start gap-2 text-sm" style={{ color: 'var(--fg-muted)' }}>
            <span className="flex-shrink-0 font-semibold mt-0.5" style={{ color: 'var(--green)' }}>✓</span>
            <span>{point}</span>
          </div>
        ))}
      </div>

      {/* Mock listing preview */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: 'var(--fg-faint)' }}>
          Preview — your listing will look like this
        </p>
        <div
          className="rounded-xl p-4"
          style={{ background: 'var(--bg-raised)', border: '1px solid var(--border)' }}
        >
          <div className="flex flex-wrap gap-1.5 mb-2">
            <span
              className="text-xs px-2 py-0.5 rounded"
              style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--fg-faint)' }}
            >
              [Trade]
            </span>
            <span
              className="text-xs px-2 py-0.5 rounded"
              style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--fg-faint)' }}
            >
              Full-time
            </span>
          </div>
          <p className="font-semibold text-base mb-0.5" style={{ color: 'var(--fg)' }}>
            [Your job title]
          </p>
          <p className="text-sm" style={{ color: 'var(--fg-muted)' }}>
            [Your company]
            <span style={{ color: 'var(--fg-faint)' }}> · </span>
            [Location]
          </p>
          <p className="text-xs mt-2" style={{ color: 'var(--fg-faint)' }}>
            Posted just now
          </p>
        </div>
      </div>
    </aside>
  )
}

const PLANS = [
  { name: 'Single Post', price: '$149', period: 'one-time', note: null },
  { name: '5-Pack', price: '$499', period: 'one-time', note: '$99/listing — best value' },
  { name: 'Pro Monthly', price: '$799', period: '/ month', note: 'Unlimited listings' },
]

export default function PostJobPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--fg)', fontFamily: 'var(--font-display), system-ui, sans-serif' }}>
          Post a Job
        </h1>
        <p style={{ color: 'var(--fg-muted)' }}>
          Reach electricians, HVAC techs, and low voltage specialists actively looking for data center work.
        </p>
      </div>

      {/* Pricing preview + social proof */}
      <div className="mb-10 rounded-2xl p-6" style={{ background: 'var(--bg-raised)', border: '1px solid var(--border)' }}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row gap-3">
            {PLANS.map(plan => (
              <div
                key={plan.name}
                className="flex flex-col px-5 py-3 rounded-xl"
                style={{
                  background: 'var(--bg)',
                  border: '1px solid var(--border)',
                  minWidth: '130px',
                }}
              >
                <span className="text-xs font-semibold mb-1" style={{ color: 'var(--fg-faint)' }}>
                  {plan.name}
                </span>
                <span className="text-2xl font-extrabold leading-none" style={{ color: 'var(--fg)', fontFamily: 'var(--font-display), system-ui, sans-serif' }}>
                  {plan.price}
                </span>
                <span className="text-xs mt-0.5" style={{ color: 'var(--fg-faint)' }}>
                  {plan.note ?? plan.period}
                </span>
              </div>
            ))}
          </div>
          <div className="flex flex-col gap-2 text-sm sm:text-right">
            <div style={{ color: 'var(--fg-muted)' }}>
              <span style={{ color: 'var(--green)', fontWeight: 700 }}>✓</span> Live in under 5 minutes
            </div>
            <div style={{ color: 'var(--fg-muted)' }}>
              <span style={{ color: 'var(--green)', fontWeight: 700 }}>✓</span> 30-day active listing
            </div>
            <div style={{ color: 'var(--fg-muted)' }}>
              <span style={{ color: 'var(--green)', fontWeight: 700 }}>✓</span> Applications direct to you
            </div>
          </div>
        </div>
      </div>

      {/* Mobile: trust rail above form */}
      <div className="lg:hidden mb-6">
        <TrustRail />
      </div>

      {/* Desktop: 2-col layout */}
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Left: form (2/3) */}
        <div className="flex-1 lg:max-w-none w-full">
          <PostJobForm />
        </div>

        {/* Right: trust rail (1/3) — hidden on mobile, shown on desktop */}
        <div className="hidden lg:block w-80 flex-shrink-0 sticky top-8">
          <TrustRail />
        </div>
      </div>
    </div>
  )
}
