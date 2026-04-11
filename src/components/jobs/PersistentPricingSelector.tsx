'use client'
import { useState } from 'react'

export const SELECTOR_PLANS = [
  {
    id: 'single_post',
    name: 'Single Listing',
    price: '$149',
    period: 'one-time',
    note: null,
    benefits: ['1 job listing', '30 days active', 'Applications direct to you'],
  },
  {
    id: 'five_pack',
    name: '5-Pack',
    price: '$499',
    period: 'one-time',
    note: '$99 / listing',
    benefits: ['5 job listings', 'Use any time', 'Best value per listing'],
  },
  {
    id: 'pro_monthly',
    name: 'Pro Monthly',
    price: '$799',
    period: '/ month',
    note: null,
    benefits: ['Unlimited listings', 'Featured badge on every listing', 'Priority support'],
  },
]

interface Props {
  selectedPlan: string
  setSelectedPlan: (plan: string) => void
  creditsAvailable?: number
}

export function PersistentPricingSelector({
  selectedPlan,
  setSelectedPlan,
  creditsAvailable = 0,
}: Props) {
  const [expanded, setExpanded] = useState(false)
  const current = SELECTOR_PLANS.find((p) => p.id === selectedPlan) ?? SELECTOR_PLANS[0]

  return (
    <div
      className="fixed inset-x-0 top-14 z-40"
      style={{ background: 'var(--bg-raised)', borderBottom: '1px solid var(--border)' }}
    >
      {/* Compact bar */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
        {creditsAvailable > 0 ? (
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-sm font-semibold" style={{ color: 'var(--green)' }}>
              {creditsAvailable} credit{creditsAvailable !== 1 ? 's' : ''} available
            </span>
            <button
              type="button"
              className="text-xs px-3 py-1.5 rounded-lg font-semibold"
              style={{ background: 'var(--green)', color: '#0A0A0A' }}
            >
              Use Credit
            </button>
            <button
              type="button"
              onClick={() => setExpanded((e) => !e)}
              className="text-xs"
              style={{ color: 'var(--fg-faint)', textDecoration: 'underline' }}
            >
              or buy a plan
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-sm min-w-0">
            <span style={{ color: 'var(--fg-faint)', flexShrink: 0 }}>Plan:</span>
            <span className="font-semibold truncate" style={{ color: 'var(--fg)' }}>
              {current.name}
            </span>
            <span style={{ color: 'var(--fg-faint)', flexShrink: 0 }}>·</span>
            <span className="font-bold flex-shrink-0" style={{ color: 'var(--yellow)' }}>
              {current.price}
            </span>
            <span className="text-xs flex-shrink-0" style={{ color: 'var(--fg-faint)' }}>
              {current.note ?? current.period}
            </span>
          </div>
        )}

        <button
          type="button"
          onClick={() => setExpanded((e) => !e)}
          className="text-sm font-semibold flex items-center gap-1.5 px-3 py-1.5 rounded-lg flex-shrink-0 transition-colors hover:opacity-80"
          style={{
            background: expanded ? 'var(--bg)' : 'transparent',
            border: '1px solid var(--border)',
            color: 'var(--fg)',
          }}
        >
          {expanded ? 'Close' : 'Change plan'}
          <span style={{ fontSize: '9px', lineHeight: 1 }}>{expanded ? '▲' : '▼'}</span>
        </button>
      </div>

      {/* Expanded plan cards */}
      {expanded && (
        <div
          className="max-w-5xl mx-auto px-4 sm:px-6 pb-5"
          style={{ borderTop: '1px solid var(--border)' }}
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4">
            {SELECTOR_PLANS.map((plan) => {
              const isSelected = plan.id === selectedPlan
              return (
                <button
                  key={plan.id}
                  type="button"
                  onClick={() => {
                    setSelectedPlan(plan.id)
                    setExpanded(false)
                  }}
                  className="rounded-xl p-4 text-left w-full transition-colors hover:opacity-80"
                  style={{
                    border: `1px solid ${isSelected ? 'var(--yellow)' : 'var(--border)'}`,
                    background: isSelected ? 'var(--yellow-dim)' : 'var(--bg)',
                  }}
                >
                  <div
                    className="font-bold text-base mb-1"
                    style={{
                      color: 'var(--fg)',
                      fontFamily: 'var(--font-display), system-ui, sans-serif',
                    }}
                  >
                    {plan.name}
                  </div>
                  <div className="flex items-baseline gap-1.5 mb-3">
                    <span
                      className="text-2xl font-extrabold"
                      style={{ color: isSelected ? 'var(--yellow)' : 'var(--fg)' }}
                    >
                      {plan.price}
                    </span>
                    <span className="text-xs" style={{ color: 'var(--fg-faint)' }}>
                      {plan.note ?? plan.period}
                    </span>
                  </div>
                  <ul className="space-y-1.5 mb-4">
                    {plan.benefits.map((b) => (
                      <li
                        key={b}
                        className="text-xs flex items-start gap-1.5"
                        style={{ color: 'var(--fg-muted)' }}
                      >
                        <span style={{ color: 'var(--green)', fontWeight: 700, flexShrink: 0 }}>
                          ✓
                        </span>
                        {b}
                      </li>
                    ))}
                  </ul>
                  <div
                    className="text-xs font-semibold text-center py-1.5 rounded-lg"
                    style={{
                      background: isSelected ? 'var(--yellow)' : 'var(--bg-raised)',
                      color: isSelected ? '#0A0A0A' : 'var(--fg-muted)',
                      border: isSelected ? 'none' : '1px solid var(--border)',
                    }}
                  >
                    {isSelected ? '✓ Selected' : `Select ${plan.name}`}
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
