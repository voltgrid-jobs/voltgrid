'use client'

import { useState } from 'react'

interface Props {
  token: string
  initialFrequency: 'daily' | 'weekly'
  initialKeywords: string
  initialLocation: string
}

export function ManageForm({ token, initialFrequency, initialKeywords, initialLocation }: Props) {
  const [frequency, setFrequency] = useState(initialFrequency)
  const [keywords, setKeywords] = useState(initialKeywords)
  const [location, setLocation] = useState(initialLocation)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  async function save(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setSaved(false)
    setError('')
    try {
      const res = await fetch('/api/alerts/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, frequency, keywords, location }),
      })
      if (res.ok) {
        setSaved(true)
      } else {
        const data = await res.json().catch(() => ({}))
        setError(data.error || 'Could not save changes.')
      }
    } catch {
      setError('Could not save changes.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={save} style={{ display: 'grid', gap: '1rem' }}>
      <label style={{ display: 'block' }}>
        <div style={labelStyle}>Frequency</div>
        <select
          value={frequency}
          onChange={(e) => setFrequency(e.target.value as 'daily' | 'weekly')}
          style={inputStyle}
        >
          <option value="daily">Daily — new jobs the morning after they post</option>
          <option value="weekly">Weekly — every Monday morning only</option>
        </select>
      </label>

      <label style={{ display: 'block' }}>
        <div style={labelStyle}>Keywords (optional)</div>
        <input
          type="text"
          value={keywords}
          onChange={(e) => setKeywords(e.target.value)}
          placeholder="e.g. NFPA 70E, commissioning, per diem"
          style={inputStyle}
        />
      </label>

      <label style={{ display: 'block' }}>
        <div style={labelStyle}>Location (optional)</div>
        <input
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="e.g. Northern Virginia, Phoenix, remote"
          style={inputStyle}
        />
      </label>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
        <button
          type="submit"
          disabled={saving}
          style={{
            padding: '0.75rem 1.5rem',
            borderRadius: '10px',
            background: 'var(--yellow)',
            color: '#0a0a0a',
            fontWeight: 700,
            fontSize: '0.9rem',
            border: 'none',
            cursor: saving ? 'not-allowed' : 'pointer',
            opacity: saving ? 0.6 : 1,
          }}
        >
          {saving ? 'Saving…' : 'Save changes'}
        </button>
        {saved && (
          <span style={{ fontSize: '0.85rem', color: 'var(--green, #4ade80)' }}>
            ✓ Saved
          </span>
        )}
        {error && (
          <span style={{ fontSize: '0.85rem', color: '#f87171' }}>
            {error}
          </span>
        )}
      </div>
    </form>
  )
}

const labelStyle: React.CSSProperties = {
  fontSize: '0.7rem',
  fontWeight: 700,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  color: 'var(--fg-faint)',
  marginBottom: '0.4rem',
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.75rem 1rem',
  borderRadius: '10px',
  border: '1px solid var(--border-strong)',
  background: 'var(--bg-raised)',
  color: 'var(--fg)',
  fontSize: '0.95rem',
  outline: 'none',
  boxSizing: 'border-box',
  fontFamily: 'inherit',
}
