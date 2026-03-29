'use client'
import { useState } from 'react'

export function NewsletterCaptureWidget() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
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

  return (
    <section
      style={{
        background: 'var(--bg-subtle)',
        borderTop: '1px solid var(--border)',
        borderBottom: '1px solid var(--border)',
      }}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <div className="max-w-xl">
          <p className="text-xs font-semibold tracking-widest uppercase mb-2" style={{ color: 'var(--yellow)' }}>
            Stay in the loop
          </p>
          <p className="text-base font-semibold mb-1" style={{ color: 'var(--fg)' }}>
            Get updates on high-paying trades jobs
          </p>
          <p className="text-sm mb-4" style={{ color: 'var(--fg-muted)' }}>
            Data center electricians, HVAC techs, and low voltage roles — delivered to your inbox.
          </p>

          {done ? (
            <div
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium"
              style={{ background: 'var(--green-dim)', border: '1px solid rgba(74,222,128,0.2)', color: 'var(--green)' }}
            >
              ✓ You&apos;re on the list
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
              <input
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
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2.5 rounded-lg font-semibold text-sm transition-opacity disabled:opacity-60 whitespace-nowrap"
                style={{ background: 'var(--yellow)', color: '#0A0A0A' }}
              >
                {loading ? '...' : 'Notify Me'}
              </button>
            </form>
          )}

          {error && (
            <p className="text-xs mt-2" style={{ color: '#F87171' }}>
              {error}
            </p>
          )}
        </div>
      </div>
    </section>
  )
}
