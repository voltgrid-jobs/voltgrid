'use client'
import { useState } from 'react'

export function SaveJobButton({ jobId, initialSaved = false }: { jobId: string; initialSaved?: boolean }) {
  const [saved, setSaved] = useState(initialSaved)
  const [loading, setLoading] = useState(false)

  async function toggle() {
    setLoading(true)
    try {
      const res = await fetch('/api/jobs/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ job_id: jobId }),
      })
      if (res.status === 401) {
        window.location.href = `/auth/login?next=/jobs/${jobId}`
        return
      }
      const data = await res.json()
      setSaved(data.saved)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-colors ${
        saved
          ? 'border-yellow-400 text-yellow-400 bg-yellow-400/10'
          : 'border-gray-700 text-gray-400 hover:border-gray-500 hover:text-white'
      }`}
    >
      <span>{saved ? '★' : '☆'}</span>
      {saved ? 'Saved' : 'Save Job'}
    </button>
  )
}
