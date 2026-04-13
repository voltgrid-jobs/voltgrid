'use client'

import { useState } from 'react'

export function SetPasswordWithToken({ alertToken }: { alertToken: string }) {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/alerts/set-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: alertToken, password }),
      })
      const data = await res.json().catch(() => ({}))
      if (res.ok && data.success) {
        setDone(true)
      } else {
        setError(data.error || 'Failed to set password.')
      }
    } catch {
      setError('Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  if (done) {
    return (
      <div>
        <p className="text-sm font-semibold mb-3" style={{ color: '#4ADE80' }}>
          Password set. You can now sign in.
        </p>
        <a
          href="/auth/login"
          className="inline-block px-5 py-2.5 rounded-lg text-sm font-semibold transition-opacity hover:opacity-90"
          style={{ background: 'var(--yellow)', color: '#0A0A0A' }}
        >
          Sign In & Go to Dashboard →
        </a>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <input
        type="password"
        value={password}
        onChange={e => { setPassword(e.target.value); setError('') }}
        required
        minLength={8}
        placeholder="Password (8+ characters)"
        className="w-full rounded-lg px-3 py-2 text-sm focus:outline-none"
        style={{ background: 'var(--bg)', border: '1px solid var(--border-strong)', color: 'var(--fg)' }}
        autoFocus
      />
      <input
        type="password"
        value={confirm}
        onChange={e => { setConfirm(e.target.value); setError('') }}
        required
        minLength={8}
        placeholder="Confirm password"
        className="w-full rounded-lg px-3 py-2 text-sm focus:outline-none"
        style={{ background: 'var(--bg)', border: '1px solid var(--border-strong)', color: 'var(--fg)' }}
      />
      {error && <p className="text-xs" style={{ color: '#F87171' }}>{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="w-full py-2.5 rounded-lg text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-60"
        style={{ background: 'var(--yellow)', color: '#0A0A0A' }}
      >
        {loading ? 'Setting...' : 'Set Password'}
      </button>
    </form>
  )
}
