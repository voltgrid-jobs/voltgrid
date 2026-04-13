'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export function PasswordSection() {
  const [newPassword, setNewPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    if (newPassword !== confirm) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)
    setError('')
    setSuccess('')

    const supabase = createClient()
    const { error: updateError } = await supabase.auth.updateUser({ password: newPassword })

    if (updateError) {
      setError(updateError.message)
    } else {
      setSuccess('Password updated.')
      setNewPassword('')
      setConfirm('')
    }
    setLoading(false)
  }

  return (
    <div
      className="rounded-xl p-5"
      style={{ background: 'var(--bg-raised)', border: '1px solid var(--border)' }}
    >
      <h3 className="text-xs font-semibold tracking-wide uppercase mb-4" style={{ color: 'var(--fg-faint)', letterSpacing: '0.08em' }}>
        Change Password
      </h3>
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
        <input
          type="password"
          value={newPassword}
          onChange={e => { setNewPassword(e.target.value); setError(''); setSuccess('') }}
          required
          minLength={8}
          placeholder="New password"
          className="flex-1 rounded-lg px-3 py-2 text-sm focus:outline-none"
          style={{ background: 'var(--bg)', border: '1px solid var(--border-strong)', color: 'var(--fg)' }}
        />
        <input
          type="password"
          value={confirm}
          onChange={e => { setConfirm(e.target.value); setError(''); setSuccess('') }}
          required
          minLength={8}
          placeholder="Confirm"
          className="flex-1 rounded-lg px-3 py-2 text-sm focus:outline-none"
          style={{ background: 'var(--bg)', border: '1px solid var(--border-strong)', color: 'var(--fg)' }}
        />
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 rounded-lg text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-60 whitespace-nowrap"
          style={{ background: 'var(--bg)', border: '1px solid var(--border-strong)', color: 'var(--fg)' }}
        >
          {loading ? '...' : 'Update'}
        </button>
      </form>
      {error && <p className="text-xs mt-2" style={{ color: '#F87171' }}>{error}</p>}
      {success && <p className="text-xs mt-2" style={{ color: '#4ADE80' }}>{success}</p>}
    </div>
  )
}
