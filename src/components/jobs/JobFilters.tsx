'use client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { CATEGORY_LABELS, JOB_TYPE_LABELS, TRAVEL_LABELS, SHIFT_LABELS } from '@/types'

interface Props {
  currentParams: {
    category?: string
    location?: string
    q?: string
    type?: string
    per_diem?: string
    travel?: string
    shift?: string
    union?: string
    company?: string
    remote?: string
    salary?: string
  }
  topCompanies?: { name: string; count: number }[]
  categoryCounts?: Record<string, number>
}

export function JobFilters({ currentParams, topCompanies = [], categoryCounts = {} }: Props) {
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)

  function updateFilter(key: string, value: string) {
    const params = new URLSearchParams()
    const merged = { ...currentParams, [key]: value }
    Object.entries(merged).forEach(([k, v]) => { if (v) params.set(k, v) })
    if (!value) params.delete(key)
    router.push(`/jobs?${params.toString()}`)
  }

  function clearFilters() { router.push('/jobs') }

  const hasFilters = Object.values(currentParams).some(Boolean)

  const filterBtn = (active: boolean, accent = 'yellow') => ({
    style: active
      ? { background: accent === 'green' ? 'var(--green-dim)' : accent === 'blue' ? 'var(--blue-dim)' : 'var(--yellow-dim)', color: accent === 'green' ? 'var(--green)' : accent === 'blue' ? 'var(--blue-fg)' : 'var(--yellow)' }
      : { color: 'var(--fg-muted)' },
  })

  return (
    <div>
      {/* Mobile toggle button */}
      <button
        className="lg:hidden w-full flex items-center justify-between px-4 py-3 rounded-xl mb-2 font-semibold text-sm"
        style={{ background: 'var(--bg-raised)', border: '1px solid var(--border)', color: 'var(--fg)', minHeight: '44px' }}
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-expanded={mobileOpen}
        aria-controls="filter-panel"
      >
        <span>Filters{hasFilters ? ` (active)` : ''}</span>
        <span style={{ color: 'var(--fg-faint)' }}>{mobileOpen ? '▲' : '▼'}</span>
      </button>

    <div id="filter-panel" className={`rounded-xl p-5 space-y-6 ${mobileOpen ? 'block' : 'hidden'} lg:block`} style={{ background: 'var(--bg-raised)', border: '1px solid var(--border)' }}>
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-sm" style={{ color: 'var(--fg)' }}>Filters</h2>
        {hasFilters && (
          <button onClick={clearFilters} className="text-xs transition-colors" style={{ color: 'var(--yellow)', minHeight: '44px', padding: '0 8px' }}>
            Clear all
          </button>
        )}
      </div>

      {/* Search */}
      <div>
        <label className="block text-xs font-medium tracking-widest uppercase mb-2" style={{ color: 'var(--fg-faint)' }}>Search</label>
        <input
          type="text"
          defaultValue={currentParams.q}
          placeholder="Job title, company..."
          className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none"
          style={{ background: 'var(--bg)', border: '1px solid var(--border-strong)', color: 'var(--fg)', caretColor: 'var(--yellow)' }}
          onKeyDown={(e) => { if (e.key === 'Enter') updateFilter('q', (e.target as HTMLInputElement).value) }}
        />
      </div>

      {/* Company */}
      {topCompanies.length > 0 && (
        <div>
          <label className="block text-xs font-medium tracking-widest uppercase mb-2" style={{ color: 'var(--fg-faint)' }}>Company</label>
          <div className="space-y-0.5">
            {topCompanies.map(({ name, count }) => {
              const active = currentParams.company === name
              return (
                <button key={name} onClick={() => updateFilter('company', active ? '' : name)}
                  className="w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-between"
                  {...filterBtn(active)}>
                  <span>{name}</span>
                  <span className="text-xs ml-2" style={{ color: active ? 'var(--yellow)' : 'var(--fg-faint)' }}>{count}</span>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Category */}
      <div>
        <label className="block text-xs font-medium tracking-widest uppercase mb-2" style={{ color: 'var(--fg-faint)' }}>Trade</label>
        <div className="space-y-0.5">
          {Object.entries(CATEGORY_LABELS).map(([key, label]) => {
            const active = currentParams.category === key
            const count = categoryCounts[key]
            return (
              <button key={key} onClick={() => updateFilter('category', active ? '' : key)}
                className="w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-between"
                {...filterBtn(active)}>
                <span>{label}</span>
                {count != null && count > 0 && (
                  <span className="ml-2 text-xs px-1.5 py-0.5 rounded tabular-nums flex-shrink-0"
                    style={{ background: active ? 'rgba(0,0,0,0.2)' : 'var(--bg)', color: active ? 'inherit' : 'var(--fg-faint)', minWidth: '1.5rem', textAlign: 'center' }}>
                    {count}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Job Type */}
      <div>
        <label className="block text-xs font-medium tracking-widest uppercase mb-2" style={{ color: 'var(--fg-faint)' }}>Job Type</label>
        <div className="space-y-0.5">
          {Object.entries(JOB_TYPE_LABELS).map(([key, label]) => {
            const active = currentParams.type === key
            return (
              <button key={key} onClick={() => updateFilter('type', active ? '' : key)}
                className="w-full text-left px-3 py-2 rounded-lg text-sm transition-colors"
                {...filterBtn(active)}>
                {label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Location */}
      <div>
        <label className="block text-xs font-medium tracking-widest uppercase mb-2" style={{ color: 'var(--fg-faint)' }}>Location</label>
        <input
          type="text"
          defaultValue={currentParams.location}
          placeholder="City, state..."
          className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none"
          style={{ background: 'var(--bg)', border: '1px solid var(--border-strong)', color: 'var(--fg)' }}
          onKeyDown={(e) => { if (e.key === 'Enter') updateFilter('location', (e.target as HTMLInputElement).value) }}
        />
      </div>

      {/* Shift Type */}
      <div>
        <label className="block text-xs font-medium tracking-widest uppercase mb-2" style={{ color: 'var(--fg-faint)' }}>Shift</label>
        <div className="space-y-0.5">
          {Object.entries(SHIFT_LABELS).map(([key, label]) => {
            const active = currentParams.shift === key
            return (
              <button key={key} onClick={() => updateFilter('shift', active ? '' : key)}
                className="w-full text-left px-3 py-2 rounded-lg text-sm transition-colors"
                {...filterBtn(active)}>
                {label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Travel */}
      <div>
        <label className="block text-xs font-medium tracking-widest uppercase mb-2" style={{ color: 'var(--fg-faint)' }}>Travel</label>
        <div className="space-y-0.5">
          {Object.entries(TRAVEL_LABELS).map(([key, label]) => {
            const active = currentParams.travel === key
            return (
              <button key={key} onClick={() => updateFilter('travel', active ? '' : key)}
                className="w-full text-left px-3 py-2 rounded-lg text-sm transition-colors"
                {...filterBtn(active)}>
                {label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Remote */}
      <div>
        <label className="block text-xs font-medium tracking-widest uppercase mb-2" style={{ color: 'var(--fg-faint)' }}>Remote</label>
        <button
          onClick={() => updateFilter('remote', currentParams.remote === 'true' ? '' : 'true')}
          className="w-full text-left px-3 py-2 rounded-lg text-sm transition-colors"
          {...filterBtn(currentParams.remote === 'true', 'green')}>
          Remote OK
        </button>
      </div>

      {/* Salary */}
      <div>
        <label className="block text-xs font-medium tracking-widest uppercase mb-2" style={{ color: 'var(--fg-faint)' }}>Salary</label>
        <button
          onClick={() => updateFilter('salary', currentParams.salary === 'true' ? '' : 'true')}
          className="w-full text-left px-3 py-2 rounded-lg text-sm transition-colors"
          {...filterBtn(currentParams.salary === 'true', 'yellow')}>
          With Salary Listed
        </button>
      </div>

      {/* Per Diem */}
      <div>
        <label className="block text-xs font-medium tracking-widest uppercase mb-2" style={{ color: 'var(--fg-faint)' }}>Per Diem</label>
        <button
          onClick={() => updateFilter('per_diem', currentParams.per_diem === 'true' ? '' : 'true')}
          className="w-full text-left px-3 py-2 rounded-lg text-sm transition-colors"
          {...filterBtn(currentParams.per_diem === 'true', 'green')}>
          Per Diem Included
        </button>
      </div>

      {/* Union */}
      <div>
        <label className="block text-xs font-medium tracking-widest uppercase mb-2" style={{ color: 'var(--fg-faint)' }}>Union</label>
        <button
          onClick={() => updateFilter('union', currentParams.union === 'true' ? '' : 'true')}
          className="w-full text-left px-3 py-2 rounded-lg text-sm transition-colors"
          style={{ minHeight: '44px', ...(filterBtn(currentParams.union === 'true', 'blue').style) }}>
          Union / CBA
        </button>
      </div>
    </div>
    </div>
  )
}
