'use client'
import { useState } from 'react'

const TRADE_OPTIONS = [
  { value: '', label: 'All trades' },
  { value: 'electrical', label: 'Electrical' },
  { value: 'hvac', label: 'HVAC' },
  { value: 'low_voltage', label: 'Low Voltage' },
  { value: 'construction', label: 'Construction' },
]

export function JobAlertInlineForm({
  variant = 'homepage',
  defaultTrade = '',
  subscriberCount,
}: {
  variant?: 'homepage' | 'jobs'
  defaultTrade?: string
  subscriberCount?: number
}) {
  const [email, setEmail] = useState('')
  const [trade, setTrade] = useState(defaultTrade)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, category: trade || null, location: '', frequency: 'daily' }),
      })
      if (res.ok) {
        setDone(true)
      } else {
        const data = await res.json()
        setError(data.error || 'Something went wrong. Try again.')
      }
    } catch {
      setError('Something went wrong. Try again.')
    } finally {
      setLoading(false)
    }
  }

  if (done) {
    return (
      <div
        className="rounded-xl p-4 text-center"
        style={{ background: 'var(--green-dim)', border: '1px solid rgba(74,222,128,0.2)' }}
      >
        <p className="font-semibold text-sm" style={{ color: 'var(--green)' }}>
          ✓ You&apos;re on the list
        </p>
        <p className="text-xs mt-1" style={{ color: 'var(--fg-muted)' }}>
          We&apos;ll notify you when matching jobs are posted.
        </p>
      </div>
    )
  }

  if (variant === 'jobs') {
    return (
      <div
        className="rounded-xl p-5 mt-6"
        style={{ background: 'var(--bg-raised)', border: '1px solid var(--border)' }}
      >
        <p className="font-semibold text-sm mb-1" style={{ color: 'var(--fg)' }}>
          Don&apos;t see the right role?
        </p>
        <p className="text-xs mb-3" style={{ color: 'var(--fg-muted)' }}>
          Get notified when new jobs match your search.
        </p>
        <form onSubmit={handleSubmit} className="flex gap-2 flex-wrap sm:flex-nowrap">
          <label htmlFor="job-alert-sidebar-email" className="sr-only">Email address</label>
          <input
            id="job-alert-sidebar-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="your@email.com"
            className="flex-1 min-w-0 px-3 py-2 rounded-lg text-sm focus:outline-none"
            style={{
              background: 'var(--bg)',
              border: '1px solid var(--border-strong)',
              color: 'var(--fg)',
            }}
          />
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 rounded-lg font-semibold text-sm transition-opacity disabled:opacity-60 whitespace-nowrap"
            style={{ background: 'var(--yellow)', color: '#0A0A0A' }}
          >
            {loading ? '...' : 'Get Alerts'}
          </button>
        </form>
        {error && (
          <p className="text-xs mt-2" style={{ color: '#F87171' }}>
            {error}
          </p>
        )}
        {subscriberCount != null && subscriberCount > 0 && (
          <p className="text-xs mt-2" style={{ color: 'var(--fg-faint)' }}>
            ✓ Join {subscriberCount >= 1000 ? `${Math.floor(subscriberCount / 100) * 100}+` : `${subscriberCount}+`} trades workers already subscribed
          </p>
        )}
      </div>
    )
  }

  // Homepage variant — includes trade dropdown, renders its own section wrapper
  const tradeLabel = TRADE_OPTIONS.find((o) => o.value === trade)?.label ?? 'trades'

  return (
    <section
      style={{
        background: 'var(--bg-subtle)',
        borderTop: '1px solid var(--border)',
        borderBottom: '1px solid var(--border)',
      }}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <p className="text-sm font-medium mb-1" style={{ color: 'var(--fg)' }}>
          Get notified when $45–$85/hr data center jobs post
        </p>
        <p className="text-xs mb-4" style={{ color: 'var(--fg-muted)' }}>
          New {tradeLabel !== 'All trades' ? tradeLabel.toLowerCase() : 'trades'} roles posted daily — be first to apply.
        </p>
        <form
          onSubmit={handleSubmit}
          className="flex flex-col sm:flex-row gap-2 max-w-2xl"
        >
          <label htmlFor="job-alert-email" className="sr-only">Email address</label>
          <input
            id="job-alert-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="your@email.com"
            className="flex-1 px-3 py-2.5 rounded-lg text-sm focus:outline-none"
            style={{
              background: 'var(--bg)',
              border: '1px solid var(--border-strong)',
              color: 'var(--fg)',
            }}
          />
          <label htmlFor="job-alert-trade" className="sr-only">Trade</label>
          <select
            id="job-alert-trade"
            value={trade}
            onChange={(e) => setTrade(e.target.value)}
            className="px-3 py-2.5 rounded-lg text-sm focus:outline-none"
            style={{
              background: 'var(--bg)',
              border: '1px solid var(--border-strong)',
              color: 'var(--fg)',
            }}
          >
            {TRADE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2.5 rounded-lg font-semibold text-sm transition-opacity disabled:opacity-60 whitespace-nowrap"
            style={{ background: 'var(--yellow)', color: '#0A0A0A' }}
          >
            {loading ? '...' : 'Get Alerts'}
          </button>
        </form>
        {error && (
          <p className="text-xs mt-2" style={{ color: '#F87171' }}>
            {error}
          </p>
        )}
        {subscriberCount != null && subscriberCount > 0 && (
          <p className="text-xs mt-3" style={{ color: 'var(--fg-faint)' }}>
            ✓ Join {subscriberCount >= 1000 ? `${Math.floor(subscriberCount / 100) * 100}+` : `${subscriberCount}+`} electricians, HVAC techs, and trades workers already subscribed
          </p>
        )}
      </div>
    </section>
  )
}
