'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { CATEGORY_LABELS } from '@/types'

const BACKGROUNDS = [
  { value: 'electrician_commercial', label: 'Licensed electrician (commercial/industrial)' },
  { value: 'electrician_residential', label: 'Licensed electrician (residential)' },
  { value: 'hvac', label: 'HVAC technician' },
  { value: 'low_voltage', label: 'Low voltage / structured cabling' },
  { value: 'mep_engineer', label: 'MEP engineer' },
  { value: 'nuclear_industrial', label: 'Nuclear / industrial' },
  { value: 'construction', label: 'Construction / site management' },
  { value: 'operations', label: 'Operations / facilities' },
  { value: 'other', label: 'Other trades' },
]

const DC_COMPANIES_BY_CATEGORY: Record<string, string> = {
  electrician: 'Cologix, Iron Mountain, and CoreWeave',
  hvac: 'Equinix, Digital Realty, and QTS',
  low_voltage: 'Cologix, CyrusOne, and Aligned',
  operations: 'Equinix, Digital Realty, and NTT',
  construction: 'Turner, DPR, and Holder Construction',
  mep_engineer: 'Turner, DPR, and Holder Construction',
}
const DEFAULT_COMPANIES = 'Cologix, CoreWeave, and Equinix'

const BACKGROUND_NOTES: Record<string, string> = {
  electrician_commercial: 'Your background transfers well. DC employers look for MV/LV and power experience — which you likely have.',
  electrician_residential: 'Residential experience is a harder sell for DC work, but roles exist. We\'ll send you alerts and a guide on making the transition.',
  hvac: 'Precision cooling is in high demand. Your background is very relevant for DC facility work.',
  low_voltage: 'Low voltage and structured cabling is one of the fastest-growing DC specialties. Strong match.',
  mep_engineer: 'DC engineering roles are well-paid and plentiful. Good fit.',
  nuclear_industrial: 'Nuclear experience transfers exceptionally well to DC environments.',
  construction: 'DC construction and site management roles are plentiful — super and PM demand is high right now.',
  operations: 'Facilities and critical operations roles are growing fast with the AI buildout.',
}

