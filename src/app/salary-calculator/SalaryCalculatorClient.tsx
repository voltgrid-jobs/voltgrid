'use client'
import { useState, useEffect } from 'react'

const TRADES = [
  { value: 'electrical', label: 'Electrician', icon: '⚡' },
  { value: 'hvac', label: 'HVAC Technician', icon: '❄️' },
  { value: 'low_voltage', label: 'Low Voltage / Cabling', icon: '📡' },
  { value: 'construction', label: 'Construction Trades', icon: '🏗️' },
  { value: 'operations', label: 'Operations / Facilities', icon: '⚙️' },
  { value: 'project_management', label: 'Project Manager', icon: '📋' },
]

const CITIES = [
  { value: 'nova', label: 'Northern Virginia' },
  { value: 'phoenix', label: 'Phoenix, AZ' },
  { value: 'dallas', label: 'Dallas, TX' },
  { value: 'chicago', label: 'Chicago, IL' },
  { value: 'portland', label: 'Portland, OR' },
  { value: 'atlanta', label: 'Atlanta, GA' },
  { value: 'other', label: 'Other / National Average' },
]

const EXPERIENCE_LEVELS = [
  { value: 'entry', label: 'Apprentice / Entry Level' },
  { value: 'mid', label: 'Journeyman / Mid Level' },
  { value: 'senior', label: 'Master / Senior Level' },
  { value: 'lead', label: 'Lead / Foreman' },
]

// Base hourly [min, max] for Journeyman/Mid level
const BASE_RATES: Record<string, Record<string, [number, number]>> = {
  electrical: {
    nova: [65, 82], phoenix: [50, 65], dallas: [48, 65],
    chicago: [55, 72], portland: [60, 78], atlanta: [45, 60], other: [44, 58],
  },
  hvac: {
    nova: [50, 68], phoenix: [44, 60], dallas: [40, 56],
    chicago: [44, 60], portland: [46, 62], atlanta: [38, 53], other: [36, 52],
  },
  low_voltage: {
    nova: [40, 56], phoenix: [32, 46], dallas: [34, 48],
    chicago: [34, 50], portland: [36, 52], atlanta: [28, 42], other: [28, 42],
  },
  construction: {
    nova: [50, 68], phoenix: [40, 57], dallas: [40, 57],
    chicago: [44, 62], portland: [46, 62], atlanta: [36, 52], other: [36, 52],
  },
  operations: {
    nova: [36, 52], phoenix: [30, 46], dallas: [28, 43],
    chicago: [30, 46], portland: [30, 47], atlanta: [26, 40], other: [26, 40],
  },
  project_management: {
    nova: [65, 88], phoenix: [55, 74], dallas: [55, 74],
    chicago: [58, 78], portland: [58, 78], atlanta: [50, 68], other: [50, 68],
  },
}

// Experience level multipliers [min, max]
const EXP_MULTS: Record<string, [number, number]> = {
  entry:  [0.65, 0.80],
  mid:    [1.00, 1.00],
  senior: [1.15, 1.25],
  lead:   [1.30, 1.45],
}

function calcRange(trade: string, city: string, exp: string) {
  const base = BASE_RATES[trade]?.[city] ?? [40, 60]
  const [mMin, mMax] = EXP_MULTS[exp] ?? [1, 1]
  const min = Math.round(base[0] * mMin)
  const max = Math.round(base[1] * mMax)
  return { min, max, annualMin: min * 2080, annualMax: max * 2080 }
}

function fmtDollars(n: number) {
  return `$${n.toLocaleString('en-US')}`
}

function nationalPremiumLabel(trade: string, city: string, exp: string): string | null {
  if (city === 'other') return null
  const local = calcRange(trade, city, exp)
  const nat = calcRange(trade, 'other', exp)
  const localAvg = (local.min + local.max) / 2
  const natAvg = (nat.min + nat.max) / 2
  if (natAvg === 0) return null
  const pct = Math.round(((localAvg - natAvg) / natAvg) * 100)
  if (pct > 0) return `${pct}% above national average`
  if (pct < 0) return `${Math.abs(pct)}% below national average`
  return 'at the national average'
}

