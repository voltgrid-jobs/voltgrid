'use client'
import { useState, useEffect } from 'react'
import { PostJobForm } from './PostJobForm'
import { PersistentPricingSelector } from './PersistentPricingSelector'

interface Props {
  trustRail: React.ReactNode
  jobCount: number
  editId?: string | null
}

export function PostJobPageClient({ trustRail, editId }: Props) {
  const [selectedPlan, setSelectedPlan] = useState('five_pack')
  const [editJob, setEditJob] = useState<Record<string, unknown> | null>(null)
  const [editLoading, setEditLoading] = useState(!!editId)
  const [editError, setEditError] = useState('')

  useEffect(() => {
    if (!editId) return
    setEditLoading(true)
    fetch(`/api/dashboard/get-job?job_id=${editId}`)
      .then(r => r.ok ? r.json() : Promise.reject(r.status))
      .then(data => setEditJob(data))
      .catch(() => setEditError('Could not load job. You may not have permission to edit it.'))
      .finally(() => setEditLoading(false))
  }, [editId])

  const isEditMode = !!editId

  return (
    <>
      {/* Pricing selector — hidden in edit mode (no payment needed) */}
      {!isEditMode && (
        <PersistentPricingSelector
          selectedPlan={selectedPlan}
          setSelectedPlan={setSelectedPlan}
        />
      )}

      {/* pt-28 = header (56px) + pricing bar (56px); pt-10 in edit mode (no bar) */}
      <div className={`max-w-5xl mx-auto px-4 sm:px-6 ${isEditMode ? 'pt-10' : 'pt-28'} pb-12`}>
        <div className="mb-8">
          <h1
            className="text-3xl font-bold mb-2"
            style={{ color: 'var(--fg)', fontFamily: 'var(--font-display), system-ui, sans-serif' }}
          >
            {isEditMode ? 'Edit your listing' : 'Post a Job'}
          </h1>
          <p style={{ color: 'var(--fg-muted)' }}>
            {isEditMode
              ? 'Update your job details below. Changes go live immediately.'
              : 'Reach electricians, HVAC techs, and low voltage specialists actively looking for data center work.'}
          </p>
        </div>

        {/* Mobile: trust rail above form */}
        {!isEditMode && <div className="lg:hidden mb-6">{trustRail}</div>}

        {/* Desktop: 2-col layout */}
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Left: form */}
          <div className="flex-1 w-full">
            {isEditMode ? (
              editLoading ? (
                <div className="py-12 text-center" style={{ color: 'var(--fg-faint)' }}>
                  Loading job details...
                </div>
              ) : editError ? (
                <div className="rounded-xl px-4 py-3" style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)', color: '#F87171' }}>
                  {editError}
                </div>
              ) : editJob ? (
                <PostJobForm
                  selectedPlan={selectedPlan}
                  setSelectedPlan={setSelectedPlan}
                  initialData={editJob}
                  editJobId={editId!}
                />
              ) : null
            ) : (
              <PostJobForm selectedPlan={selectedPlan} setSelectedPlan={setSelectedPlan} />
            )}
          </div>

          {/* Right: trust rail — desktop only, hidden in edit mode */}
          {!isEditMode && (
            <div className="hidden lg:block w-80 flex-shrink-0 sticky top-28">
              {trustRail}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
