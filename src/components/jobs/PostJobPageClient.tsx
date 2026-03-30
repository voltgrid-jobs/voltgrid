'use client'
import { useState } from 'react'
import { PostJobForm } from './PostJobForm'
import { PersistentPricingSelector } from './PersistentPricingSelector'

interface Props {
  trustRail: React.ReactNode
  jobCount: number
}

export function PostJobPageClient({ trustRail, jobCount }: Props) {
  const [selectedPlan, setSelectedPlan] = useState('five_pack')

  return (
    <>
      {/* Fixed below the sticky header (h-14 = 56px). Content pushed down via pt-28. */}
      <PersistentPricingSelector
        selectedPlan={selectedPlan}
        setSelectedPlan={setSelectedPlan}
      />

      {/* pt-28 = 112px: header (56px) + pricing bar (≈56px) */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-28 pb-12">
        <div className="mb-8">
          <h1
            className="text-3xl font-bold mb-2"
            style={{ color: 'var(--fg)', fontFamily: 'var(--font-display), system-ui, sans-serif' }}
          >
            Post a Job
          </h1>
          <p style={{ color: 'var(--fg-muted)' }}>
            Reach electricians, HVAC techs, and low voltage specialists actively looking for data center work.
          </p>
        </div>

        {/* Mobile: trust rail above form */}
        <div className="lg:hidden mb-6">{trustRail}</div>

        {/* Desktop: 2-col layout */}
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Left: form */}
          <div className="flex-1 w-full">
            <PostJobForm selectedPlan={selectedPlan} setSelectedPlan={setSelectedPlan} />
          </div>

          {/* Right: trust rail — desktop only, sticky below pricing bar */}
          <div className="hidden lg:block w-80 flex-shrink-0 sticky top-28">
            {trustRail}
          </div>
        </div>
      </div>
    </>
  )
}
