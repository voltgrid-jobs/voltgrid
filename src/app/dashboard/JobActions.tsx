'use client'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface JobActionsProps {
  jobId: string
  isActive: boolean
  expired: boolean
}

export function JobActions({ jobId, isActive, expired }: JobActionsProps) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [optimisticActive, setOptimisticActive] = useState(isActive)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)

  async function handlePauseToggle() {
    const next = !optimisticActive
    setOptimisticActive(next)
    const res = await fetch('/api/dashboard/pause', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ job_id: jobId, active: next }),
    })
    if (!res.ok) {
      setOptimisticActive(!next) // revert on error
    } else {
      startTransition(() => router.refresh())
    }
  }

  async function handleDelete() {
    setDeleting(true)
    const res = await fetch('/api/dashboard/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ job_id: jobId }),
    })
    if (res.ok) {
      startTransition(() => router.refresh())
    } else {
      setDeleting(false)
      setShowDeleteConfirm(false)
    }
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <Link
        href={`/post-job?edit=${jobId}`}
        className="text-xs hover:opacity-80 transition-opacity whitespace-nowrap"
        style={{ color: 'var(--fg-faint)' }}
      >
        Edit
      </Link>

      {!expired && (
        <button
          onClick={handlePauseToggle}
          disabled={pending}
          className="text-xs hover:opacity-80 transition-opacity whitespace-nowrap"
          style={{ color: optimisticActive ? 'var(--fg-faint)' : 'var(--green)' }}
        >
          {optimisticActive ? 'Pause' : 'Unpause'}
        </button>
      )}

      {expired && (
        <Link
          href="/post-job"
          className="text-xs hover:opacity-80 transition-opacity whitespace-nowrap"
          style={{ color: 'var(--yellow)' }}
        >
          Renew →
        </Link>
      )}

      {showDeleteConfirm ? (
        <span className="flex items-center gap-1.5">
          <span className="text-xs" style={{ color: 'var(--fg-faint)' }}>Delete?</span>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="text-xs font-semibold hover:opacity-80 transition-opacity whitespace-nowrap"
            style={{ color: '#F87171' }}
          >
            {deleting ? '...' : 'Yes'}
          </button>
          <button
            onClick={() => setShowDeleteConfirm(false)}
            className="text-xs hover:opacity-80 transition-opacity whitespace-nowrap"
            style={{ color: 'var(--fg-faint)' }}
          >
            No
          </button>
        </span>
      ) : (
        <button
          onClick={() => setShowDeleteConfirm(true)}
          className="text-xs hover:text-red-400 transition-colors whitespace-nowrap"
          style={{ color: 'var(--fg-faint)' }}
        >
          Delete
        </button>
      )}
    </div>
  )
}
