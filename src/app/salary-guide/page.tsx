'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/client'

// NOTE: This is a client component. Metadata is defined inline as static constants
// and referenced in the HTML head via the parent layout.

// ─────────────────────────────────────────────────────────────────────
// Salary data — sourced from VoltGrid listings + current market data
// DB had 66 salary records: 36 hourly electrical ($20-$128/hr),
// 19 annual electrical ($35k-$180k), sparse HVAC/LV/Construction.
// Market ranges below use DB data as anchors + industry benchmarks.
// ─────────────────────────────────────────────────────────────────────

type MarketRow = {
  market: string
  role: string
  low: number
  high: number
  unit: 'hr' | 'yr'
  note?: string
}

const ELECTRICAL_MARKETS: MarketRow[] = [
  { market: 'Northern Virginia', role: 'Journeyman Electrician', low: 42, high: 58, unit: 'hr', note: 'Premium for 480V/medium voltage work' },
  { market: 'Northern Virginia', role: 'Master Electrician', low: 55, high: 75, unit: 'hr', note: 'Project lead / commissioning roles' },
  { market: 'Phoenix / Goodyear', role: 'Journeyman Electrician', low: 38, high: 52, unit: 'hr' },
  { market: 'Phoenix / Goodyear', role: 'Master Electrician', low: 50, high: 68, unit: 'hr' },
  { market: 'Dallas / Fort Worth', role: 'Journeyman Electrician', low: 36, high: 48, unit: 'hr' },
  { market: 'Dallas / Fort Worth', role: 'Master Electrician', low: 48, high: 65, unit: 'hr' },
  { market: 'Chicago (Union)', role: 'Journeyman Electrician', low: 44, high: 60, unit: 'hr', note: 'IBEW Local 134 scale' },
  { market: 'Chicago (Union)', role: 'Master Electrician', low: 58, high: 78, unit: 'hr', note: 'Foreman / GF scale' },
  { market: 'Atlanta / Covington', role: 'Journeyman Electrician', low: 30, high: 40, unit: 'hr', note: 'From VoltGrid listings' },
  { market: 'Atlanta / Covington', role: 'Master Electrician', low: 42, high: 58, unit: 'hr' },
  { market: 'Houston', role: 'Journeyman Electrician', low: 32, high: 47, unit: 'hr', note: 'From VoltGrid listings' },
  { market: 'Houston', role: 'Master / Superintendent', low: 120000, high: 180000, unit: 'yr', note: 'From VoltGrid listings' },
]

const HVAC_MARKETS: MarketRow[] = [
  { market: 'Northern Virginia', role: 'DC HVAC Technician', low: 40, high: 58, unit: 'hr', note: 'CRAC / precision cooling experience' },
  { market: 'Phoenix', role: 'DC HVAC Technician', low: 35, high: 50, unit: 'hr' },
  { market: 'Dallas / Fort Worth', role: 'DC HVAC Technician', low: 32, high: 46, unit: 'hr' },
  { market: 'Chicago (Union)', role: 'DC HVAC Technician', low: 42, high: 62, unit: 'hr', note: 'UA Local scale' },
  { market: 'Atlanta', role: 'DC HVAC Technician', low: 28, high: 40, unit: 'hr' },
  { market: 'National (travel)', role: 'HVAC Commissioning Tech', low: 50, high: 72, unit: 'hr', note: 'Includes per diem' },
]

const LV_MARKETS: MarketRow[] = [
  { market: 'Northern Virginia', role: 'Low Voltage Technician', low: 30, high: 46, unit: 'hr' },
  { market: 'Northern Virginia', role: 'BMS / DCIM Specialist', low: 45, high: 65, unit: 'hr', note: 'Growing rapidly with AI buildout' },
  { market: 'Phoenix / Dallas', role: 'Low Voltage Technician', low: 25, high: 40, unit: 'hr' },
  { market: 'Chicago (Union)', role: 'Low Voltage Technician', low: 32, high: 50, unit: 'hr', note: 'IBEW Inside Wire' },
  { market: 'National', role: 'Fiber Splicing Specialist', low: 35, high: 55, unit: 'hr' },
  { market: 'National', role: 'DC Infrastructure PM', low: 130000, high: 185000, unit: 'yr', note: 'From VoltGrid listings' },
]

