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
      <div className="bg-green-900/20 border border-green-800 rounded-xl p-5 text-center">
        <p className="text-green-400 font-medium">✓ Alert set up!</p>
        <p className="text-gray-500 text-sm mt-1">We&apos;ll email you daily when new matching jobs are posted.</p>
      </div>
    )
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
      <h3 className="font-semibold text-white mb-1">Get job alerts</h3>
      <p className="text-gray-500 text-sm mb-4">
        We&apos;ll email you when new {keywords || category || 'trades'} jobs are posted.
      </p>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          placeholder="your@email.com"
          className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-400 text-sm"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-yellow-400 text-gray-950 px-4 py-2 rounded-lg font-semibold text-sm hover:bg-yellow-300 transition-colors disabled:opacity-60 whitespace-nowrap"
        >
          {loading ? '...' : 'Notify me'}
        </button>
      </form>
      {error && <p className="text-red-400 text-xs mt-2">{error}</p>}
    </div>
  )
}
