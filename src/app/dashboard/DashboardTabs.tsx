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
  showPostings,
  postingsContent,
  searchesContent,
}: DashboardTabsProps) {
  const [activeTab, setActiveTab] = useState<'postings' | 'searches'>(defaultTab)

  // If only one tab available, skip tab rendering and show directly
  if (!showPostings) {
    return <>{searchesContent}</>
  }

  return (
    <div>
      {/* Tab bar — Postings first for employers */}
      <div className="flex items-center gap-1 mb-8" style={{ borderBottom: '1px solid var(--border)', paddingBottom: '0' }}>
        {showPostings && (
          <TabButton
            active={activeTab === 'postings'}
            onClick={() => setActiveTab('postings')}
          >
            My Postings
          </TabButton>
        )}
        <TabButton
          active={activeTab === 'searches'}
          onClick={() => setActiveTab('searches')}
        >
          My Job Searches
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
      className="px-4 py-2.5 text-sm font-medium transition-colors relative"
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