export function AlertSignupWidget({
  keywords,
  category,
  subscriberCount,
  jobId,
}: {
  keywords?: string
  category?: string
  subscriberCount?: number
  jobId?: string
}) {
  const [email, setEmail] = useState('')
  const [background, setBackground] = useState('')
  const [step, setStep] = useState<'email' | 'qualifier'>('email')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [doneStatus, setDoneStatus] = useState<'pending' | 'already'>('pending')
  const [isAuth, setIsAuth] = useState(false)
  const [authChecking, setAuthChecking] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    // Check localStorage first — suppress form for returning visitors who already signed up
    if (localStorage.getItem('jobAlertSignedUp') === 'true') {
      setDone(true)
      setAuthChecking(false)
      return
    }
    // Check auth — logged-in users don't need to sign up via this widget
    const supabase = createClient()
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setIsAuth(true)
      setAuthChecking(false)
    })
  }, [])

  async function submitAlert(bg: string) {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          keywords,
          category,
          frequency: 'daily',
          ...(bg && { background: bg }),
          ...(jobId && { job_id: jobId }),
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (res.ok && data?.success) {
        localStorage.setItem('jobAlertSignedUp', 'true')
        setDoneStatus(data.status === 'already_subscribed' ? 'already' : 'pending')
        setDone(true)
      } else {
        setError(data?.error || 'Something went wrong. Try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStep('qualifier')
  }

  function handleBackgroundSelect(val: string) {
    setBackground(val)
    submitAlert(val)
  }

  function skipQualifier() {
    submitAlert('')
  }

  // While checking auth/localStorage, render nothing to avoid form flash
  if (authChecking) return null

  // Logged-in users manage alerts in their dashboard — no widget needed
  if (isAuth) return null

  if (done) {
    const isAlready = doneStatus === 'already'
    return (
      <div
        className="rounded-xl p-5 text-center"
        style={{
          background: isAlready ? 'var(--yellow-dim)' : 'var(--green-dim)',
          border: `1px solid ${isAlready ? 'var(--yellow-border)' : 'rgba(74,222,128,0.2)'}`,
        }}
      >
        <p
          className="font-semibold text-sm"
          style={{ color: isAlready ? 'var(--yellow)' : 'var(--green)' }}
        >
          {isAlready ? '✓ Already subscribed' : '📬 Check your email to confirm'}
        </p>
        <p className="text-xs mt-1" style={{ color: 'var(--fg-muted)' }}>
          {isAlready
            ? "You're already getting these alerts."
            : "We sent a one-click confirmation link. Your first alert arrives after you confirm."}
        </p>
        {!isAlready && background && BACKGROUND_NOTES[background] && (
          <p className="text-xs mt-2 px-2" style={{ color: 'var(--fg-faint)' }}>
            {BACKGROUND_NOTES[background]}
          </p>
        )}
      </div>
    )
  }

  return (
    <div className="rounded-xl p-5" style={{ background: 'var(--bg-raised)', border: '1px solid var(--border)' }}>
      {step === 'email' ? (
        <>
          <h3 className="font-semibold text-sm mb-1" style={{ color: 'var(--fg)' }}>
            Be first when {category ? `${CATEGORY_LABELS[category as keyof typeof CATEGORY_LABELS] ?? category.replace(/_/g, ' ')}` : keywords ? `"${keywords}"` : 'similar'} roles open
          </h3>
          <p className="text-xs mb-4" style={{ color: 'var(--fg-muted)' }}>
            Get daily alerts from {DC_COMPANIES_BY_CATEGORY[category ?? ''] ?? DEFAULT_COMPANIES} before they hit the big boards.
          </p>
          <form onSubmit={handleEmailSubmit} className="flex gap-2">
            <label htmlFor="alert-signup-email" className="sr-only">Email address</label>
            <input
              id="alert-signup-email"
              type="email"
              name="email"
              autoComplete="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              placeholder="your@email.com"
              className="flex-1 px-3 py-2 rounded-lg text-sm focus:outline-none autofill-bg-dark"
              style={{ background: 'var(--bg)', border: '1px solid var(--border-strong)', color: 'var(--fg)' }}
            />
            <button
              type="submit"
              className="px-4 py-2 rounded-lg font-semibold text-sm whitespace-nowrap"
              style={{ background: 'var(--yellow)', color: '#0A0A0A' }}
            >
              Notify me
            </button>
          </form>
          {error && <p className="text-xs mt-2" style={{ color: '#F87171' }}>{error}</p>}
          {subscriberCount != null && subscriberCount > 0 && (
            <p className="text-xs mt-2" style={{ color: 'var(--fg-faint)' }}>
              ✓ Join {subscriberCount >= 1000 ? `${Math.floor(subscriberCount / 100) * 100}+` : `${subscriberCount}+`} trades workers already getting alerts
            </p>
          )}
        </>
      ) : (
        <>
          <p className="font-semibold text-sm mb-3" style={{ color: 'var(--fg)' }}>
            What best describes your background?
          </p>
          <div className="space-y-1.5 mb-3">
            {BACKGROUNDS.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                onClick={() => handleBackgroundSelect(value)}
                disabled={loading}
                className="w-full text-left px-3 py-2 rounded-lg text-sm transition-colors hover:opacity-80 disabled:opacity-60"
                style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--fg)' }}
              >
                {label}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={skipQualifier}
            disabled={loading}
            className="text-xs transition-colors hover:opacity-80 disabled:opacity-60"
            style={{ color: 'var(--fg-faint)' }}
          >
            {loading ? 'Setting up...' : 'Skip →'}
          </button>
          {error && <p className="text-xs mt-2" style={{ color: '#F87171' }}>{error}</p>}
        </>
      )}
    </div>
  )
}