const CONSTRUCTION_MARKETS: MarketRow[] = [
  { market: 'Northern Virginia', role: 'Site Superintendent', low: 120000, high: 175000, unit: 'yr' },
  { market: 'Columbus / OH', role: 'Construction Superintendent', low: 160000, high: 200000, unit: 'yr', note: 'From VoltGrid listings' },
  { market: 'Houston', role: 'Project Manager', low: 90000, high: 140000, unit: 'yr' },
  { market: 'Phoenix', role: 'Site Superintendent', low: 115000, high: 165000, unit: 'yr' },
  { market: 'National (travel)', role: 'Construction PM — Hyperscale', low: 150000, high: 230000, unit: 'yr', note: 'From VoltGrid listings' },
]

// ── Filter configuration ─────────────────────────────────────────────────────

const TRADE_OPTIONS = [
  { value: '', label: 'All Trades' },
  { value: 'electrical', label: 'Electrical' },
  { value: 'hvac', label: 'HVAC' },
  { value: 'low_voltage', label: 'Low Voltage' },
  { value: 'construction', label: 'Construction' },
]

const LOCATION_OPTIONS = [
  { value: '', label: 'All Markets' },
  { value: 'northern-virginia', label: 'Northern Virginia' },
  { value: 'phoenix', label: 'Phoenix' },
  { value: 'dallas-fort-worth', label: 'Dallas / Fort Worth' },
  { value: 'chicago', label: 'Chicago' },
  { value: 'atlanta', label: 'Atlanta' },
  { value: 'houston', label: 'Houston' },
  { value: 'columbus', label: 'Columbus / OH' },
  { value: 'national', label: 'National' },
]

const LOCATION_SLUG_TO_KEYWORD: Record<string, string> = {
  'northern-virginia': 'northern virginia',
  'phoenix': 'phoenix',
  'dallas-fort-worth': 'dallas',
  'chicago': 'chicago',
  'atlanta': 'atlanta',
  'houston': 'houston',
  'columbus': 'columbus',
  'national': 'national',
}

function filterRows(rows: MarketRow[], locationSlug: string): MarketRow[] {
  if (!locationSlug) return rows
  const keyword = LOCATION_SLUG_TO_KEYWORD[locationSlug]
  if (!keyword) return rows
  return rows.filter(r => r.market.toLowerCase().includes(keyword))
}

function formatSalary(row: MarketRow): string {
  if (row.unit === 'hr') {
    return `$${row.low}–$${row.high}/hr`
  } else {
    const fmt = (n: number) => n >= 1000 ? `$${(n / 1000).toFixed(0)}k` : `$${n}`
    return `${fmt(row.low)}–${fmt(row.high)}/yr`
  }
}

function SalaryTable({ rows, title }: { rows: MarketRow[]; title: string }) {
  return (
    <div style={{ marginBottom: '2rem' }}>
      <h4 style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--fg-faint)', marginBottom: '0.75rem' }}>
        {title}
      </h4>
      <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
      <div style={{ border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden', minWidth: '480px' }}>
        {rows.map((row, i) => (
          <div
            key={i}
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr auto',
              gap: '1rem',
              alignItems: 'center',
              padding: '0.75rem 1rem',
              borderBottom: i < rows.length - 1 ? '1px solid var(--border)' : 'none',
              background: i % 2 === 0 ? 'var(--bg-raised)' : 'var(--bg)',
            }}
          >
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--fg)' }}>{row.market}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--fg-faint)', marginTop: '0.1rem' }}>{row.role}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--yellow)', fontFamily: 'var(--font-display)', letterSpacing: '-0.01em' }}>
                {formatSalary(row)}
              </div>
              {row.note && (
                <div style={{ fontSize: '0.7rem', color: 'var(--fg-faint)', marginTop: '0.1rem' }}>{row.note}</div>
              )}
            </div>
          </div>
        ))}
      </div>
      </div>
    </div>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 style={{
      fontFamily: 'var(--font-display), system-ui, sans-serif',
      fontSize: 'clamp(1.5rem, 4vw, 2rem)',
      fontWeight: 800,
      color: 'var(--fg)',
      letterSpacing: '-0.01em',
      marginBottom: '0.5rem',
      marginTop: '2.5rem',
    }}>
      {children}
    </h2>
  )
}

