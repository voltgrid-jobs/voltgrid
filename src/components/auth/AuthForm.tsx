'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export function AuthForm({ mode }: { mode: 'login' | 'signup' }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  // When duplicate email detected on signup, offer inline magic link send
  const [duplicateEmail, setDuplicateEmail] = useState(false)

  const isLogin = mode === 'login'

  async function handleMagicLink() {
    if (!email) { setError('Enter your email first'); return }
    setLoading(true)
    setError('')
    setDuplicateEmail(false)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback?next=/dashboard` },
    })
    if (error) setError(error.message)
    else setSuccess('Magic link sent! Check your email to sign in.')
    setLoading(false)
  }

  async function handlePassword(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')
    setDuplicateEmail(false)

    const supabase = createClient()

    if (mode === 'signup') {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName },
          emailRedirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
        },
      })
      if (error) {
        setError(error.message)
      } else if (data.user?.identities?.length === 0) {
        // Email already registered — Supabase returns empty identities array
        setDuplicateEmail(true)
      } else {
        setSuccess('Check your email for a confirmation link!')
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setError(error.message)
      else window.location.href = '/dashboard'
    }

    setLoading(false)
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">

      {/* ── Magic link — primary CTA ─────────────────────────────────────── */}
      <div className="space-y-3 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={e => { setEmail(e.target.value); setDuplicateEmail(false); setError('') }}
            required
            placeholder="you@example.com"
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 placeholder-gray-500 focus:outline-none focus:border-yellow-400 text-sm"
            style={{ color: '#F0F0ED', backgroundColor: '#1F2937' }}
          />
        </div>

        {/* Duplicate email error — shown instead of generic error */}
        {duplicateEmail && (
          <div className="bg-yellow-900/30 border border-yellow-700 rounded-lg px-4 py-3 text-sm">
            <p className="text-yellow-300 font-medium mb-2">
              An account with this email already exists.
            </p>
            <p className="text-gray-400 mb-3">
              Sign in with a magic link instead — no password needed.
            </p>
            <button
              type="button"
              onClick={handleMagicLink}
              disabled={loading}
              className="w-full bg-yellow-400 text-gray-950 py-2 rounded-lg font-semibold text-sm hover:bg-yellow-300 transition-colors hover:opacity-80 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? '...' : 'Send magic link →'}
            </button>
          </div>
        )}

        {error && !duplicateEmail && (
          <div className="bg-red-900/30 border border-red-800 rounded-lg px-4 py-3 text-red-400 text-sm">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-900/30 border border-green-800 rounded-lg px-4 py-3 text-green-400 text-sm">
            {success}
          </div>
        )}

        {!duplicateEmail && !success && (
          <button
            type="button"
            onClick={handleMagicLink}
            disabled={loading}
            className="w-full bg-yellow-400 text-gray-950 py-3 rounded-xl font-semibold hover:bg-yellow-300 hover:-translate-y-px hover:shadow-[0_4px_16px_rgba(250,204,21,0.25)] transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0 disabled:shadow-none"
          >
            {loading ? '...' : isLogin ? 'Send magic link' : 'Get sign-in link'}
          </button>
        )}

        {!duplicateEmail && !success && (
          <p className="text-center text-xs text-gray-500">
            We&apos;ll email you a one-click link — no password needed.
          </p>
        )}
      </div>

      {/* ── Password — secondary option, collapsed ───────────────────────── */}
      {!duplicateEmail && !success && (
        <>
          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-800" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-gray-900 px-2 text-gray-600">or</span>
            </div>
          </div>

          {!showPassword ? (
            <button
              type="button"
              onClick={() => setShowPassword(true)}
              className="w-full text-sm text-gray-500 hover:text-gray-300 transition-colors hover:opacity-80 py-1"
            >
              {isLogin ? 'Sign in with password instead' : 'Sign up with password instead'}
            </button>
          ) : (
            <form onSubmit={handlePassword} className="space-y-3">
              {mode === 'signup' && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    placeholder="John Smith"
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 placeholder-gray-500 focus:outline-none focus:border-yellow-400 text-sm"
                    style={{ color: '#F0F0ED', backgroundColor: '#1F2937' }}
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  minLength={8}
                  placeholder="8+ characters"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 placeholder-gray-500 focus:outline-none focus:border-yellow-400 text-sm"
                  style={{ color: '#F0F0ED', backgroundColor: '#1F2937' }}
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full border border-gray-700 text-gray-300 py-2.5 rounded-xl font-medium hover:border-gray-500 hover:text-white transition-colors hover:opacity-80 text-sm disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? '...' : isLogin ? 'Sign in with password' : 'Create account with password'}
              </button>
            </form>
          )}
        </>
      )}

      <p className="text-center text-gray-500 text-sm mt-6">
        {mode === 'signup' ? (
          <>Already have an account?{' '}
            <Link href="/auth/login" className="text-yellow-400 hover:text-yellow-300">Sign in</Link>
          </>
        ) : (
          <>No account?{' '}
            <Link href="/auth/signup" className="text-yellow-400 hover:text-yellow-300">Create one</Link>
          </>
        )}
      </p>
    </div>
  )
}
