'use client'

import { useState } from 'react'
import Link from 'next/link'

interface SavedJob {
  job_id: string
  job: {
    id: string
    title: string
    company_name: string
    location: string
    expires_at: string | null
  } | null
}

export function SavedJobsList({ initialJobs }: { initialJobs: SavedJob[] }) {
  const [jobs, setJobs] = useState(initialJobs)
  const [removing, setRemoving] = useState<Set<string>>(new Set())

  const handleRemove = async (jobId: string) => {
    setRemoving(prev => new Set(prev).add(jobId))
    try {
      const res = await fetch('/api/jobs/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ job_id: jobId }),
      })
      if (res.ok) {
        setJobs(prev => prev.filter(s => s.job_id !== jobId))
      }
    } finally {
      setRemoving(prev => {
        const next = new Set(prev)
        next.delete(jobId)
        return next
      })
    }
  }

  if (jobs.length === 0) {
    return (
      <div style={{ background: 'var(--bg-raised)', border: '1px solid var(--border)' }} className="rounded-xl p-8 text-center">
        <p className="text-sm mb-3" style={{ color: 'var(--fg-faint)' }}>No saved jobs yet.</p>
        <Link href="/jobs" style={{ color: 'var(--yellow)' }} className="text-sm hover:opacity-80 transition-opacity">
          Browse jobs →
        </Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {jobs.map((s) => {
        const job = s.job
        if (!job) return null
        const isExpired = job.expires_at ? new Date(job.expires_at) < new Date() : false
        const isRemoving = removing.has(s.job_id)

        return (
          <div
            key={s.job_id}
            style={{ background: 'var(--bg-raised)', border: '1px solid var(--border)', opacity: isRemoving ? 0.5 : 1, transition: 'opacity 0.15s' }}
            className="rounded-xl p-4 flex items-center gap-4"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <p className="text-sm font-medium truncate" style={{ color: isExpired ? 'var(--fg-faint)' : 'var(--fg)' }}>
                  {job.title}
                </p>
                {isExpired ? (
                  <span className="text-xs px-2 py-0.5 rounded-full flex-shrink-0" style={{ background: 'var(--bg-subtle)', color: 'var(--fg-faint)', border: '1px solid var(--border)' }}>
                    Expired
                  </span>
                ) : (
                  <span className="text-xs px-2 py-0.5 rounded-full flex-shrink-0" style={{ background: 'var(--green-dim)', color: 'var(--green)', border: '1px solid rgba(74,222,128,0.2)' }}>
                    Active
                  </span>
                )}
              </div>
              <p className="text-xs" style={{ color: 'var(--fg-faint)' }}>
                {job.company_name} · {job.location}
              </p>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              {!isExpired && (
                <Link href={`/jobs/${s.job_id}`} className="text-xs hover:opacity-80 transition-opacity" style={{ color: 'var(--yellow)' }}>
                  View →
                </Link>
              )}
              <button
                onClick={() => handleRemove(s.job_id)}
                disabled={isRemoving}
                className="text-xs px-3 py-1.5 rounded-lg hover:text-red-400 transition-colors disabled:cursor-not-allowed"
                style={{ color: 'var(--fg-muted)', border: '1px solid var(--border)' }}
              >
                {isRemoving ? '...' : 'Remove'}
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}
