'use client'

import { useState } from 'react'
import Link from 'next/link'

type Trade = 'electrical' | 'hvac' | 'low_voltage' | 'construction' | 'project_management' | 'operations'

const TRADE_OPTIONS: { value: Trade; label: string }[] = [
  { value: 'electrical', label: 'Electrician' },
  { value: 'hvac', label: 'HVAC Tech' },
  { value: 'low_voltage', label: 'Low Voltage Tech' },
  { value: 'construction', label: 'Construction Trades' },
  { value: 'project_management', label: 'Project Manager' },
  { value: 'operations', label: 'Data Center Operator' },
]

type AnalysisResult = {
  foundKeywords: string[]
  missingKeywords: string[]
  score: number
  suggestions: string[]
}

function ScoreRing({ score }: { score: number }) {
  const radius = 36
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference
  const color = score >= 70 ? 'var(--green, #4ade80)' : score >= 40 ? 'var(--yellow, #facc15)' : '#f87171'

  return (
    <div style={{ position: 'relative', width: 96, height: 96 }}>
      <svg width="96" height="96" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx="48" cy="48" r={radius} fill="none" stroke="var(--border, #333)" strokeWidth="8" />
        <circle
          cx="48" cy="48" r={radius} fill="none"
          stroke={color} strokeWidth="8"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.6s ease' }}
        />
      </svg>
      <div style={{
        position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
      }}>
        <span style={{ fontSize: '1.5rem', fontWeight: 800, color, lineHeight: 1 }}>{score}</span>
        <span style={{ fontSize: '0.65rem', color: 'var(--fg-faint, #666)', marginTop: 2 }}>/ 100</span>
      </div>
    </div>
  )
}

function scoreLabel(score: number): string {
  if (score >= 80) return 'Strong match'
  if (score >= 60) return 'Good — a few gaps'
  if (score >= 40) return 'Needs work'
  return 'Low match'
}

