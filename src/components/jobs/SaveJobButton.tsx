'use client'
import { useState, useRef, useEffect } from 'react'

export function SaveJobButton({
  jobId,
  initialSaved = false,
  isLoggedIn = false,
  jobCategory,
}: {
  jobId: string
  initialSaved?: boolean
  isLoggedIn?: boolean
  jobCategory?: string
}) {
  const [saved, setSaved] = useState(initialSaved)
  const [loading, setLoading] = useState(false)
  const [showEmailPrompt, setShowEmailPrompt] = useState(false)
  const [email, setEmail] = useState('')
  const [emailError, setEmailError] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (showEmailPrompt && inputRef.current) {
      inputRef.current.focus()
    }
  }, [showEmailPrompt])

  async function toggle() {
    if (!isLoggedIn) {
      setShowEmailPrompt(true)
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/jobs/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ job_id: jobId }),
      })
      if (res.status === 401) {
        setShowEmailPrompt(true)
        return
      }
      const data = await res.json()
      setSaved(data.saved)
    } finally {
      setLoading(false)
    }
  }

  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault()
    setEmailError('')
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError('Please enter a valid email.')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          category: jobCategory || null,
          frequency: 'daily',
        }),
      })
      if (res.ok) {
        setSaved(true)
        setSubmitted(true)
        setShowEmailPrompt(false)
      } else {
        const data = await res.json()
        setEmailError(data.error || 'Something went wrong.')
      }
    } catch {
      setEmailError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative">
      {!submitted ? (
        <button
          onClick={toggle}
          disabled={loading}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-colors ${
            saved
              ? 'border-yellow-400 text-yellow-400 bg-yellow-400/10'
              : 'border-gray-700 text-gray-400 hover:border-gray-500 hover:text-white'
          }`}
        >
          <span>{saved ? '★' : '☆'}</span>
          {saved ? 'Saved' : 'Save Job'}
        </button>
      ) : (
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium border-yellow-400 text-yellow-400 bg-yellow-400/10">
          <span>★</span> Saved
        </div>
      )}

      {showEmailPrompt && (
        <div
          className="absolute right-0 top-full mt-2 z-50 rounded-2xl p-4 w-72 shadow-2xl"
          style={{ background: 'var(--bg-raised)', border: '1px solid var(--border)' }}
        >
          <p className="text-sm font-medium mb-1" style={{ color: 'var(--fg)' }}>
            Save this job
          </p>
          <p className="text-xs mb-3" style={{ color: 'var(--fg-muted)', lineHeight: 1.5 }}>
            Enter your email to save this job and get alerts for similar roles.
          </p>
          <form onSubmit={handleEmailSubmit} className="flex flex-col gap-2">
            <input
              ref={inputRef}
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 rounded-lg text-sm outline-none"
              style={{
                background: 'var(--bg)',
                border: '1px solid var(--border)',
                color: 'var(--fg)',
              }}
            />
            {emailError && (
              <p className="text-xs" style={{ color: 'var(--red, #ef4444)' }}>{emailError}</p>
            )}
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-2 rounded-lg text-sm font-semibold transition-opacity disabled:opacity-50"
                style={{ background: 'var(--yellow)', color: '#0A0A0A' }}
              >
                {loading ? 'Saving…' : 'Save & Get Alerts'}
              </button>
              <button
                type="button"
                onClick={() => setShowEmailPrompt(false)}
                className="px-3 py-2 rounded-lg text-sm transition-colors"
                style={{ border: '1px solid var(--border)', color: 'var(--fg-muted)' }}
              >
                ✕
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
