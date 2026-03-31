'use client'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface JobActionsProps {
  jobId: string
  isActive: boolean
  expired: boolean
}

function Spinner() {
  return (
    <span
      className="inline-block w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin"
      aria-hidden
    />
  )
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
      setOptimisticActive(!next)
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

      {/* Edit — outlined neutral button */}
      <Link
        href={`/post-job?edit=${jobId}`}
        className="inline-flex items-center justify-center min-h-[32px] px-2.5 rounded text-xs font-medium whitespace-nowrap border border-gray-700 text-gray-400 hover:border-gray-500 hover:text-white transition-colors"
      >
        Edit
      </Link>

      {/* Pause/Unpause — pill with semantic colour: green = active, amber = paused */}
      {!expired && (
        <button
          onClick={handlePauseToggle}
          disabled={pending}
          className="inline-flex items-center justify-center gap-1.5 min-h-[32px] px-2.5 rounded text-xs font-medium whitespace-nowrap transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          style={optimisticActive
            ? { border: '1px solid rgba(74,222,128,0.35)', background: 'rgba(74,222,128,0.08)', color: 'var(--green)' }
            : { border: '1px solid rgba(250,204,21,0.35)', background: 'rgba(250,204,21,0.08)', color: 'var(--yellow)' }
          }
        >
          {pending ? <Spinner /> : (optimisticActive ? 'Pause' : 'Unpause')}
        </button>
      )}

      {/* Renew — for expired listings */}
      {expired && (
        <Link
          href="/post-job"
          className="inline-flex items-center justify-center min-h-[32px] px-2.5 rounded text-xs font-medium whitespace-nowrap transition-colors"
          style={{ border: '1px solid var(--yellow-border)', background: 'var(--yellow-dim)', color: 'var(--yellow)' }}
        >
          Renew →
        </Link>
      )}

      {/* Delete — destructive styling visible before hover */}
      {showDeleteConfirm ? (
        <span
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs"
          style={{ background: 'rgba(127,29,29,0.3)', border: '1px solid rgba(153,27,27,0.5)' }}
        >
          <span style={{ color: '#FCA5A5' }}>Delete listing?</span>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="inline-flex items-center gap-1 font-semibold min-h-[24px] transition-opacity disabled:opacity-60 disabled:cursor-not-allowed whitespace-nowrap"
            style={{ color: '#F87171' }}
          >
            {deleting ? <Spinner /> : 'Yes, delete'}
          </button>
          <button
            onClick={() => setShowDeleteConfirm(false)}
            className="min-h-[24px] transition-opacity hover:opacity-70 whitespace-nowrap"
            style={{ color: 'var(--fg-faint)' }}
          >
            Cancel
          </button>
        </span>
      ) : (
        <button
          onClick={() => setShowDeleteConfirm(true)}
          className="inline-flex items-center justify-center min-h-[32px] px-2.5 rounded text-xs font-medium whitespace-nowrap transition-colors hover:bg-red-950/40"
          style={{ border: '1px solid rgba(153,27,27,0.6)', color: '#F87171' }}
        >
          Delete
        </button>
      )}
    </div>
  )
}
