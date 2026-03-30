'use client'
import { useState } from 'react'
import { CATEGORY_LABELS, JOB_TYPE_LABELS, TRAVEL_LABELS, SHIFT_LABELS } from '@/types'

const PLAN_DISPLAY: Record<string, { name: string; price: string; description: string }> = {
  single_post: { name: 'Single Listing', price: '$149', description: '1 listing · 30 days active' },
  five_pack: { name: '5-Pack', price: '$499', description: '5 listings at $99 each · use any time' },
  pro_monthly: { name: 'Pro Monthly', price: '$799/mo', description: 'Unlimited listings' },
}

const inputCls = 'w-full px-3 py-2.5 rounded-lg text-sm transition-colors focus:outline-none'
const inputStyle = {
  background: 'var(--bg)',
  border: '1px solid var(--border-strong)',
  color: 'var(--fg)',
}
const inputFocusStyle = 'focus:border-yellow-400'
const labelCls = 'block text-sm font-medium mb-1'
const helpCls = 'text-xs mt-1'

function FieldHelp({ children }: { children: React.ReactNode }) {
  return <p className={helpCls} style={{ color: 'var(--fg-faint)' }}>{children}</p>
}

// Step progress indicator
function StepIndicator({ step }: { step: 1 | 2 }) {
  return (
    <div className="flex items-center gap-2 mb-8">
      {[
        { n: 1, label: 'Job Details' },
        { n: 2, label: 'Review & Pay' },
      ].map(({ n, label }, i) => {
        const active = step === n
        const done = step > n
        return (
          <div key={n} className="flex items-center gap-2">
            {i > 0 && <div className="flex-1 h-px w-8" style={{ background: done || active ? 'var(--yellow)' : 'var(--border)' }} />}
            <div className="flex items-center gap-1.5">
              <span
                className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                style={{
                  background: active ? 'var(--yellow)' : done ? 'var(--yellow)' : 'var(--bg-raised)',
                  color: active || done ? '#0A0A0A' : 'var(--fg-faint)',
                  border: active || done ? 'none' : '1px solid var(--border)',
                }}
              >
                {done ? '✓' : n}
              </span>
              <span className="text-xs font-medium hidden sm:block" style={{ color: active ? 'var(--fg)' : 'var(--fg-faint)' }}>
                {label}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}

interface PostJobFormProps {
  selectedPlan: string
  setSelectedPlan: (plan: string) => void
}

export function PostJobForm({ selectedPlan, setSelectedPlan: _setSelectedPlan }: PostJobFormProps) {
  const [step, setStep] = useState<1 | 2>(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPerDiemRate, setShowPerDiemRate] = useState(false)
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [creditBalance, setCreditBalance] = useState<{ post_credits: number; is_pro: boolean } | null>(null)
  const [creditLoading, setCreditLoading] = useState(false)

  // Step 1 form values (controlled for review step)
  const [vals, setVals] = useState({
    company_name: '', company_email: '', title: '', category: 'electrical',
    job_type: 'full_time', location: '', remote: false, salary_min: '',
    salary_max: '', description: '', apply_url: '', per_diem: false,
    per_diem_rate: '', travel_required: '', shift_type: '', contract_length: '', is_union: false,
  })

  function field(name: keyof typeof vals) {
    return {
      value: vals[name] as string,
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
        setVals(v => ({ ...v, [name]: e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value })),
      onBlur: () => setTouched(t => ({ ...t, [name]: true })),
    }
  }

  function fieldError(name: keyof typeof vals, label: string): string | null {
    if (!touched[name]) return null
    if (['company_name', 'title', 'location', 'description', 'apply_url', 'company_email'].includes(name)) {
      if (!vals[name]) return `${label} is required`
    }
    if (name === 'company_email' && vals.company_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(vals.company_email)) {
      return 'Enter a valid email address'
    }
    return null
  }

  function requiredFields() {
    return ['company_name', 'company_email', 'title', 'location', 'description', 'apply_url'] as const
  }

  function goToReview(e: React.FormEvent) {
    e.preventDefault()
    // Mark all required fields touched
    const allTouched: Record<string, boolean> = {}
    requiredFields().forEach(f => { allTouched[f] = true })
    setTouched(allTouched)
    // Check for errors
    const hasErrors = requiredFields().some(f => !vals[f]) ||
      (vals.company_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(vals.company_email))
    if (hasErrors) return
    setStep(2)
    window.scrollTo({ top: 0, behavior: 'smooth' })

    // Fetch credit balance for current user
    setCreditLoading(true)
    fetch('/api/employer-credits')
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data) setCreditBalance(data) })
      .catch(() => {})
      .finally(() => setCreditLoading(false))
  }

  async function handleSubmit() {
    setLoading(true)
    setError('')

    const hasCredits = creditBalance && (creditBalance.is_pro || creditBalance.post_credits > 0)

    if (hasCredits) {
      // Credit redemption path — bypass Stripe
      try {
        const res = await fetch('/api/post-with-credit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(vals),
        })
        const json = await res.json()
        if (json.success) {
          window.location.href = `/success?job_id=${json.job_id}`
        } else {
          setError(json.error === 'no_credits' ? 'No credits remaining. Please select a plan below.' : (json.error || 'Something went wrong.'))
          setCreditBalance(null) // fallback to Stripe flow
        }
      } catch {
        setError('Network error. Please try again.')
      } finally {
        setLoading(false)
      }
      return
    }

    // Stripe checkout path — uses selectedPlan from sticky selector
    const data = { plan: selectedPlan, ...vals }
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const json = await res.json()
      if (json.url) {
        window.location.href = json.url
      } else {
        setError(json.error || 'Something went wrong. Please try again.')
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const currentPlan = PLAN_DISPLAY[selectedPlan] ?? PLAN_DISPLAY.single_post
  const hasCredits = creditBalance && (creditBalance.is_pro || creditBalance.post_credits > 0)

  // ── STEP 2: Review & Pay ──
  if (step === 2) {
    return (
      <div>
        <StepIndicator step={2} />

        {/* Summary */}
        <div className="rounded-xl p-5 mb-6 space-y-2 text-sm" style={{ background: 'var(--bg-raised)', border: '1px solid var(--border)' }}>
          <p className="font-semibold mb-3" style={{ color: 'var(--fg)' }}>Review your listing</p>
          {[
            ['Company', vals.company_name],
            ['Email', vals.company_email],
            ['Job Title', vals.title],
            ['Location', vals.location + (vals.remote ? ' · Remote OK' : '')],
            ['Trade', CATEGORY_LABELS[vals.category as keyof typeof CATEGORY_LABELS]],
            ['Type', JOB_TYPE_LABELS[vals.job_type as keyof typeof JOB_TYPE_LABELS]],
            ['Salary', vals.salary_min || vals.salary_max ? `$${vals.salary_min} – $${vals.salary_max}` : '—'],
            ['Apply URL', vals.apply_url],
          ].map(([k, v]) => (
            <div key={k} className="flex gap-3">
              <span className="w-20 flex-shrink-0" style={{ color: 'var(--fg-faint)' }}>{k}</span>
              <span style={{ color: 'var(--fg)' }} className="break-all">{v}</span>
            </div>
          ))}
        </div>

        {/* Credit banner — shown when employer has credits */}
        {creditLoading && (
          <div className="mb-4 text-sm" style={{ color: 'var(--fg-faint)' }}>Checking your account...</div>
        )}
        {!creditLoading && hasCredits && (
          <div className="mb-6 rounded-xl px-4 py-3 flex items-center gap-3" style={{ background: 'var(--yellow-dim)', border: '1px solid var(--yellow-border)' }}>
            <span style={{ color: 'var(--yellow)' }}>⚡</span>
            <div className="text-sm">
              <span className="font-semibold" style={{ color: 'var(--fg)' }}>
                {creditBalance!.is_pro ? 'Pro account — unlimited posts' : `${creditBalance!.post_credits} job credit${creditBalance!.post_credits !== 1 ? 's' : ''} remaining`}
              </span>
              <span style={{ color: 'var(--fg-muted)' }}> — this post will use 1 credit. No payment needed.</span>
            </div>
          </div>
        )}

        {/* Selected plan — read-only when no credits; plan is managed by sticky selector above */}
        {!hasCredits && (
          <div className="mb-6">
            <p className="text-sm font-medium mb-2" style={{ color: 'var(--fg)' }}>Selected plan</p>
            <div
              className="rounded-xl p-4 flex items-center justify-between gap-4"
              style={{ border: '1px solid var(--yellow)', background: 'var(--yellow-dim)' }}
            >
              <div>
                <p className="font-semibold text-sm" style={{ color: 'var(--fg)' }}>{currentPlan.name}</p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--fg-faint)' }}>{currentPlan.description}</p>
              </div>
              <span className="text-xl font-bold flex-shrink-0" style={{ color: 'var(--yellow)' }}>
                {currentPlan.price}
              </span>
            </div>
            <p className="text-xs mt-2" style={{ color: 'var(--fg-faint)' }}>
              To change plan, use the selector at the top of the page.
            </p>
          </div>
        )}

        {/* Launch urgency */}
        <p className="text-xs text-center mb-2" style={{ color: 'var(--yellow)' }}>
          🚀 Launch pricing — rates increase after April 30
        </p>

        {error && (
          <div className="rounded-lg px-4 py-3 text-sm mb-4" style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)', color: '#F87171' }}>
            {error}
          </div>
        )}

        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading}
          className="w-full py-4 rounded-xl font-semibold text-lg transition-opacity disabled:opacity-60"
          style={{ background: 'var(--yellow)', color: '#0A0A0A' }}
        >
          {loading
            ? (hasCredits ? 'Posting your job...' : 'Redirecting to checkout...')
            : hasCredits
              ? 'Post Job — Use 1 Credit →'
              : `Pay ${currentPlan.price} — Continue to Stripe →`
          }
        </button>

        <p className="text-xs text-center mt-3" style={{ color: 'var(--fg-faint)' }}>
          {hasCredits
            ? 'Your job goes live immediately. No payment required.'
            : 'Secure payment via Stripe. Your job goes live immediately after payment.'
          }
        </p>

        <button type="button" onClick={() => { setStep(1); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
          className="w-full mt-3 py-2 text-sm transition-colors"
          style={{ color: 'var(--fg-muted)' }}>
          ← Edit job details
        </button>
      </div>
    )
  }

  // ── STEP 1: Job Details ──
  return (
    <form onSubmit={goToReview} noValidate className="space-y-6">
      <StepIndicator step={1} />

      {/* Company */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelCls} style={{ color: 'var(--fg)' }}>Company Name *</label>
          <input name="company_name" required type="text" placeholder="Acme Construction"
            className={`${inputCls} ${inputFocusStyle}`} style={inputStyle} {...field('company_name')} />
          {fieldError('company_name', 'Company name') && (
            <p className={helpCls} style={{ color: '#F87171' }}>{fieldError('company_name', 'Company name')}</p>
          )}
        </div>
        <div>
          <label className={labelCls} style={{ color: 'var(--fg)' }}>Contact Email *</label>
          <input name="company_email" required type="email" placeholder="hr@company.com"
            className={`${inputCls} ${inputFocusStyle}`} style={inputStyle} {...field('company_email')} />
          <FieldHelp>For listing confirmation and renewal reminders</FieldHelp>
          {fieldError('company_email', 'Email') && (
            <p className={helpCls} style={{ color: '#F87171' }}>{fieldError('company_email', 'Email')}</p>
          )}
        </div>
      </div>

      {/* Job title */}
      <div>
        <label className={labelCls} style={{ color: 'var(--fg)' }}>Job Title *</label>
        <input name="title" required type="text" placeholder="Journeyman Electrician — Data Center"
          className={`${inputCls} ${inputFocusStyle}`} style={inputStyle} {...field('title')} />
        <FieldHelp>Be specific — titles like &quot;Data Center HVAC Technician&quot; get 3× more clicks</FieldHelp>
        {fieldError('title', 'Job title') && (
          <p className={helpCls} style={{ color: '#F87171' }}>{fieldError('title', 'Job title')}</p>
        )}
      </div>

      {/* Trade + Type */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelCls} style={{ color: 'var(--fg)' }}>Trade *</label>
          <select name="category" required className={`${inputCls} ${inputFocusStyle}`} style={inputStyle} {...field('category')}>
            {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelCls} style={{ color: 'var(--fg)' }}>Job Type *</label>
          <select name="job_type" required className={`${inputCls} ${inputFocusStyle}`} style={inputStyle} {...field('job_type')}>
            {Object.entries(JOB_TYPE_LABELS).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Location */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelCls} style={{ color: 'var(--fg)' }}>Location *</label>
          <input name="location" required type="text" placeholder="Phoenix, AZ"
            className={`${inputCls} ${inputFocusStyle}`} style={inputStyle} {...field('location')} />
          <FieldHelp>City, State — or &quot;Multiple Locations&quot; for multi-site</FieldHelp>
          {fieldError('location', 'Location') && (
            <p className={helpCls} style={{ color: '#F87171' }}>{fieldError('location', 'Location')}</p>
          )}
        </div>
        <div className="flex items-center pt-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input name="remote" type="checkbox" checked={vals.remote}
              onChange={e => setVals(v => ({ ...v, remote: e.target.checked }))}
              className="w-4 h-4 rounded" style={{ accentColor: 'var(--yellow)' }} />
            <span className="text-sm" style={{ color: 'var(--fg)' }}>Remote / travel OK</span>
          </label>
        </div>
      </div>

      {/* Salary */}
      <div>
        <label className={labelCls} style={{ color: 'var(--fg)' }}>Salary Range (USD)</label>
        <div className="grid grid-cols-2 gap-4">
          <input name="salary_min" type="number" placeholder="70000"
            className={`${inputCls} ${inputFocusStyle}`} style={inputStyle} {...field('salary_min')} />
          <input name="salary_max" type="number" placeholder="120000"
            className={`${inputCls} ${inputFocusStyle}`} style={inputStyle} {...field('salary_max')} />
        </div>
        <FieldHelp>Listings with salary ranges get significantly more applicants. Annual or hourly — we display both.</FieldHelp>
      </div>

      {/* Description */}
      <div>
        <label className={labelCls} style={{ color: 'var(--fg)' }}>Job Description *</label>
        <textarea name="description" required rows={8}
          placeholder="Include: key responsibilities, required certifications (OSHA-10, NFPA 70E, etc.), experience level, and what makes this project exciting..."
          className={`${inputCls} ${inputFocusStyle} resize-none`} style={inputStyle} {...field('description')} />
        <FieldHelp>Aim for 200+ words. Mention the data center or AI project — it helps attract the right candidates.</FieldHelp>
        {fieldError('description', 'Job description') && (
          <p className={helpCls} style={{ color: '#F87171' }}>{fieldError('description', 'Job description')}</p>
        )}
      </div>

      {/* Apply URL */}
      <div>
        <label className={labelCls} style={{ color: 'var(--fg)' }}>Apply URL or Email *</label>
        <input name="apply_url" required type="text"
          placeholder="https://your-ats.com/apply/123 or hiring@company.com"
          className={`${inputCls} ${inputFocusStyle}`} style={inputStyle} {...field('apply_url')} />
        <FieldHelp>Candidates click &quot;Apply&quot; and go directly here. You can use an ATS link or email address.</FieldHelp>
        {fieldError('apply_url', 'Apply URL') && (
          <p className={helpCls} style={{ color: '#F87171' }}>{fieldError('apply_url', 'Apply URL')}</p>
        )}
      </div>

      {/* Trades details */}
      <div className="pt-4" style={{ borderTop: '1px solid var(--border)' }}>
        <h3 className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: 'var(--fg-faint)' }}>Trades Details (optional)</h3>

        <div className="mb-4">
          <label className="flex items-center gap-3 cursor-pointer mb-2">
            <input name="per_diem" type="checkbox" checked={vals.per_diem}
              onChange={e => { setVals(v => ({ ...v, per_diem: e.target.checked })); setShowPerDiemRate(e.target.checked) }}
              className="w-4 h-4 rounded" style={{ accentColor: 'var(--yellow)' }} />
            <span className="text-sm" style={{ color: 'var(--fg)' }}>Per diem / daily allowance included</span>
          </label>
          {showPerDiemRate && (
            <input name="per_diem_rate" type="number" placeholder="Daily rate (e.g. 150)"
              className={`w-full sm:w-48 ${inputCls} ${inputFocusStyle}`} style={inputStyle} {...field('per_diem_rate')} />
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className={labelCls} style={{ color: 'var(--fg)' }}>Travel Required</label>
            <select name="travel_required" className={`${inputCls} ${inputFocusStyle}`} style={inputStyle} {...field('travel_required')}>
              <option value="">Not specified</option>
              {Object.entries(TRAVEL_LABELS).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelCls} style={{ color: 'var(--fg)' }}>Shift Type</label>
            <select name="shift_type" className={`${inputCls} ${inputFocusStyle}`} style={inputStyle} {...field('shift_type')}>
              <option value="">Not specified</option>
              {Object.entries(SHIFT_LABELS).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="mb-4">
          <label className={labelCls} style={{ color: 'var(--fg)' }}>Contract / Assignment Length</label>
          <input name="contract_length" type="text" placeholder="e.g. 6-month contract, 18-month project"
            className={`${inputCls} ${inputFocusStyle}`} style={inputStyle} {...field('contract_length')} />
        </div>

        <label className="flex items-center gap-3 cursor-pointer">
          <input name="is_union" type="checkbox" checked={vals.is_union}
            onChange={e => setVals(v => ({ ...v, is_union: e.target.checked }))}
            className="w-4 h-4 rounded" style={{ accentColor: '#60A5FA' }} />
          <span className="text-sm" style={{ color: 'var(--fg)' }}>
            This position is covered by a collective bargaining agreement (IBEW, UA, or other union)
          </span>
        </label>
      </div>

      {/* Live listing preview — shown last, directly above CTA */}
      <div className="pt-4" style={{ borderTop: '1px solid var(--border)' }}>
        <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--fg-faint)' }}>
          Preview — your listing will look like this
        </p>
        <div className="rounded-xl p-4" style={{ background: 'var(--bg-raised)', border: '1px solid var(--border)' }}>
          <div className="flex flex-wrap gap-1.5 mb-2">
            <span className="text-xs px-2 py-0.5 rounded" style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--fg-faint)' }}>
              {CATEGORY_LABELS[vals.category as keyof typeof CATEGORY_LABELS] || 'Trade'}
            </span>
            <span className="text-xs px-2 py-0.5 rounded" style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--fg-faint)' }}>
              {JOB_TYPE_LABELS[vals.job_type as keyof typeof JOB_TYPE_LABELS] || 'Type'}
            </span>
          </div>
          <p className="font-semibold text-base mb-0.5" style={{ color: vals.title ? 'var(--fg)' : 'var(--fg-faint)' }}>
            {vals.title || 'Your job title'}
          </p>
          <p className="text-sm" style={{ color: 'var(--fg-muted)' }}>
            <span style={{ color: vals.company_name ? 'var(--fg-muted)' : 'var(--fg-faint)' }}>
              {vals.company_name || 'Your company'}
            </span>
            <span style={{ color: 'var(--fg-faint)' }}> · </span>
            <span style={{ color: vals.location ? 'var(--fg-muted)' : 'var(--fg-faint)' }}>
              {vals.location || 'Location'}
            </span>
            {vals.remote && <span style={{ color: 'var(--fg-faint)' }}> · Remote OK</span>}
          </p>
          {(vals.salary_min || vals.salary_max) && (
            <p className="text-sm mt-1 font-semibold" style={{ color: 'var(--green)' }}>
              {vals.salary_min && vals.salary_max
                ? `$${Math.round(Number(vals.salary_min) / 2080)}/hr (~$${Math.round(Number(vals.salary_min) / 1000)}k–$${Math.round(Number(vals.salary_max) / 1000)}k/yr)`
                : vals.salary_min
                ? `~$${Math.round(Number(vals.salary_min) / 2080)}/hr`
                : `up to ~$${Math.round(Number(vals.salary_max) / 2080)}/hr`}
            </p>
          )}
        </div>
      </div>

      <button type="submit"
        className="w-full py-4 rounded-xl font-semibold text-lg transition-opacity"
        style={{ background: 'var(--yellow)', color: '#0A0A0A' }}>
        Review &amp; Continue →
      </button>

      <p className="text-xs text-center" style={{ color: 'var(--fg-faint)' }}>
        Next: review your listing details and complete payment via Stripe.
      </p>
    </form>
  )
}
