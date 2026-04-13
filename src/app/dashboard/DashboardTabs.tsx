'use client'

import { useState } from 'react'
import type { ReactNode } from 'react'

interface DashboardTabsProps {
  defaultTab: 'postings' | 'searches'
  showPostings: boolean
  showSearches: boolean
  postingsContent: ReactNode
  searchesContent: ReactNode
}

export function DashboardTabs({
  defaultTab,
  postingsContent,
  searchesContent,
}: DashboardTabsProps) {
  const [activeTab, setActiveTab] = useState<'postings' | 'searches'>(defaultTab)

  return (
    <div>
      {/* Tab bar — always show both tabs */}
      <div className="flex items-center gap-1 mb-8" style={{ borderBottom: '1px solid var(--border)', paddingBottom: '0' }}>
        <TabButton
          active={activeTab === 'searches'}
          onClick={() => setActiveTab('searches')}
        >
          My Job Searches
        </TabButton>
        <TabButton
          active={activeTab === 'postings'}
          onClick={() => setActiveTab('postings')}
        >
          My Postings
        </TabButton>
      </div>

      {/* Tab content */}
      {activeTab === 'postings' ? postingsContent : searchesContent}
    </div>
  )
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className="px-4 py-2.5 text-sm font-medium transition-colors hover:opacity-80 relative"
      style={{
        color: active ? 'var(--fg)' : 'var(--fg-faint)',
        borderBottom: active ? '2px solid var(--yellow)' : '2px solid transparent',
        marginBottom: '-1px',
        background: 'transparent',
      }}
    >
      {children}
    </button>
  )
}
