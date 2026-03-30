'use client'
import { useState } from 'react'
import { PostJobForm } from './PostJobForm'
import { PersistentPricingSelector } from './PersistentPricingSelector'

interface Props {
  trustRail: React.ReactNode
}

export function PostJobPageClient({ trustRail }: Props) {
  const [selectedPlan, setSelectedPlan] = useState('single_post')

  return (
    <>
      <PersistentPricingSelector
        selectedPlan={selectedPlan}
        setSelectedPlan={setSelectedPlan}
      />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
        {/* Mobile: trust rail above form */}
        <div className="lg:hidden mb-6">{trustRail}</div>

        {/* Desktop: 2-col layout */}
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Left: form */}
          <div className="flex-1 w-full">
            <PostJobForm selectedPlan={selectedPlan} setSelectedPlan={setSelectedPlan} />
          </div>

          {/* Right: trust rail — hidden on mobile, shown on desktop */}
          <div className="hidden lg:block w-80 flex-shrink-0 sticky top-20">
            {trustRail}
          </div>
        </div>
      </div>
    </>
  )
}
