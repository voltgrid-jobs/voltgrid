'use client'

import { useState } from 'react'

interface Alert {
  id: string
  keywords: string | null
  location: string | null
  category: string | null
  frequency: string
}

const TRADES = [
  { value: 'electrical', label: 'Electrical' },
  { value: 'hvac', label: 'HVAC' },
  { value: 'low_voltage', label: 'Low Voltage' },
  { value: 'construction', label: 'Construction' },
  { value: 'operations', label: 'Operations' },
  { value: 'all', label: 'All trades' },
]

export function AlertsList({ initialAlerts, userEmail }: { initialAlerts: Alert[]; userEmail: string }) {
  const [alerts, setAlerts] = useState(initialAlerts)
  const [deleting, setDeleting] = useState<Set<string>>(new Set())
  const [showCreate, setShowCreate] = useState(false)
  const [newTrade, setNewTrade] = useState('all')
  const [newLocation, setNewLocation] = useState('')
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState('')

  const handleDelete = async (alertId: string) => {
    setDeleting(prev => new Set(prev).add(alertId))
    try {
      const res = await fetch('/api/alerts/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alert_id: alertId }),
      })
      if (res.ok) {
        setAlerts(prev => prev.filter(a => a.id !== alertId))
      }
    } finally {
      setDeleting(prev => {
        const next = new Set(prev)
        next.delete(alertId)
        return next
      })
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreating(true)
    setCreateError('')
    try {
      const res = await fetch('/api/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: userEmail,
          category: newTrade === 'all' ? null : newTrade,
          location: newLocation.trim() || '',
          frequency: 'daily',
          trade_pref: newTrade,
          location_pref: newLocation.trim() || 'all',
          source: 'dashboard',
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (res.ok && data?.success) {
        // Add to local list
        setAlerts(prev => [...prev, {
          id: Date.now().toString(),
          keywords: null,
          location: newLocation.trim() || null,
          category: newTrade === 'all' ? null : newTrade,
          frequency: 'daily',
        }])
        setShowCreate(false)
        setNewTrade('all')
        setNewLocation('')
      } else {
        setCreateError(data?.error || 'Failed to create alert.')
      }
    } catch {
      setCreateError('Something went wrong.')
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {alerts.length === 0 && !showCreate && (
        <div style={{ background: 'var(--bg-raised)', border: '1px solid var(--border)' }} className="rounded-xl p-8 text-center">
          <p className="text-sm mb-2" style={{ color: 'var(--fg-faint)' }}>No job alerts set up yet.</p>
        </div>
      )}

      {alerts.map((alert) => {
        const isDeleting = deleting.has(alert.id)
        return (
          <div
            key={alert.id}
            style={{ background: 'var(--bg-raised)', border: '1px solid var(--border)', opacity: isDeleting ? 0.5 : 1, transition: 'opacity 0.15s' }}
            className="rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-3"
          >
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium" style={{ color: 'var(--fg)' }}>
                {alert.keywords || 'All jobs'}
                {alert.location && ` · ${alert.location}`}
                {alert.category && ` · ${alert.category.replace(/_/g, ' ')}`}
              </p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--fg-faint)' }}>{alert.frequency} digest</p>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              <button
                onClick={() => handleDelete(alert.id)}
                disabled={isDeleting}
                className="text-xs px-3 py-1.5 rounded-lg hover:text-red-400 transition-colors hover:opacity-80 disabled:cursor-not-allowed"
                style={{ color: 'var(--fg-muted)', border: '1px solid var(--border)' }}
              >
                {isDeleting ? '...' : 'Delete'}
              </button>
            </div>
          </div>
        )
      })}

      {/* Create new alert */}
      {showCreate ? (
        <form
          onSubmit={handleCreate}
          className="rounded-xl p-4"
          style={{ background: 'var(--bg-raised)', border: '1px solid var(--yellow-border)' }}
        >
          <p className="text-sm font-semibold mb-3" style={{ color: 'var(--fg)' }}>New job alert</p>
          <div className="flex flex-col sm:flex-row gap-2 mb-3">
            <select
              value={newTrade}
              onChange={e => setNewTrade(e.target.value)}
              className="flex-1 rounded-lg px-3 py-2 text-sm focus:outline-none"
              style={{ background: 'var(--bg)', border: '1px solid var(--border-strong)', color: 'var(--fg)' }}
            >
              {TRADES.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
            <input
              type="text"
              value={newLocation}
              onChange={e => setNewLocation(e.target.value)}
              placeholder="Location (optional)"
              className="flex-1 rounded-lg px-3 py-2 text-sm focus:outline-none"
              style={{ background: 'var(--bg)', border: '1px solid var(--border-strong)', color: 'var(--fg)' }}
            />
          </div>
          {createError && (
            <p className="text-xs mb-2" style={{ color: '#F87171' }}>{createError}</p>
          )}
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={creating}
              className="px-4 py-2 rounded-lg text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-60"
              style={{ background: 'var(--yellow)', color: '#0A0A0A' }}
            >
              {creating ? 'Creating...' : 'Create Alert'}
            </button>
            <button
              type="button"
              onClick={() => { setShowCreate(false); setCreateError('') }}
              className="px-4 py-2 rounded-lg text-sm transition-opacity hover:opacity-80"
              style={{ color: 'var(--fg-muted)', border: '1px solid var(--border)' }}
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <button
          type="button"
          onClick={() => setShowCreate(true)}
          className="w-full rounded-xl p-3 text-sm font-medium transition-opacity hover:opacity-80"
          style={{ color: 'var(--yellow)', border: '1px dashed var(--border-strong)' }}
        >
          + Add new alert
        </button>
      )}
    </div>
  )
}
