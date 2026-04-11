'use client'

import { useState } from 'react'

// ─────────────────────────────────────────────────────────────────────
// Offer Comparison Worksheet
// Lets a trades worker enter two competing offers side by side and
// see the total effective annual compensation on each. Handles base
// hourly, guaranteed hours, OT multiplier, per diem (with days-off
// option), travel pay, shift differential, completion bonus, project
// duration.
// ─────────────────────────────────────────────────────────────────────

interface Offer {
  label: string
  baseRate: number
  hoursPerWeek: number
  otMultiplier: number
  otHoursPerWeek: number
  perDiem: number
  perDiemAllDays: boolean
  travelPerWeek: number
  shiftDiffPct: number
  completionBonus: number
  projectWeeks: number
}

const defaultOffer = (label: string): Offer => ({
  label,
  baseRate: 0,
  hoursPerWeek: 40,
  otMultiplier: 1.5,
  otHoursPerWeek: 0,
  perDiem: 0,
  perDiemAllDays: true,
  travelPerWeek: 0,
  shiftDiffPct: 0,
  completionBonus: 0,
  projectWeeks: 12,
})

function calcTotals(o: Offer) {
  const straightHours = Math.min(o.hoursPerWeek, 40)
  const otHours = Math.max(0, o.otHoursPerWeek)
  const withShiftDiff = o.baseRate * (1 + o.shiftDiffPct / 100)

  const straightWeekly = straightHours * withShiftDiff
  const otWeekly = otHours * withShiftDiff * o.otMultiplier
  const travelWeekly = o.travelPerWeek
  const perDiemDays = o.perDiemAllDays ? 7 : 5
  const perDiemWeekly = o.perDiem * perDiemDays

  const weeklyGross = straightWeekly + otWeekly + travelWeekly + perDiemWeekly
  const projectGross = weeklyGross * o.projectWeeks + o.completionBonus
  const effectiveAnnualized = weeklyGross * 52 + o.completionBonus
  const effectiveHourly =
    o.hoursPerWeek + otHours > 0
      ? weeklyGross / (straightHours + otHours)
      : 0

  return {
    weeklyGross,
    projectGross,
    effectiveAnnualized,
    effectiveHourly,
    perDiemWeekly,
    straightWeekly,
    otWeekly,
  }
}

