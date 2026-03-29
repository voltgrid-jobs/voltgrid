'use client'
import { useState } from 'react'

export function AlertSignupWidget({ keywords, category }: { keywords?: string; category?: string }) {
  const [email, setEmail] = useState('')
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
        body: JSON.stringify({ email, keywords, category, frequency: 'daily' }),
      })
      if (res.ok) setDone(true)
      else setError('Something went wrong. Try again.')
    } finally {
      setLoading(false)
    }
  }

  if (done) {
    return (
      <div className="rounded-xl p-5 text-center" style={{ background: 'var(--green-dim)', border: '1px solid rgba(74,222,128,0.2)' }}>
        <p className="font-semibold text-sm" style={{ color: 'var(--green)' }}>✓ Alert set up</p>
        <p className="text-xs mt-1" style={{ color: 'var(--fg-muted)' }}>You&apos;ll get daily alerts + a weekly digest of top opportunities.</p>
      </div>
    )
  }

  return (
    <div className="rounded-xl p-5" style={{ background: 'var(--bg-raised)', border: '1px solid var(--border)' }}>
      <h3 className="font-semibold text-sm mb-1" style={{ color: 'var(--fg)' }}>Get job alerts</h3>
      <p className="text-xs mb-4" style={{ color: 'var(--fg-muted)' }}>
        Get notified when new {keywords || category || 'trades'} jobs are posted. Plus a weekly digest of top opportunities.
      </p>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <label htmlFor="alert-signup-email" className="sr-only">Email address</label>
        <input
          id="alert-signup-email"
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          placeholder="your@email.com"
          className="flex-1 px-3 py-2 rounded-lg text-sm focus:outline-none"
          style={{ background: 'var(--bg)', border: '1px solid var(--border-strong)', color: 'var(--fg)' }}
        />
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 rounded-lg font-semibold text-sm transition-opacity disabled:opacity-60 whitespace-nowrap"
          style={{ background: 'var(--yellow)', color: '#0A0A0A' }}
        >
          {loading ? '...' : 'Notify me'}
        </button>
      </form>
      {error && <p className="text-xs mt-2" style={{ color: '#F87171' }}>{error}</p>}
    </div>
  )
}
