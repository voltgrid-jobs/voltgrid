'use client'
import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

const VIEWS_KEY = 'vg_job_views'
const DISMISSED_KEY = 'vg_alert_popup_dismissed'
const SIGNED_UP_KEY = 'jobAlertSignedUp'
const VIEW_THRESHOLD = 2

// Large trade buttons — simple 3-way split
const TRADE_OPTIONS = [
  {
    value: 'electrical',
    label: 'Electrician',
    icon: '⚡',
    desc: 'Commercial & industrial',
  },
  {
    value: 'hvac',
    label: 'HVAC',
    icon: '❄️',
    desc: 'Refrigeration & cooling',
  },
  {
    value: 'low_voltage',
    label: 'Low Voltage',
    icon: '📡',
    desc: 'Data & structured cabling',
  },
]

// ---- Helper: count + increment job views ----
function bumpViews(): number {
  if (typeof window === 'undefined') return 0
  const raw = localStorage.getItem(VIEWS_KEY)
  const count = raw ? parseInt(raw, 10) : 0
  const next = count + 1
  localStorage.setItem(VIEWS_KEY, String(next))
  return next
}

// ---- Trigger hook ----
function useJobViewTrigger(onTrigger: () => void) {
  useEffect(() => {
    const views = bumpViews()
    if (views >= VIEW_THRESHOLD) {
      // Small delay so it doesn't feel like a hard wall
      const t = setTimeout(onTrigger, 1200)
      return () => clearTimeout(t)
    }
  }, [onTrigger])
}

// ---- Progress dots ----
function ProgressDots({ step, total }: { step: number; total: number }) {
  return (
    <div className="flex justify-center gap-1.5 mb-5">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className="h-1.5 rounded-full transition-all duration-300"
          style={{
            width: i === step ? 24 : 8,
            background: i <= step ? 'var(--yellow)' : 'var(--border-strong)',
          }}
        />
      ))}
    </div>
  )
}

