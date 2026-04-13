'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

const TRADES = [
  { value: 'electrical', label: 'Electrical' },
  { value: 'hvac', label: 'HVAC' },
  { value: 'low_voltage', label: 'Low Voltage' },
  { value: 'construction', label: 'Construction' },
  { value: 'operations', label: 'Operations' },
  { value: 'all', label: 'All trades' },
]

export function AuthForm({ mode }: { mode: 'login' | 'signup' }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [wantAlerts, setWantAlerts] = useState(false)
  const [trade, setTrade] = useState('all')

  const isLogin = mode === 'login'

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    const supabase = createClient()

    if (mode === 'signup') {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName },
          emailRedirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
        },
      })
      if (signUpError) {
        setError(signUpError.message)
      } else if (data.user?.identities?.length === 0) {
        setError('An account with this email already exists. Try signing in instead.')
      } else {
        setSuccess('Check your email for a confirmation link!')
        // If they opted into job alerts, create the alert in the background
        if (wantAlerts) {
          fetch('/api/alerts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email,
              category: trade === 'all' ? null : trade,
              frequency: 'daily',
              trade_pref: trade,
              location_pref: 'all',
              source: 'auth-signup',
            }),
          }).catch(() => {})
        }
      }
    } else {
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
      if (signInError) setError(signInError.message)
      else window.location.href = '/dashboard'
    }

    setLoading(false)
  }

  return (
    <div className="rounded-2xl p-8" style={{ background: 'var(--bg-raised)', border: '1px solid var(--border)' }}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: 'var(--fg-muted)' }}>Email</label>
          <input
            type="email"
            value={email}
            onChange={e => { setEmail(e.target.value); setError('') }}
            required
            placeholder="you@example.com"
            className="w-full rounded-lg px-3 py-2.5 placeholder-gray-500 focus:outline-none text-sm autofill-bg-dark"
            style={{ color: 'var(--fg)', background: 'var(--bg)', border: '1px solid var(--border-strong)' }}
          />
        </div>

        {mode === 'signup' && (
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--fg-muted)' }}>Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              placeholder="John Smith"
              className="w-full rounded-lg px-3 py-2.5 placeholder-gray-500 focus:outline-none text-sm autofill-bg-dark"
              style={{ color: 'var(--fg)', background: 'var(--bg)', border: '1px solid var(--border-strong)' }}
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: 'var(--fg-muted)' }}>Password</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            minLength={8}
            placeholder="8+ characters"
            className="w-full rounded-lg px-3 py-2.5 placeholder-gray-500 focus:outline-none text-sm autofill-bg-dark"
            style={{ color: 'var(--fg)', background: 'var(--bg)', border: '1px solid var(--border-strong)' }}
          />
        </div>

        {/* Optional alert signup — signup mode only */}
        {mode === 'signup' && (
          <div
            className="rounded-lg p-4"
            style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}
          >
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={wantAlerts}
                onChange={e => setWantAlerts(e.target.checked)}
                className="w-4 h-4 rounded accent-yellow-400"
              />
              <span className="text-sm font-medium" style={{ color: 'var(--fg)' }}>
                Also send me daily job alerts
              </span>
            </label>
            {wantAlerts && (
              <div className="mt-3">
                <label className="block text-xs font-medium mb-1" style={{ color: 'var(--fg-faint)' }}>Trade</label>
                <select
                  value={trade}
                  onChange={e => setTrade(e.target.value)}
                  className="w-full rounded-lg px-3 py-2 text-sm focus:outline-none"
                  style={{ color: 'var(--fg)', background: 'var(--bg-raised)', border: '1px solid var(--border-strong)' }}
                >
                  {TRADES.map(t => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        )}

        {error && (
          <div className="rounded-lg px-4 py-3 text-sm" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#F87171' }}>
            {error}
          </div>
        )}
        {success && (
          <div className="rounded-lg px-4 py-3 text-sm" style={{ background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.3)', color: '#4ADE80' }}>
            {success}
          </div>
        )}

        {!success && (
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl font-semibold transition-all hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed"
            style={{ background: 'var(--yellow)', color: '#0A0A0A' }}
          >
            {loading ? '...' : isLogin ? 'Sign In' : 'Create Account'}
          </button>
        )}
      </form>

      <p className="text-center text-sm mt-6" style={{ color: 'var(--fg-faint)' }}>
        {mode === 'signup' ? (
          <>Already have an account?{' '}
            <Link href="/auth/login" className="hover:opacity-80" style={{ color: 'var(--yellow)' }}>Sign in</Link>
          </>
        ) : (
          <>No account?{' '}
            <Link href="/auth/signup" className="hover:opacity-80" style={{ color: 'var(--yellow)' }}>Create one</Link>
          </>
        )}
      </p>
    </div>
  )
}