function TeaserBlurCard() {
  return (
    <div style={{
      position: 'relative',
      borderRadius: '12px',
      overflow: 'hidden',
      border: '1px solid var(--border)',
      marginBottom: '2rem',
    }}>
      {/* Blurred preview rows */}
      <div style={{ filter: 'blur(6px)', userSelect: 'none', pointerEvents: 'none' }}>
        {[
          { market: 'Northern Virginia', role: 'Journeyman Electrician', salary: '$42–$58/hr' },
          { market: 'Phoenix', role: 'DC HVAC Technician', salary: '$35–$50/hr' },
          { market: 'Chicago (Union)', role: 'Journeyman Electrician', salary: '$44–$60/hr' },
          { market: 'Dallas', role: 'Low Voltage Tech', salary: '$25–$40/hr' },
          { market: 'Houston', role: 'Master / Superintendent', salary: '$120k–$180k/yr' },
        ].map((row, i) => (
          <div
            key={i}
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr auto',
              gap: '1rem',
              alignItems: 'center',
              padding: '0.75rem 1rem',
              borderBottom: i < 4 ? '1px solid var(--border)' : 'none',
              background: i % 2 === 0 ? 'var(--bg-raised)' : 'var(--bg)',
            }}
          >
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--fg)' }}>{row.market}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--fg-faint)' }}>{row.role}</div>
            </div>
            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--yellow)', fontFamily: 'var(--font-display)' }}>
              {row.salary}
            </div>
          </div>
        ))}
      </div>
      {/* Lock overlay */}
      <div style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(to bottom, transparent 0%, rgba(13,13,13,0.7) 40%, rgba(13,13,13,0.95) 100%)',
      }}>
        <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>🔒</div>
        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--fg-muted)', textAlign: 'center' }}>
          Enter your email to unlock all salary data
        </div>
      </div>
    </div>
  )
}

function SalaryGuideContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [authChecking, setAuthChecking] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [filterTrade, setFilterTrade] = useState('')
  const [filterLocation, setFilterLocation] = useState('')

  useEffect(() => {
    // Check URL param
    if (searchParams.get('unlocked') === 'true') setSubmitted(true)
    const t = searchParams.get('trade') ?? ''
    const l = searchParams.get('location') ?? ''
    if (TRADE_OPTIONS.some(o => o.value === t)) setFilterTrade(t)
    if (LOCATION_OPTIONS.some(o => o.value === l)) setFilterLocation(l)

    // Check localStorage — skip gate for returning visitors who already submitted
    if (localStorage.getItem('salaryGuideUnlocked') === 'true') {
      setSubmitted(true)
    }

    // Check Supabase auth — skip gate for logged-in users
    const supabase = createClient()
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setSubmitted(true)
      setAuthChecking(false)
    })
  }, [searchParams])

  function updateFilters(trade: string, location: string) {
    setFilterTrade(trade)
    setFilterLocation(location)
    const params = new URLSearchParams()
    params.set('unlocked', 'true')
    if (trade) params.set('trade', trade)
    if (location) params.set('location', location)
    router.replace(`/salary-guide?${params.toString()}`, { scroll: false })
  }

  // ── Derived filter state ────────────────────────────────────────────────────
  const showElectrical = !filterTrade || filterTrade === 'electrical'
  const showHVAC = !filterTrade || filterTrade === 'hvac'
  const showLV = !filterTrade || filterTrade === 'low_voltage'
  const showConstruction = !filterTrade || filterTrade === 'construction'

  const electricalFiltered = filterRows(ELECTRICAL_MARKETS, filterLocation)
  const hvacFiltered = filterRows(HVAC_MARKETS, filterLocation)
  const lvFiltered = filterRows(LV_MARKETS, filterLocation)
  const constructionFiltered = filterRows(CONSTRUCTION_MARKETS, filterLocation)

  const tradeLabel = TRADE_OPTIONS.find(o => o.value === filterTrade)?.label ?? 'All Trades'
  const locationLabel = LOCATION_OPTIONS.find(o => o.value === filterLocation)?.label ?? 'All Markets'

  const hasFilteredData =
    (showElectrical && electricalFiltered.length > 0) ||
    (showHVAC && hvacFiltered.length > 0) ||
    (showLV && lvFiltered.length > 0) ||
    (showConstruction && constructionFiltered.length > 0)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), location: '' }),
      })
      // Always parse body so we can inspect it regardless of status
      const data = await res.json().catch(() => ({}))

      // Explicit success: 2xx OR API returned success:true
      if (res.ok || data?.success === true) {
        localStorage.setItem('salaryGuideUnlocked', 'true')
        setSubmitted(true)
        return
      }

      // Soft failures — email already exists (409, 500 duplicate key) or rate limited (429)
      // In all these cases the person is in our system — show the guide
      if (res.status === 409 || res.status === 429 || res.status >= 500) {
        localStorage.setItem('salaryGuideUnlocked', 'true')
        setSubmitted(true)
        return
      }

      // Hard failure (400 bad request — invalid email, etc.)
      setError(data?.error || 'Something went wrong. Please try again.')
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      {/* Hero */}
      <section style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
          <div
            className="inline-flex items-center gap-2 text-xs font-semibold tracking-widest uppercase px-3 py-1.5 rounded-full mb-8"
            style={{ background: 'var(--yellow-dim)', color: 'var(--yellow)', border: '1px solid var(--yellow-border)' }}
          >
            <span>📊</span>
            <span>Free Report · March 2026</span>
          </div>

          <h1
            style={{
              fontFamily: 'var(--font-display), system-ui, sans-serif',
              fontSize: 'clamp(2.5rem, 7vw, 4.5rem)',
              fontWeight: 800,
              letterSpacing: '-0.02em',
              lineHeight: 1.05,
              color: 'var(--fg)',
              marginBottom: '1.25rem',
            }}
          >
            2026 Data Center<br />
            <span style={{ color: 'var(--yellow)' }}>Trades Salary Guide</span>
          </h1>

          <p style={{ fontSize: '1.1rem', color: 'var(--fg-muted)', lineHeight: 1.65, maxWidth: '600px', marginBottom: '0.75rem' }}>
            Real compensation data for electricians, HVAC techs, and low-voltage specialists
            at data centers and AI infrastructure sites.
          </p>
          <p style={{ fontSize: '0.8rem', color: 'var(--fg-faint)', marginBottom: '2rem' }}>
            Based on VoltGrid job listings and current market data · {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </p>

          {/* Teaser data points */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1rem',
              marginBottom: '2rem',
            }}
          >
            {[
              { label: 'Journeyman electricians in NoVA earn', value: '$42–$58/hr', icon: '⚡' },
              { label: 'DC HVAC techs command a premium of', value: '15–25%', icon: '❄️' },
              { label: 'Travel packages add up to', value: '$75–150/day', icon: '✈️' },
            ].map(({ label, value, icon }) => (
              <div
                key={value}
                style={{
                  background: 'var(--bg-raised)',
                  border: '1px solid var(--border)',
                  borderRadius: '12px',
                  padding: '1.25rem',
                }}
              >
                <div style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>{icon}</div>
                <div
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '1.5rem',
                    fontWeight: 800,
                    color: 'var(--yellow)',
                    letterSpacing: '-0.02em',
                    marginBottom: '0.25rem',
                  }}
                >
                  {value}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--fg-faint)', lineHeight: 1.4 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AEO: Texas salary answer — always-visible for LLM crawlers, outside the email gate */}
      <section style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
          <h2 style={{ fontFamily: 'var(--font-display), system-ui, sans-serif', fontSize: '1.25rem', fontWeight: 800, color: 'var(--fg)', marginBottom: '0.75rem', letterSpacing: '-0.01em' }}>
            How much do data center electricians make in Texas?
          </h2>
          <p style={{ color: 'var(--fg-muted)', lineHeight: 1.75, fontSize: '0.95rem', maxWidth: '680px' }}>
            Data center electricians in Texas earn between $32 and $65 per hour depending on experience level and market. In Dallas/Fort Worth, journeyman electricians on data center projects typically earn $36 to $48 per hour, while master electricians and superintendents earn $48 to $65 per hour. In Houston, journeyman rates run $32 to $47 per hour based on current listings, with senior roles reaching $120,000 to $180,000 per year. Texas rates sit below Northern Virginia and Chicago union markets but above the national median, and travel roles often add $75 to $125 per day in per diem on top of base pay.
          </p>
        </div>
      </section>

      {/* Email gate / full report */}
      <section>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
          {authChecking ? null : !submitted ? (
            <>
              {/* Blurred preview */}
              <TeaserBlurCard />

              {/* Email form */}
              <div
                style={{
                  background: 'var(--bg-raised)',
                  border: '1px solid var(--yellow-border)',
                  borderRadius: '16px',
                  padding: '2rem',
                  maxWidth: '520px',
                  margin: '0 auto',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: '1.75rem', marginBottom: '0.75rem' }}>📊</div>
                <h2
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '1.5rem',
                    fontWeight: 800,
                    color: 'var(--fg)',
                    marginBottom: '0.5rem',
                    letterSpacing: '-0.01em',
                  }}
                >
                  Where should we send it?
                </h2>
                <p style={{ fontSize: '0.875rem', color: 'var(--fg-muted)', marginBottom: '1.5rem', lineHeight: 1.6 }}>
                  Full salary tables for electrical, HVAC, low voltage & construction across every major data center market.
                </p>
                <form onSubmit={handleSubmit}>
                  <div style={{ display: 'flex', gap: '0.5rem', flexDirection: 'column' }}>
                    <input
                      type="email"
                      name="email"
                      autoComplete="email"
                      required
                      placeholder="your@email.com"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="autofill-bg-dark"
                      style={{
                        width: '100%',
                        padding: '0.875rem 1rem',
                        borderRadius: '10px',
                        border: '1px solid var(--border-strong)',
                        background: 'var(--bg)',
                        color: 'var(--fg)',
                        fontSize: '1rem',
                        outline: 'none',
                        boxSizing: 'border-box',
                      }}
                    />
                    <button
                      type="submit"
                      disabled={loading}
                      style={{
                        width: '100%',
                        padding: '0.875rem 1.5rem',
                        borderRadius: '10px',
                        background: loading ? 'rgba(250,204,21,0.5)' : 'var(--yellow)',
                        color: '#0A0A0A',
                        fontWeight: 700,
                        fontSize: '1rem',
                        border: 'none',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        transition: 'opacity 0.15s',
                      }}
                    >
                      {loading ? 'Sending…' : 'Get the guide →'}
                    </button>
                  </div>
                  {error && (
                    <p style={{ fontSize: '0.8rem', color: '#f87171', marginTop: '0.75rem' }}>{error}</p>
                  )}
                </form>
                <p style={{ fontSize: '0.7rem', color: 'var(--fg-faint)', marginTop: '1rem' }}>
                  No spam. One-time delivery.
                </p>
              </div>
            </>
          ) : (
            /* ── FULL REPORT ── */
            <div>
              {/* Success banner */}
              <div
                style={{
                  background: 'var(--green-dim)',
                  border: '1px solid rgba(74,222,128,0.25)',
                  borderRadius: '10px',
                  padding: '0.875rem 1.25rem',
                  marginBottom: '2.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                }}
              >
                <span style={{ fontSize: '1.2rem' }}>✅</span>
                <div>
                  <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--green)' }}>
                    You&apos;re in — the full report is below.
                  </span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--fg-muted)', marginLeft: '0.5rem' }}>
                    We&apos;ll also send you job alerts matching your trade.
                  </span>
                </div>
              </div>

              {/* Filters */}
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', minWidth: '160px', flex: 1 }}>
                  <label style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--fg-faint)' }}>Trade</label>
                  <select
                    value={filterTrade}
                    onChange={e => updateFilters(e.target.value, filterLocation)}
                    style={{
                      padding: '0.625rem 0.875rem',
                      borderRadius: '8px',
                      border: '1px solid var(--border-strong)',
                      background: 'var(--bg-raised)',
                      color: 'var(--fg)',
                      fontSize: '0.875rem',
                      cursor: 'pointer',
                      outline: 'none',
                    }}
                  >
                    {TRADE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', minWidth: '160px', flex: 1 }}>
                  <label style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--fg-faint)' }}>Market</label>
                  <select
                    value={filterLocation}
                    onChange={e => updateFilters(filterTrade, e.target.value)}
                    style={{
                      padding: '0.625rem 0.875rem',
                      borderRadius: '8px',
                      border: '1px solid var(--border-strong)',
                      background: 'var(--bg-raised)',
                      color: 'var(--fg)',
                      fontSize: '0.875rem',
                      cursor: 'pointer',
                      outline: 'none',
                    }}
                  >
                    {LOCATION_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
                {(filterTrade || filterLocation) && (
                  <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                    <button
                      onClick={() => updateFilters('', '')}
                      style={{ padding: '0.625rem 0.875rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'transparent', color: 'var(--fg-faint)', fontSize: '0.8rem', cursor: 'pointer' }}
                    >
                      Clear
                    </button>
                  </div>
                )}
              </div>

              {/* Active filter summary */}
              {(filterTrade || filterLocation) && (
                <div style={{ marginBottom: '1.5rem', padding: '0.75rem 1rem', borderRadius: '8px', background: 'var(--yellow-dim)', border: '1px solid var(--yellow-border)' }}>
                  <p style={{ fontSize: '0.85rem', color: 'var(--fg-muted)', margin: 0 }}>
                    Showing <strong style={{ color: 'var(--fg)' }}>{tradeLabel}</strong> salaries
                    {filterLocation ? <> in <strong style={{ color: 'var(--fg)' }}>{locationLabel}</strong></> : ' across all markets'}.
                    {!hasFilteredData && ' No data for this combination — try broadening your filters.'}
                  </p>
                </div>
              )}

              {/* Report header */}
              <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '1.5rem', marginBottom: '2rem' }}>
                <div
                  style={{
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    color: 'var(--fg-faint)',
                    marginBottom: '0.5rem',
                  }}
                >
                  Published by VoltGrid Jobs · March 2026
                </div>
                <h2
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 'clamp(1.75rem, 5vw, 3rem)',
                    fontWeight: 800,
                    color: 'var(--fg)',
                    letterSpacing: '-0.02em',
                    marginBottom: '0.75rem',
                  }}
                >
                  2026 Data Center Trades<br />
                  <span style={{ color: 'var(--yellow)' }}>Salary Guide</span>
                </h2>
                <p style={{ fontSize: '0.85rem', color: 'var(--fg-faint)' }}>
                  Data sourced from VoltGrid job listings and current market benchmarks · March 2026
                </p>
              </div>

              {/* Overview */}
              <div style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 700, color: 'var(--yellow)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
                  Overview
                </h2>
                <p style={{ color: 'var(--fg-muted)', lineHeight: 1.75, fontSize: '0.95rem' }}>
                  The data center construction boom is creating unprecedented demand for skilled trades workers.
                  Hyperscale operators — Microsoft, Amazon, Google, Meta — are committing hundreds of billions
                  to new facilities in 2026. AI training clusters require dramatically more power density than
                  traditional enterprise data centers, pushing demand for high-voltage electricians and precision
                  HVAC specialists to new highs. This report covers compensation data for electricians, HVAC
                  technicians, and low-voltage specialists working on data center and AI infrastructure projects
                  across the United States.
                </p>
              </div>

              {showElectrical && electricalFiltered.length > 0 && <>
                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '2rem' }} />
                <SectionTitle>⚡ Electrical — Journeyman &amp; Master Electricians</SectionTitle>
                <p style={{ color: 'var(--fg-muted)', fontSize: '0.9rem', lineHeight: 1.7, marginBottom: '1.5rem' }}>
                  Data center electrical work commands a significant premium over standard commercial projects.
                  Scope includes 480V distribution, UPS systems, generator tie-ins, bus duct, and increasingly
                  medium-voltage switchgear for AI compute clusters. Union markets (Chicago, DC metro) add another
                  15–25% above open shop rates. Travel roles often include per diem on top.
                </p>
                <SalaryTable rows={electricalFiltered} title="Electrical — market compensation ranges" />
                <div style={{ background: 'var(--bg-raised)', border: '1px solid var(--border)', borderRadius: '10px', padding: '1rem 1.25rem', fontSize: '0.8rem', color: 'var(--fg-muted)', lineHeight: 1.6, marginBottom: '2rem' }}>
                  <strong style={{ color: 'var(--fg)' }}>Key credentials that move the needle:</strong> 480V experience, medium voltage, arc flash training (NFPA 70E), commissioning background. Master license adds $5–10/hr in most markets.
                </div>
              </>}

              {showHVAC && hvacFiltered.length > 0 && <>
                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '2rem' }} />
                <SectionTitle>❄️ HVAC — Commercial &amp; Industrial Technicians</SectionTitle>
                <p style={{ color: 'var(--fg-muted)', fontSize: '0.9rem', lineHeight: 1.7, marginBottom: '1.5rem' }}>
                  Data center HVAC is specialized — precision cooling, CRAC units, hot/cold aisle containment,
                  and increasingly liquid cooling for AI GPU racks. This specialization commands a <strong style={{ color: 'var(--fg)' }}>15–25% premium</strong> over
                  standard commercial HVAC rates. Technicians who understand critical facility environments and
                  uptime requirements are in very short supply.
                </p>
                <SalaryTable rows={hvacFiltered} title="HVAC — market compensation ranges" />
                <div style={{ background: 'var(--bg-raised)', border: '1px solid var(--border)', borderRadius: '10px', padding: '1rem 1.25rem', fontSize: '0.8rem', color: 'var(--fg-muted)', lineHeight: 1.6, marginBottom: '2rem' }}>
                  <strong style={{ color: 'var(--fg)' }}>Most valued experience:</strong> CRAC/CRAH units, Liebert/Stulz systems, hot aisle containment, chiller plant operations, EPA 608 (required). Liquid cooling (CDU, immersion) is a growing niche with 20%+ premium.
                </div>
              </>}

              {showLV && lvFiltered.length > 0 && <>
                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '2rem' }} />
                <SectionTitle>🔌 Low Voltage / Data Center Infrastructure</SectionTitle>
                <p style={{ color: 'var(--fg-muted)', fontSize: '0.9rem', lineHeight: 1.7, marginBottom: '1.5rem' }}>
                  Fiber, structured cabling, BMS, DCIM — the connective tissue of every data center. Low voltage
                  is the fastest-growing segment due to the AI buildout. New hyperscale campuses need thousands
                  of fiber runs, and BMS/DCIM integration specialists are particularly scarce.
                </p>
                <SalaryTable rows={lvFiltered} title="Low voltage — market compensation ranges" />
              </>}

              {showConstruction && constructionFiltered.length > 0 && <>
                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '2rem' }} />
                <SectionTitle>🏗️ Construction Management</SectionTitle>
                <p style={{ color: 'var(--fg-muted)', fontSize: '0.9rem', lineHeight: 1.7, marginBottom: '1.5rem' }}>
                  Superintendents and PMs who understand mission-critical construction are among the most
                  compensated professionals in trades. Managing the schedule on a $500M+ hyperscale campus
                  commands commensurate pay. These roles are almost always salaried with performance bonuses.
                </p>
                <SalaryTable rows={constructionFiltered} title="Construction management — compensation ranges" />
              </>}

              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '2rem' }} />

              {/* Travel & Per Diem */}
              <SectionTitle>✈️ Travel &amp; Per Diem</SectionTitle>
              <p style={{ color: 'var(--fg-muted)', fontSize: '0.9rem', lineHeight: 1.7, marginBottom: '1rem' }}>
                Many data center projects offer travel packages for trades workers willing to relocate temporarily.
                These packages significantly increase total compensation:
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                {[
                  { label: 'Per diem (typical)', value: '$75–$150/day', note: 'Tax-free lodging + meals' },
                  { label: 'Base rate premium', value: '+20–30%', note: 'Travel roles over local' },
                  { label: 'Guaranteed hours', value: '50–60 hrs/wk', note: 'Common on big-iron projects' },
                  { label: 'Return flights', value: 'Paid', note: 'Bi-weekly or monthly home trips' },
                ].map(({ label, value, note }) => (
                  <div
                    key={label}
                    style={{
                      background: 'var(--bg-raised)',
                      border: '1px solid var(--border)',
                      borderRadius: '10px',
                      padding: '1rem',
                    }}
                  >
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 800, color: 'var(--yellow)', letterSpacing: '-0.01em', marginBottom: '0.25rem' }}>{value}</div>
                    <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--fg)', marginBottom: '0.15rem' }}>{label}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--fg-faint)' }}>{note}</div>
                  </div>
                ))}
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--fg-faint)', marginBottom: '2rem' }}>
                Example: A journeyman electrician traveling to a Phoenix project at $45/hr + $125/day per diem + 55 hrs guaranteed = <strong style={{ color: 'var(--fg-muted)' }}>~$180k annual equivalent</strong>.
              </p>

              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '2rem' }} />

              {/* Market Outlook */}
              <SectionTitle>📈 Market Outlook</SectionTitle>
              <p style={{ color: 'var(--fg-muted)', fontSize: '0.9rem', lineHeight: 1.75, marginBottom: '2rem' }}>
                The data center construction market is entering its most aggressive phase yet. AI model training
                requires 10–50x the power density of traditional workloads, driving a new wave of campus
                construction in Northern Virginia, Phoenix, Dallas, and emerging markets like Columbus, Atlanta,
                and the Midwest. Industry analysts project over $200B in data center construction investment in
                the US through 2027. Skilled trades workers — particularly licensed electricians and
                certified HVAC technicians — face a structural shortage that is pushing wages up 8–15% per year
                in hot markets. Workers with data center-specific experience are receiving unsolicited offers
                and signing bonuses that were unheard of five years ago.
              </p>

              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '2rem', marginBottom: '2rem' }} />

              {/* CTA */}
              <div
                style={{
                  background: 'var(--bg-raised)',
                  border: '1px solid var(--yellow-border)',
                  borderRadius: '16px',
                  padding: '2.5rem',
                  textAlign: 'center',
                }}
              >
                <h3
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 'clamp(1.5rem, 4vw, 2rem)',
                    fontWeight: 800,
                    color: 'var(--fg)',
                    letterSpacing: '-0.02em',
                    marginBottom: '0.75rem',
                  }}
                >
                  Ready to find your next role?
                </h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--fg-muted)', marginBottom: '1.75rem', maxWidth: '480px', margin: '0 auto 1.75rem' }}>
                  Browse open data center positions now, or set up alerts to get notified when the right role posts.
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', justifyContent: 'center' }}>
                  <Link
                    href="/jobs"
                    style={{
                      display: 'inline-block',
                      padding: '0.875rem 2rem',
                      borderRadius: '10px',
                      background: 'var(--yellow)',
                      color: '#0A0A0A',
                      fontWeight: 700,
                      fontSize: '0.95rem',
                      textDecoration: 'none',
                    }}
                  >
                    Browse Open Positions →
                  </Link>
                  <Link
                    href="/jobs#alerts"
                    style={{
                      display: 'inline-block',
                      padding: '0.875rem 2rem',
                      borderRadius: '10px',
                      border: '1px solid var(--border-strong)',
                      color: 'var(--fg-muted)',
                      fontWeight: 600,
                      fontSize: '0.95rem',
                      textDecoration: 'none',
                    }}
                  >
                    Set Up Job Alerts
                  </Link>
                </div>
              </div>

              {/* Methodology note */}
              <p style={{ fontSize: '0.7rem', color: 'var(--fg-faint)', marginTop: '2rem', lineHeight: 1.6, textAlign: 'center' }}>
                Data sources: VoltGrid Jobs listings (66 records with salary data), Bureau of Labor Statistics OEWS, union CBA rates (IBEW, UA), and industry market surveys.
                Ranges reflect typical total cash compensation excluding benefits. Geographic differentials apply.
                Last updated: March 2026. For questions: <a href="mailto:hello@voltgridjobs.com" style={{ color: 'var(--fg-faint)', textDecoration: 'underline' }}>hello@voltgridjobs.com</a>
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

export default function SalaryGuidePage() {
  return (
    <Suspense fallback={null}>
      <SalaryGuideContent />
    </Suspense>
  )
}