// ---- Step 1: Trade ----
function StepTrade({
  onNext,
  onSkip,
}: {
  onNext: (trade: string) => void
  onSkip: () => void
}) {
  return (
    <div>
      <h2
        className="text-xl sm:text-2xl font-bold text-center mb-1"
        style={{ color: 'var(--fg)', fontFamily: 'var(--font-display), system-ui, sans-serif', letterSpacing: '-0.01em' }}
      >
        What&apos;s your trade?
      </h2>
      <p className="text-sm text-center mb-6" style={{ color: 'var(--fg-muted)' }}>
        We&apos;ll match jobs for your specialty.
      </p>

      <div className="flex flex-col gap-3">
        {TRADE_OPTIONS.map(({ value, label, icon, desc }) => (
          <button
            key={value}
            type="button"
            onClick={() => onNext(value)}
            className="w-full flex items-center gap-4 p-4 rounded-xl text-left transition-all active:scale-95"
            style={{
              background: 'var(--bg)',
              border: '1px solid var(--border-strong)',
              color: 'var(--fg)',
              minHeight: 72,
              fontSize: 15,
              fontWeight: 600,
            }}
          >
            <span className="text-2xl flex-shrink-0">{icon}</span>
            <span className="flex-1">
              <span className="block font-semibold" style={{ color: 'var(--fg)' }}>{label}</span>
              <span className="block text-xs font-normal mt-0.5" style={{ color: 'var(--fg-muted)' }}>{desc}</span>
            </span>
            <span style={{ color: 'var(--fg-faint)', fontSize: 18 }}>→</span>
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={onSkip}
        className="w-full mt-4 text-sm transition-colors"
        style={{ color: 'var(--fg-faint)', minHeight: 44 }}
      >
        Skip — I&apos;ll browse all trades
      </button>
    </div>
  )
}

// ---- Step 2: Zip code ----
function StepZip({
  onNext,
  onBack,
}: {
  onNext: (zip: string) => void
  onBack: () => void
}) {
  const [zip, setZip] = useState('')
  const [error, setError] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const cleaned = zip.trim()
    if (!/^\d{5}$/.test(cleaned)) {
      setError('Enter a 5-digit US zip code.')
      return
    }
    setError('')
    onNext(cleaned)
  }

  return (
    <div>
      <h2
        className="text-xl sm:text-2xl font-bold text-center mb-1"
        style={{ color: 'var(--fg)', fontFamily: 'var(--font-display), system-ui, sans-serif', letterSpacing: '-0.01em' }}
      >
        What&apos;s your zip code?
      </h2>
      <p className="text-sm text-center mb-5" style={{ color: 'var(--fg-muted)' }}>
        We&apos;ll send jobs near you first.
      </p>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={5}
          placeholder="e.g. 75001"
          value={zip}
          onChange={e => {
            setZip(e.target.value.replace(/\D/g, '').slice(0, 5))
            if (error) setError('')
          }}
          className="w-full px-4 py-4 rounded-xl text-center text-xl tracking-widest font-semibold focus:outline-none mb-3"
          style={{
            background: 'var(--bg)',
            border: `1px solid ${error ? '#F87171' : 'var(--border-strong)'}`,
            color: 'var(--fg)',
            letterSpacing: '0.2em',
            fontSize: 20,
          }}
          autoFocus
        />
        {error && (
          <p className="text-xs text-center mb-3" style={{ color: '#F87171' }}>
            {error}
          </p>
        )}
        <button
          type="submit"
          className="w-full py-4 rounded-xl font-semibold text-base transition-all active:scale-95"
          style={{
            background: 'var(--yellow)',
            color: '#0A0A0A',
            minHeight: 52,
            fontSize: 16,
          }}
        >
          Continue →
        </button>
      </form>

      <button
        type="button"
        onClick={onBack}
        className="w-full mt-3 text-sm transition-colors"
        style={{ color: 'var(--fg-faint)', minHeight: 44 }}
      >
        ← Back
      </button>
    </div>
  )
}

// ---- Step 3: Email ----
function StepEmail({
  trade,
  zip,
  onBack,
  onDone,
}: {
  trade: string
  zip: string
  onBack: () => void
  onDone: () => void
}) {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Enter a valid email address.')
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          category: trade,
          location: zip,
          frequency: 'daily',
        }),
      })
      // Accept success, duplicate (409), rate limit (429), or server error (5xx)
      if (res.ok || [409, 429, 500, 502, 503].includes(res.status)) {
        localStorage.setItem(SIGNED_UP_KEY, 'true')
        onDone()
      } else {
        const data = await res.json().catch(() => ({}))
        setError(data.error || 'Something went wrong. Try again.')
      }
    } catch {
      setError('Connection error. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h2
        className="text-xl sm:text-2xl font-bold text-center mb-1"
        style={{ color: 'var(--fg)', fontFamily: 'var(--font-display), system-ui, sans-serif', letterSpacing: '-0.01em' }}
      >
        Where should we<br />send matches?
      </h2>
      <p className="text-sm text-center mb-5" style={{ color: 'var(--fg-muted)' }}>
        Daily alerts — no spam, ever.
      </p>

      <form onSubmit={handleSubmit}>
        <input
          type="email"
          name="email"
          autoComplete="email"
          placeholder="your@email.com"
          value={email}
          onChange={e => {
            setEmail(e.target.value)
            if (error) setError('')
          }}
          className="w-full px-4 py-4 rounded-xl text-center text-base focus:outline-none mb-3"
          style={{
            background: 'var(--bg)',
            border: `1px solid ${error ? '#F87171' : 'var(--border-strong)'}`,
            color: 'var(--fg)',
            fontSize: 16,
          }}
          autoFocus
        />
        {error && (
          <p className="text-xs text-center mb-3" style={{ color: '#F87171' }}>
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 rounded-xl font-semibold text-base transition-all active:scale-95 disabled:opacity-60"
          style={{
            background: 'var(--yellow)',
            color: '#0A0A0A',
            minHeight: 52,
            fontSize: 16,
          }}
        >
          {loading ? 'Setting up alerts...' : 'Get Job Alerts →'}
        </button>
      </form>

      <button
        type="button"
        onClick={onBack}
        className="w-full mt-3 text-sm transition-colors"
        style={{ color: 'var(--fg-faint)', minHeight: 44 }}
      >
        ← Back
      </button>
    </div>
  )
}

// ---- Done state ----
function StepDone({ onClose }: { onClose: () => void }) {
  return (
    <div className="text-center py-4">
      <div
        className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl"
        style={{ background: 'var(--green-dim)' }}
      >
        ✓
      </div>
      <h2
        className="text-xl sm:text-2xl font-bold mb-2"
        style={{ color: 'var(--fg)', fontFamily: 'var(--font-display), system-ui, sans-serif', letterSpacing: '-0.01em' }}
      >
        You&apos;re all set!
      </h2>
      <p className="text-sm mb-6" style={{ color: 'var(--fg-muted)' }}>
        We&apos;ll email you when new jobs match your trade and area.
      </p>
      <button
        type="button"
        onClick={onClose}
        className="w-full py-4 rounded-xl font-semibold text-base transition-all active:scale-95"
        style={{
          background: 'var(--bg-raised)',
          border: '1px solid var(--border)',
          color: 'var(--fg)',
          minHeight: 52,
          fontSize: 16,
        }}
      >
        Keep Browsing Jobs
      </button>
    </div>
  )
}

// ---- Main exported component ----
export function JobAlertPopup() {
  const [visible, setVisible] = useState(false)
  const [step, setStep] = useState(0) // 0=trade, 1=zip, 2=email, 3=done
  const [trade, setTrade] = useState('')
  const [zip, setZip] = useState('')
  const [authChecked, setAuthChecked] = useState(false)
  const [isAuth, setIsAuth] = useState(false)

  // Suppress if already dismissed or already signed up or authed
  const isSuppressed = (() => {
    if (typeof window === 'undefined') return true
    return (
      localStorage.getItem(DISMISSED_KEY) === 'true' ||
      localStorage.getItem(SIGNED_UP_KEY) === 'true'
    )
  })()

  useEffect(() => {
    if (isSuppressed) return
    const supabase = createClient()
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setIsAuth(true)
      setAuthChecked(true)
    })
  }, [isSuppressed])

  const showPopup = useCallback(() => {
    if (isSuppressed || !authChecked) return
    if (isAuth) return // logged-in users manage alerts in dashboard
    setVisible(true)
  }, [isSuppressed, authChecked, isAuth])

  useJobViewTrigger(showPopup)

  function dismiss() {
    localStorage.setItem(DISMISSED_KEY, 'true')
    setVisible(false)
  }

  function handleTradeNext(t: string) {
    setTrade(t)
    setStep(1)
  }
  function handleZipNext(z: string) {
    setZip(z)
    setStep(2)
  }
  function handleDone() {
    setStep(3)
  }

  if (!visible || !authChecked) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4"
        style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}
        onClick={(e) => {
          // Dismiss on backdrop click (not on modal itself)
          if (e.target === e.currentTarget) dismiss()
        }}
      >
        {/* Panel */}
        <div
          className="w-full sm:max-w-sm rounded-2xl p-6 relative"
          style={{
            background: 'var(--bg-raised)',
            border: '1px solid var(--border)',
            maxHeight: '92dvh',
            overflowY: 'auto',
          }}
          role="dialog"
          aria-modal="true"
          aria-label="Job alert signup"
        >
          {/* Close button */}
          <button
            type="button"
            onClick={dismiss}
            className="absolute top-4 right-4 w-9 h-9 flex items-center justify-center rounded-full text-sm transition-colors"
            style={{
              background: 'var(--bg)',
              border: '1px solid var(--border)',
              color: 'var(--fg-faint)',
              minWidth: 36,
              minHeight: 36,
            }}
            aria-label="Close"
          >
            ✕
          </button>

          {step < 3 && <ProgressDots step={step} total={3} />}

          {step === 0 && <StepTrade onNext={handleTradeNext} onSkip={() => { setTrade(''); setStep(1) }} />}
          {step === 1 && <StepZip onNext={handleZipNext} onBack={() => setStep(0)} />}
          {step === 2 && <StepEmail trade={trade} zip={zip} onBack={() => setStep(1)} onDone={handleDone} />}
          {step === 3 && <StepDone onClose={dismiss} />}
        </div>
      </div>
    </>
  )
}
