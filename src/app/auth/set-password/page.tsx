'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function SetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

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

    const supabase = createClient()
    const { error: updateError } = await supabase.auth.updateUser({ password })

    if (updateError) {
      setError(updateError.message)
      setLoading(false)
    } else {
      window.location.href = '/dashboard'
    }
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div
            className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4 text-2xl"
            style={{ background: 'var(--yellow-dim)', border: '1px solid var(--yellow-border)' }}
          >
            🔒
          </div>
          <h1
            className="text-2xl font-bold mb-2"
            style={{ color: 'var(--fg)', fontFamily: 'var(--font-display), system-ui, sans-serif' }}
          >
            Set your password
          </h1>
          <p className="text-sm" style={{ color: 'var(--fg-muted)' }}>
            Your account was created when you signed up for job alerts. Set a password to access your dashboard.
          </p>
        </div>

        <div
          className="rounded-2xl p-8"
          style={{ background: 'var(--bg-raised)', border: '1px solid var(--border)' }}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--fg-muted)' }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={e => { setPassword(e.target.value); setError('') }}
                required
                minLength={8}
                placeholder="8+ characters"
                className="w-full rounded-lg px-3 py-2.5 placeholder-gray-500 focus:outline-none text-sm"
                style={{ color: 'var(--fg)', background: 'var(--bg)', border: '1px solid var(--border-strong)' }}
                autoFocus
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--fg-muted)' }}>
                Confirm password
              </label>
              <input
                type="password"
                value={confirm}
                onChange={e => { setConfirm(e.target.value); setError('') }}
                required
                minLength={8}
                placeholder="Repeat password"
                className="w-full rounded-lg px-3 py-2.5 placeholder-gray-500 focus:outline-none text-sm"
                style={{ color: 'var(--fg)', background: 'var(--bg)', border: '1px solid var(--border-strong)' }}
              />
            </div>

            {error && (
              <div
                className="rounded-lg px-4 py-3 text-sm"
                style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#F87171' }}
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-semibold transition-all hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed"
              style={{ background: 'var(--yellow)', color: '#0A0A0A' }}
            >
              {loading ? 'Setting password...' : 'Set Password & Continue'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
