'use client'
import { useState } from 'react'

type Step = 'closed' | 'open' | 'done'

export function FeedbackWidget() {
  const [step, setStep] = useState<Step>('closed')
  const [userType, setUserType] = useState<'job_seeker' | 'employer' | ''>('')
  const [rating, setRating] = useState<number>(0)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit() {
    if (!rating) return
    setLoading(true)
    try {
      await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_type: userType || undefined,
          rating,
          message: message.trim() || undefined,
          page_url: window.location.pathname,
        }),
      })
    } catch {
      // non-fatal
    } finally {
      setLoading(false)
      setStep('done')
    }
  }

  if (step === 'closed') {
    return (
      <button
        onClick={() => setStep('open')}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all hover:-translate-y-0.5"
        style={{
          background: 'var(--bg-raised)',
          border: '1px solid var(--border)',
          color: 'var(--fg-muted)',
          boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
        }}
        aria-label="Give feedback"
      >
        <span>💬</span>
        <span>Feedback</span>
      </button>
    )
  }

  if (step === 'done') {
    return (
      <div
        className="fixed bottom-6 right-6 z-50 rounded-xl px-5 py-4 text-sm font-semibold"
        style={{
          background: 'var(--bg-raised)',
          border: '1px solid var(--border)',
          color: 'var(--fg)',
          boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
        }}
      >
        Thanks for the feedback
      </div>
    )
  }

  return (
    <div
      className="fixed bottom-6 right-6 z-50 w-72 rounded-xl p-5"
      style={{
        background: 'var(--bg-raised)',
        border: '1px solid var(--border)',
        boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--fg-faint)' }}>
          Quick feedback
        </p>
        <button
          onClick={() => setStep('closed')}
          className="text-xs"
          style={{ color: 'var(--fg-faint)' }}
          aria-label="Close feedback"
        >
          ✕
        </button>
      </div>

      {/* User type */}
      <div className="flex gap-2 mb-4">
        {(['job_seeker', 'employer'] as const).map(t => (
          <button
            key={t}
            onClick={() => setUserType(t)}
            className="flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors hover:opacity-80"
            style={{
              background: userType === t ? 'var(--yellow)' : 'var(--bg)',
              color: userType === t ? '#0A0A0A' : 'var(--fg-muted)',
              border: `1px solid ${userType === t ? 'var(--yellow)' : 'var(--border)'}`,
            }}
          >
            {t === 'job_seeker' ? 'Job seeker' : 'Employer'}
          </button>
        ))}
      </div>

      {/* Star rating */}
      <div className="flex gap-1 mb-4">
        {[1, 2, 3, 4, 5].map(n => (
          <button
            key={n}
            onClick={() => setRating(n)}
            className="text-xl transition-transform hover:scale-110"
            style={{ color: n <= rating ? 'var(--yellow)' : 'var(--border)' }}
            aria-label={`Rate ${n} out of 5`}
          >
            ★
          </button>
        ))}
      </div>

      {/* Message */}
      <textarea
        value={message}
        onChange={e => setMessage(e.target.value)}
        placeholder="Anything we should improve?"
        rows={3}
        className="w-full px-3 py-2 rounded-lg text-xs resize-none focus:outline-none mb-4"
        style={{
          background: 'var(--bg)',
          border: '1px solid var(--border-strong)',
          color: 'var(--fg)',
        }}
      />

      <button
        onClick={submit}
        disabled={loading || !rating}
        title={!rating ? 'Select a star rating to send' : undefined}
        aria-describedby={!rating ? 'feedback-hint' : undefined}
        className="w-full py-2 rounded-lg text-xs font-semibold transition-opacity hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
        style={{ background: 'var(--yellow)', color: '#0A0A0A' }}
      >
        {loading ? 'Sending...' : 'Send feedback'}
      </button>
      {!rating && (
        <p id="feedback-hint" className="text-xs mt-2 text-center" style={{ color: 'var(--fg-faint)' }}>
          Select a star rating to send
        </p>
      )}
    </div>
  )
}