function fmt$(n: number) {
  if (n === 0) return '$0'
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`
  if (n >= 10_000) return `$${(n / 1000).toFixed(0)}k`
  return `$${Math.round(n).toLocaleString()}`
}

export function OfferComparisonWorksheet() {
  const [offerA, setOfferA] = useState<Offer>({ ...defaultOffer('Offer A') })
  const [offerB, setOfferB] = useState<Offer>({ ...defaultOffer('Offer B') })

  const totalsA = calcTotals(offerA)
  const totalsB = calcTotals(offerB)

  const better =
    totalsA.projectGross === totalsB.projectGross
      ? null
      : totalsA.projectGross > totalsB.projectGross
        ? 'A'
        : 'B'

  const diff = Math.abs(totalsA.projectGross - totalsB.projectGross)

  function updateA<K extends keyof Offer>(key: K, value: Offer[K]) {
    setOfferA({ ...offerA, [key]: value })
  }
  function updateB<K extends keyof Offer>(key: K, value: Offer[K]) {
    setOfferB({ ...offerB, [key]: value })
  }

  function reset() {
    setOfferA({ ...defaultOffer('Offer A') })
    setOfferB({ ...defaultOffer('Offer B') })
  }

  return (
    <div
      style={{
        background: 'var(--bg-raised)',
        border: '1px solid var(--border)',
        borderRadius: '16px',
        padding: 'clamp(1.25rem, 4vw, 2rem)',
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '1.25rem',
          marginBottom: '1.5rem',
        }}
      >
        <OfferCard offer={offerA} update={updateA} totals={totalsA} accent={better === 'A'} />
        <OfferCard offer={offerB} update={updateB} totals={totalsB} accent={better === 'B'} />
      </div>

      {/* Verdict */}
      <div
        style={{
          background: better === null ? 'var(--bg)' : 'var(--yellow-dim)',
          border: `1px solid ${better === null ? 'var(--border)' : 'var(--yellow-border)'}`,
          borderRadius: '12px',
          padding: '1rem 1.25rem',
          marginBottom: '1rem',
        }}
      >
        {offerA.baseRate === 0 && offerB.baseRate === 0 ? (
          <p style={{ fontSize: '0.85rem', color: 'var(--fg-faint)', margin: 0 }}>
            Enter numbers above to see which offer is actually better over the full project.
          </p>
        ) : better === null ? (
          <p style={{ fontSize: '0.9rem', color: 'var(--fg-muted)', margin: 0 }}>
            These two offers are worth the same total.
          </p>
        ) : (
          <p style={{ fontSize: '0.95rem', color: 'var(--fg)', margin: 0, lineHeight: 1.6 }}>
            <strong style={{ color: 'var(--yellow)' }}>Offer {better} is worth {fmt$(diff)} more</strong>{' '}
            over the full project — that is the real number to compare, not the base rate.
          </p>
        )}
      </div>

      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
        <button
          onClick={reset}
          style={{
            padding: '0.55rem 1rem',
            borderRadius: '8px',
            border: '1px solid var(--border)',
            background: 'transparent',
            color: 'var(--fg-faint)',
            fontSize: '0.8rem',
            cursor: 'pointer',
          }}
        >
          Reset worksheet
        </button>
        <button
          onClick={() => window.print()}
          style={{
            padding: '0.55rem 1rem',
            borderRadius: '8px',
            border: '1px solid var(--border)',
            background: 'transparent',
            color: 'var(--fg-faint)',
            fontSize: '0.8rem',
            cursor: 'pointer',
          }}
        >
          Print / save as PDF
        </button>
      </div>
    </div>
  )
}

// ── Offer card ───────────────────────────────────────────────────────

function OfferCard({
  offer,
  update,
  totals,
  accent,
}: {
  offer: Offer
  update: <K extends keyof Offer>(key: K, value: Offer[K]) => void
  totals: ReturnType<typeof calcTotals>
  accent: boolean
}) {
  return (
    <div
      style={{
        background: 'var(--bg)',
        border: `1px solid ${accent ? 'var(--yellow-border)' : 'var(--border)'}`,
        borderRadius: '12px',
        padding: '1.25rem',
      }}
    >
      <label style={{ display: 'block', marginBottom: '1rem' }}>
        <div style={labelStyle}>Label</div>
        <input
          type="text"
          value={offer.label}
          onChange={(e) => update('label', e.target.value)}
          style={inputStyle}
        />
      </label>

      <NumberRow label="Base hourly rate ($/hr)" value={offer.baseRate} onChange={(v) => update('baseRate', v)} step={0.5} />
      <NumberRow label="Hours per week" value={offer.hoursPerWeek} onChange={(v) => update('hoursPerWeek', v)} step={1} />
      <NumberRow label="OT hours per week (>40)" value={offer.otHoursPerWeek} onChange={(v) => update('otHoursPerWeek', v)} step={1} />
      <NumberRow label="OT multiplier (1.5, 2.0)" value={offer.otMultiplier} onChange={(v) => update('otMultiplier', v)} step={0.25} />
      <NumberRow label="Shift differential (%)" value={offer.shiftDiffPct} onChange={(v) => update('shiftDiffPct', v)} step={1} />
      <NumberRow label="Per diem ($/day)" value={offer.perDiem} onChange={(v) => update('perDiem', v)} step={5} />

      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0.25rem 0 0.75rem', fontSize: '0.8rem', color: 'var(--fg-muted)' }}>
        <input
          type="checkbox"
          checked={offer.perDiemAllDays}
          onChange={(e) => update('perDiemAllDays', e.target.checked)}
        />
        Per diem paid 7 days/week (not just workdays)
      </label>

      <NumberRow label="Travel stipend ($/week)" value={offer.travelPerWeek} onChange={(v) => update('travelPerWeek', v)} step={25} />
      <NumberRow label="Completion bonus ($)" value={offer.completionBonus} onChange={(v) => update('completionBonus', v)} step={500} />
      <NumberRow label="Project duration (weeks)" value={offer.projectWeeks} onChange={(v) => update('projectWeeks', v)} step={1} />

      <div
        style={{
          marginTop: '1rem',
          paddingTop: '1rem',
          borderTop: '1px solid var(--border)',
          display: 'grid',
          gap: '0.4rem',
        }}
      >
        <TotalRow label="Weekly gross" value={fmt$(totals.weeklyGross)} />
        <TotalRow label="Project total" value={fmt$(totals.projectGross)} highlight={accent} />
        <TotalRow label="Annualized" value={fmt$(totals.effectiveAnnualized)} />
        <TotalRow
          label="Effective $/hr"
          value={totals.effectiveHourly > 0 ? `$${totals.effectiveHourly.toFixed(2)}` : '$0'}
        />
      </div>
    </div>
  )
}

// ── small helpers ────────────────────────────────────────────────────

function NumberRow({
  label,
  value,
  onChange,
  step,
}: {
  label: string
  value: number
  onChange: (v: number) => void
  step: number
}) {
  return (
    <label style={{ display: 'block', marginBottom: '0.6rem' }}>
      <div style={labelStyle}>{label}</div>
      <input
        type="number"
        value={value === 0 ? '' : value}
        placeholder="0"
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        step={step}
        min={0}
        style={inputStyle}
      />
    </label>
  )
}

function TotalRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
      <span style={{ fontSize: '0.75rem', color: 'var(--fg-faint)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {label}
      </span>
      <span
        style={{
          fontFamily: 'var(--font-display), system-ui, sans-serif',
          fontSize: highlight ? '1.15rem' : '0.95rem',
          fontWeight: 800,
          color: highlight ? 'var(--yellow)' : 'var(--fg)',
        }}
      >
        {value}
      </span>
    </div>
  )
}

const labelStyle: React.CSSProperties = {
  fontSize: '0.7rem',
  fontWeight: 700,
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
  color: 'var(--fg-faint)',
  marginBottom: '0.25rem',
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.55rem 0.75rem',
  borderRadius: '8px',
  border: '1px solid var(--border-strong)',
  background: 'var(--bg-raised)',
  color: 'var(--fg)',
  fontSize: '0.9rem',
  outline: 'none',
  boxSizing: 'border-box',
  fontFamily: 'inherit',
}