export function SalaryCalculatorClient() {
  const [trade, setTrade] = useState('electrical')
  const [city, setCity] = useState('nova')
  const [exp, setExp] = useState('mid')
  const [showResult, setShowResult] = useState(false)
  const [unlocked, setUnlocked] = useState(false)
  const [email, setEmail] = useState('')
  const [gateLoading, setGateLoading] = useState(false)

  useEffect(() => {
    if (typeof localStorage !== 'undefined' && localStorage.getItem('jobAlertSignedUp') === 'true') {
      setUnlocked(true)
    }
  }, [])

  function handleCalculate(e: React.FormEvent) {
    e.preventDefault()
    setShowResult(true)
  }

  function handleChange(setter: (v: string) => void) {
    return (e: React.ChangeEvent<HTMLSelectElement>) => {
      setter(e.target.value)
      setShowResult(false)
    }
  }

  async function handleGateSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return
    setGateLoading(true)
    try {
      await fetch('/api/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), category: trade, frequency: 'daily' }),
      })
    } catch {
      // non-fatal — still unlock
    } finally {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('jobAlertSignedUp', 'true')
      }
      setGateLoading(false)
      setUnlocked(true)
    }
  }

  const result = calcRange(trade, city, exp)
  const tradeLabel = TRADES.find(t => t.value === trade)?.label ?? trade
  const cityLabel = CITIES.find(c => c.value === city)?.label ?? city
  const expLabel = EXPERIENCE_LEVELS.find(e => e.value === exp)?.label ?? exp
  const premium = nationalPremiumLabel(trade, city, exp)
  const natRange = calcRange(trade, 'other', exp)
  const expTable = EXPERIENCE_LEVELS.map(e => ({
    label: e.label,
    range: calcRange(trade, city, e.value),
    active: e.value === exp,
  }))

  const selectClass = 'w-full px-3 py-2.5 rounded-lg text-sm focus:outline-none'
  const selectStyle = { background: 'var(--bg)', border: '1px solid var(--border-strong)', color: 'var(--fg)' }

  return (
    <div>
      {/* Form */}
      <form onSubmit={handleCalculate}
        className="rounded-2xl p-6 sm:p-8 mb-6"
        style={{ background: 'var(--bg-raised)', border: '1px solid var(--border)' }}
      >
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-6">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: 'var(--fg-faint)' }}>
              Trade
            </label>
            <select value={trade} onChange={handleChange(setTrade)} className={selectClass} style={selectStyle}>
              {TRADES.map(t => (
                <option key={t.value} value={t.value}>{t.icon} {t.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: 'var(--fg-faint)' }}>
              Market
            </label>
            <select value={city} onChange={handleChange(setCity)} className={selectClass} style={selectStyle}>
              {CITIES.map(c => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: 'var(--fg-faint)' }}>
              Experience
            </label>
            <select value={exp} onChange={handleChange(setExp)} className={selectClass} style={selectStyle}>
              {EXPERIENCE_LEVELS.map(e => (
                <option key={e.value} value={e.value}>{e.label}</option>
              ))}
            </select>
          </div>
        </div>

        <button
          type="submit"
          className="w-full sm:w-auto px-8 py-3 rounded-xl font-bold text-base transition-opacity hover:opacity-90"
          style={{ background: 'var(--yellow)', color: '#0A0A0A' }}
        >
          Calculate Salary →
        </button>
      </form>

      {/* Results */}
      {showResult && (
        <div className="space-y-4">

          {/* Primary result — always visible */}
          <div className="rounded-2xl p-6 sm:p-8" style={{ background: 'var(--bg-raised)', border: '1px solid var(--border)' }}>
            <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: 'var(--fg-faint)' }}>
              {expLabel} · {tradeLabel} · {cityLabel}
            </p>
            <div className="flex flex-col sm:flex-row sm:items-end gap-3 mb-3">
              <div>
                <p className="text-xs uppercase tracking-wide mb-1" style={{ color: 'var(--fg-faint)' }}>Typical hourly rate</p>
                <p
                  className="font-extrabold leading-none"
                  style={{ fontSize: 'clamp(2rem, 6vw, 3rem)', color: 'var(--yellow)', fontFamily: 'var(--font-display), system-ui, sans-serif' }}
                >
                  {fmtDollars(result.min)}&ndash;{fmtDollars(result.max)}/hr
                </p>
              </div>
              {premium && (
                <span
                  className="self-start sm:self-end text-xs font-semibold px-3 py-1.5 rounded-full"
                  style={{ background: 'var(--green-dim)', color: 'var(--green)', border: '1px solid rgba(74,222,128,0.2)' }}
                >
                  ↑ {premium}
                </span>
              )}
            </div>
            <p className="text-xs" style={{ color: 'var(--fg-faint)' }}>
              2026 market estimates. Actual pay varies by employer, union status, overtime, and per diem.
            </p>
          </div>

          {/* Gated breakdown */}
          {unlocked ? (
            <>
              {/* Annual + national comparison */}
              <div
                className="rounded-2xl p-6 grid sm:grid-cols-2 gap-6"
                style={{ background: 'var(--bg-raised)', border: '1px solid var(--border)' }}
              >
                <div>
                  <p className="text-xs uppercase tracking-wide mb-1" style={{ color: 'var(--fg-faint)' }}>Annual equivalent</p>
                  <p className="text-2xl font-bold" style={{ color: 'var(--fg)', fontFamily: 'var(--font-display), system-ui, sans-serif' }}>
                    {fmtDollars(result.annualMin)}&ndash;{fmtDollars(result.annualMax)}/yr
                  </p>
                  <p className="text-xs mt-1" style={{ color: 'var(--fg-faint)' }}>Based on 2,080 hrs/yr (40 hr weeks, no OT)</p>
                </div>
                {city !== 'other' && (
                  <div>
                    <p className="text-xs uppercase tracking-wide mb-1" style={{ color: 'var(--fg-faint)' }}>National average (same trade + experience)</p>
                    <p className="text-2xl font-bold" style={{ color: 'var(--fg-muted)', fontFamily: 'var(--font-display), system-ui, sans-serif' }}>
                      {fmtDollars(natRange.min)}&ndash;{fmtDollars(natRange.max)}/hr
                    </p>
                    {premium && (
                      <p className="text-xs mt-1" style={{ color: 'var(--fg-faint)' }}>{cityLabel} is {premium}</p>
                    )}
                  </div>
                )}
              </div>

              {/* Experience level breakdown */}
              <div className="rounded-2xl p-6" style={{ background: 'var(--bg-raised)', border: '1px solid var(--border)' }}>
                <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: 'var(--fg-faint)' }}>
                  Pay by experience — {tradeLabel} in {cityLabel}
                </p>
                <div className="space-y-2">
                  {expTable.map(({ label, range, active }) => (
                    <div
                      key={label}
                      className="flex items-center justify-between gap-4 rounded-lg px-3 py-2"
                      style={active
                        ? { background: 'var(--yellow-dim)', border: '1px solid var(--yellow-border)' }
                        : { background: 'var(--bg)', border: '1px solid transparent' }
                      }
                    >
                      <p className="text-sm flex-1" style={{ color: active ? 'var(--fg)' : 'var(--fg-muted)' }}>
                        {label} {active && <span className="text-xs" style={{ color: 'var(--yellow)' }}>← your selection</span>}
                      </p>
                      <p className="text-sm font-semibold tabular-nums" style={{ color: active ? 'var(--yellow)' : 'var(--fg-muted)' }}>
                        {fmtDollars(range.min)}&ndash;{fmtDollars(range.max)}/hr
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Browse jobs CTA */}
              <div
                className="rounded-2xl px-6 py-5 flex flex-col sm:flex-row sm:items-center gap-4"
                style={{ background: 'var(--yellow-dim)', border: '1px solid var(--yellow-border)' }}
              >
                <div className="flex-1">
                  <p className="font-semibold text-sm mb-0.5" style={{ color: 'var(--fg)' }}>
                    Find {tradeLabel} jobs near you
                  </p>
                  <p className="text-xs" style={{ color: 'var(--fg-faint)' }}>
                    Job alerts set. We&apos;ll email you when matching roles open.
                  </p>
                </div>
                <a
                  href={`/jobs?category=${trade}`}
                  className="text-sm font-bold px-5 py-2.5 rounded-lg whitespace-nowrap transition-opacity hover:opacity-90"
                  style={{ background: 'var(--yellow)', color: '#0A0A0A' }}
                >
                  Browse {tradeLabel} Jobs →
                </a>
              </div>
            </>
          ) : (
            /* Gate */
            <div
              className="rounded-2xl p-6 sm:p-8"
              style={{ background: 'var(--bg-raised)', border: '1px solid var(--yellow-border)' }}
            >
              <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: 'var(--yellow)' }}>
                Unlock full breakdown
              </p>
              <p className="text-sm mb-1" style={{ color: 'var(--fg)', lineHeight: 1.6 }}>
                See the annual salary equivalent, how {cityLabel} compares to the national average, and pay at every experience level.
              </p>
              <p className="text-xs mb-5" style={{ color: 'var(--fg-faint)' }}>
                We&apos;ll also send job alerts when {tradeLabel.toLowerCase()} roles open.
              </p>
              <form onSubmit={handleGateSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md">
                <label htmlFor="calc-email" className="sr-only">Email address</label>
                <input
                  id="calc-email"
                  type="email"
                  required
                  placeholder="your@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  autoComplete="email"
                  className="flex-1 px-3 py-2.5 rounded-lg text-sm focus:outline-none autofill-bg-dark"
                  style={{ background: 'var(--bg)', border: '1px solid var(--border-strong)', color: 'var(--fg)' }}
                />
                <button
                  type="submit"
                  disabled={gateLoading || !email.trim()}
                  className="px-5 py-2.5 rounded-lg font-semibold text-sm transition-opacity hover:opacity-90 disabled:opacity-40 whitespace-nowrap"
                  style={{ background: 'var(--yellow)', color: '#0A0A0A' }}
                >
                  {gateLoading ? 'Loading...' : 'See full breakdown →'}
                </button>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
