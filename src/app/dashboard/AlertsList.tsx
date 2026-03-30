'use client'

import { useState } from 'react'

interface Alert {
  id: string
  keywords: string | null
  location: string | null
  category: string | null
  frequency: string
}

export function AlertsList({ initialAlerts }: { initialAlerts: Alert[] }) {
  const [alerts, setAlerts] = useState(initialAlerts)
  const [deleting, setDeleting] = useState<Set<string>>(new Set())

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

  if (alerts.length === 0) {
    return (
      <div style={{ background: 'var(--bg-raised)', border: '1px solid var(--border)' }} className="rounded-xl p-8 text-center">
        <p className="text-sm mb-2" style={{ color: 'var(--fg-faint)' }}>No job alerts set up.</p>
        <p className="text-xs" style={{ color: 'var(--fg-faint)' }}>Set up alerts from any job listing page.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
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
                {alert.category && ` · ${alert.category}`}
              </p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--fg-faint)' }}>{alert.frequency} digest</p>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              <button
                onClick={() => handleDelete(alert.id)}
                disabled={isDeleting}
                className="text-xs px-3 py-1.5 rounded-lg hover:text-red-400 transition-colors disabled:cursor-not-allowed"
                style={{ color: 'var(--fg-muted)', border: '1px solid var(--border)' }}
              >
                {isDeleting ? '...' : 'Delete'}
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}