export default function ResumeAnalyzerPage() {
  const [trade, setTrade] = useState<Trade>('electrical')
  const [resumeText, setResumeText] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleAnalyze() {
    if (resumeText.trim().length < 50) {
      setError('Paste at least 50 characters of your resume text.')
      return
    }
    setError(null)
    setLoading(true)
    setResult(null)

    try {
      const res = await fetch('/api/resume-analyzer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeText, trade }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Something went wrong')
      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen">
      {/* Breadcrumb */}
      <nav className="max-w-3xl mx-auto px-4 pt-6 pb-2">
        <ol className="flex items-center gap-2 text-sm" style={{ color: 'var(--fg-faint)' }}>
          <li><Link href="/" style={{ color: 'var(--fg-faint)' }} className="hover:text-yellow-400 transition-colors hover:opacity-80">Home</Link></li>
          <li>/</li>
          <li style={{ color: 'var(--fg-muted)' }}>Resume Analyzer</li>
        </ol>
      </nav>

      {/* Hero */}
      <section className="py-10 px-4" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="max-w-3xl mx-auto">
          <h1
            className="mb-3 leading-tight"
            style={{
              fontFamily: 'var(--font-display), system-ui, sans-serif',
              fontSize: 'clamp(1.75rem, 5vw, 2.5rem)',
              fontWeight: 800,
              color: 'var(--fg)',
              letterSpacing: '-0.01em',
            }}
          >
            Data Center Resume Analyzer
          </h1>
          <p className="text-base" style={{ color: 'var(--fg-muted)', lineHeight: 1.6, maxWidth: '560px' }}>
            Paste your resume and see which data center keywords recruiters are scanning for — and which ones you&apos;re missing.
            Free, instant, no login.
          </p>
        </div>
      </section>

      {/* Form */}
      <section className="max-w-3xl mx-auto px-4 py-10">
        <div className="space-y-5">
          {/* Trade select */}
          <div>
            <label
              htmlFor="trade-select"
              className="block text-sm font-semibold mb-2"
              style={{ color: 'var(--fg-muted)' }}
            >
              Your trade
            </label>
            <select
              id="trade-select"
              value={trade}
              onChange={e => setTrade(e.target.value as Trade)}
              className="w-full sm:w-64 rounded-lg px-3 py-2 text-sm font-medium"
              style={{
                background: 'var(--bg-raised)',
                border: '1px solid var(--border)',
                color: 'var(--fg)',
                outline: 'none',
              }}
            >
              {TRADE_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {/* Resume textarea */}
          <div>
            <label
              htmlFor="resume-text"
              className="block text-sm font-semibold mb-2"
              style={{ color: 'var(--fg-muted)' }}
            >
              Paste your resume text
            </label>
            <textarea
              id="resume-text"
              value={resumeText}
              onChange={e => setResumeText(e.target.value)}
              placeholder="Paste the full text of your resume here — work history, skills, certifications, education..."
              rows={12}
              className="w-full rounded-lg px-4 py-3 text-sm leading-relaxed resize-y"
              style={{
                background: 'var(--bg-raised)',
                border: '1px solid var(--border)',
                color: 'var(--fg)',
                outline: 'none',
                fontFamily: 'inherit',
              }}
            />
            <p className="text-xs mt-1" style={{ color: 'var(--fg-faint)' }}>
              Plain text only — formatting doesn&apos;t affect the results
            </p>
          </div>

          {/* Error */}
          {error && (
            <p className="text-sm" style={{ color: '#f87171' }}>{error}</p>
          )}

          {/* Analyze button */}
          <button
            onClick={handleAnalyze}
            disabled={loading}
            className="font-bold px-7 py-3 rounded-xl transition-opacity hover:opacity-90"
            style={{
              background: loading ? 'var(--border)' : 'var(--yellow)',
              color: loading ? 'var(--fg-faint)' : '#0A0A0A',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? 'Analyzing…' : 'Analyze Resume'}
          </button>
        </div>

        {/* Results */}
        {result && (
          <div className="mt-10 space-y-8">
            {/* Score */}
            <div
              className="rounded-2xl p-6 flex items-center gap-6"
              style={{ background: 'var(--bg-raised)', border: '1px solid var(--border)' }}
            >
              <ScoreRing score={result.score} />
              <div>
                <p
                  className="text-lg font-bold leading-tight"
                  style={{ color: 'var(--fg)' }}
                >
                  {scoreLabel(result.score)}
                </p>
                <p className="text-sm mt-1" style={{ color: 'var(--fg-muted)' }}>
                  {result.foundKeywords.length} of {result.foundKeywords.length + result.missingKeywords.length} data center keywords found
                </p>
                <p className="text-xs mt-1" style={{ color: 'var(--fg-faint)' }}>
                  Score reflects keyword coverage across foundational skills + DC-specific terms
                </p>
              </div>
            </div>

            {/* Suggestions */}
            {result.suggestions.length > 0 && (
              <div>
                <h2 className="text-base font-bold mb-3" style={{ color: 'var(--fg)' }}>
                  Top improvements
                </h2>
                <ul className="space-y-3">
                  {result.suggestions.map((s, i) => (
                    <li
                      key={i}
                      className="flex gap-3 rounded-xl px-4 py-3 text-sm leading-relaxed"
                      style={{
                        background: 'var(--bg-raised)',
                        border: '1px solid var(--border)',
                        color: 'var(--fg-muted)',
                      }}
                    >
                      <span style={{ color: 'var(--yellow)', fontWeight: 700, flexShrink: 0 }}>→</span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Keywords grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Found */}
              <div
                className="rounded-2xl p-5"
                style={{ background: 'var(--bg-raised)', border: '1px solid var(--border)' }}
              >
                <h2 className="text-sm font-bold mb-3" style={{ color: 'var(--green, #4ade80)' }}>
                  Found ({result.foundKeywords.length})
                </h2>
                {result.foundKeywords.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {result.foundKeywords.map(kw => (
                      <span
                        key={kw}
                        className="text-xs px-2 py-1 rounded-md font-medium"
                        style={{
                          background: 'rgba(74, 222, 128, 0.1)',
                          color: 'var(--green, #4ade80)',
                          border: '1px solid rgba(74, 222, 128, 0.2)',
                        }}
                      >
                        {kw}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs" style={{ color: 'var(--fg-faint)' }}>None detected</p>
                )}
              </div>

              {/* Missing */}
              <div
                className="rounded-2xl p-5"
                style={{ background: 'var(--bg-raised)', border: '1px solid var(--border)' }}
              >
                <h2 className="text-sm font-bold mb-3" style={{ color: '#f87171' }}>
                  Missing ({result.missingKeywords.length})
                </h2>
                {result.missingKeywords.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {result.missingKeywords.map(kw => (
                      <span
                        key={kw}
                        className="text-xs px-2 py-1 rounded-md font-medium"
                        style={{
                          background: 'rgba(248, 113, 113, 0.1)',
                          color: '#f87171',
                          border: '1px solid rgba(248, 113, 113, 0.2)',
                        }}
                      >
                        {kw}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs" style={{ color: 'var(--fg-faint)' }}>None — great coverage!</p>
                )}
              </div>
            </div>

            {/* CTA */}
            <div
              className="rounded-2xl px-6 py-5 text-center"
              style={{ background: 'var(--bg-raised)', border: '1px solid var(--border)' }}
            >
              <p className="text-sm font-semibold mb-1" style={{ color: 'var(--fg)' }}>
                Ready to apply?
              </p>
              <p className="text-xs mb-4" style={{ color: 'var(--fg-faint)' }}>
                Browse open data center jobs that match your trade.
              </p>
              <Link
                href={`/jobs?category=${trade}`}
                className="inline-block font-bold px-6 py-2.5 rounded-xl text-sm transition-colors hover:opacity-80"
                style={{ background: 'var(--yellow)', color: '#0A0A0A' }}
              >
                Browse {TRADE_OPTIONS.find(o => o.value === trade)?.label} Jobs →
              </Link>
            </div>
          </div>
        )}
      </section>
    </main>
  )
}
