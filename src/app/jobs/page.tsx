export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { JobCard } from '@/components/jobs/JobCard'
import { JobFilters } from '@/components/jobs/JobFilters'
import { Pagination } from '@/components/jobs/Pagination'
import { CATEGORY_LABELS, type JobCategory, type Job } from '@/types'
import { JobAlertInlineForm } from '@/components/jobs/JobAlertInlineForm'
import { JobAlertPopupWrapper } from '@/components/jobs/JobAlertPopupWrapper'
import type { Metadata } from 'next'

type MetadataProps = { searchParams: Promise<SearchParams> }

export async function generateMetadata({ searchParams }: MetadataProps): Promise<Metadata> {
  const params = await searchParams
  const hasFilters = Object.keys(params).some((k) => k !== 'page')

  return {
    title: 'Browse Data Center & AI Infrastructure Jobs',
    description: 'Browse electrician, HVAC, low voltage, and construction jobs at data centers and AI infrastructure projects.',
    alternates: { canonical: 'https://voltgridjobs.com/jobs' },
    ...(hasFilters && { robots: { index: false, follow: false } }),
  }
}

const PAGE_SIZE = 20

interface SearchParams {
  category?: string
  location?: string
  q?: string
  type?: string
  featured?: string
  per_diem?: string
  travel?: string
  shift?: string
  union?: string
  company?: string
  remote?: string
  salary?: string
  page?: string
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function applyFilters(query: any, params: SearchParams): any {
  let q = query
  if (params.category && params.category in CATEGORY_LABELS) {
    q = q.eq('category', params.category as JobCategory)
  }
  if (params.q) {
    q = q.or(`title.ilike.%${params.q}%,company_name.ilike.%${params.q}%,description.ilike.%${params.q}%`)
  }
  if (params.location) {
    q = q.ilike('location', `%${params.location}%`)
  }
  if (params.type) {
    q = q.eq('job_type', params.type)
  }
  if (params.featured === 'true') {
    q = q.eq('is_featured', true)
  }
  if (params.per_diem === 'true') {
    q = q.eq('per_diem', true)
  }
  if (params.travel) {
    q = q.eq('travel_required', params.travel)
  }
  if (params.shift) {
    q = q.eq('shift_type', params.shift)
  }
  if (params.union === 'true') {
    q = q.eq('is_union', true)
  }
  if (params.company) {
    q = q.ilike('company_name', `%${params.company}%`)
  }
  if (params.remote === 'true') {
    q = q.eq('remote', true)
  }
  if (params.salary === 'true') {
    q = q.not('salary_min', 'is', null)
  }
  return q
}

function buildBasePath(params: SearchParams): string {
  const filtered: Record<string, string> = {}
  for (const [k, v] of Object.entries(params)) {
    if (k !== 'page' && v) filtered[k] = v
  }
  const qs = new URLSearchParams(filtered).toString()
  return qs ? `/jobs?${qs}` : '/jobs'
}

export default async function JobsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams
  const supabase = await createClient()

  const currentPage = Math.max(1, parseInt(params.page ?? '1', 10) || 1)

  // Count query — exact count with filters applied
  const { count: filteredCount } = await applyFilters(
    supabase
      .from('jobs')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true),
    params
  )

  const totalJobs = filteredCount ?? 0
  const totalPages = Math.max(1, Math.ceil(totalJobs / PAGE_SIZE))
  const safePage = Math.min(currentPage, totalPages)

  // Data query — paginated with .range()
  const { data: jobs, error } = await applyFilters(
    supabase
      .from('jobs')
      .select('*')
      .eq('is_active', true)
      .order('is_featured', { ascending: false })
      .order('created_at', { ascending: false }),
    params
  ).range((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE - 1)

  // Get top companies for filter dropdown
  const { data: allJobs } = await supabase
    .from('jobs')
    .select('company_name, category')
    .eq('is_active', true)

  const companyCounts: Record<string, number> = {}
  const categoryCounts: Record<string, number> = {}
  allJobs?.forEach((j: { company_name?: string; category?: string }) => {
    if (j.company_name) companyCounts[j.company_name] = (companyCounts[j.company_name] || 0) + 1
    if (j.category) categoryCounts[j.category] = (categoryCounts[j.category] || 0) + 1
  })
  const topCompanies = Object.entries(companyCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 12)
    .map(([name, count]) => ({ name, count }))

  const hasFilters = params.category || params.q || params.location || params.type ||
    params.featured || params.per_diem || params.travel || params.shift || params.union || params.company ||
    params.remote || params.salary

  const activeCategory = params.category as JobCategory | undefined
  const basePath = buildBasePath(params)

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--fg)', fontFamily: 'var(--font-display), system-ui, sans-serif', letterSpacing: '-0.01em' }}>
          {params.company ? `${params.company} Jobs` : activeCategory ? `${CATEGORY_LABELS[activeCategory]} Jobs` : 'Data Center Electrician, HVAC & Trades Jobs'}
        </h1>
        <p style={{ color: 'var(--fg-muted)' }}>
          {totalJobs} {hasFilters ? 'matching' : 'open'} position{totalJobs !== 1 ? 's' : ''} at data centers and AI infrastructure projects
        </p>
        {params.q && (
          <div className="flex items-center gap-2 mt-3">
            <span className="inline-flex items-center gap-1.5 text-sm px-3 py-1 rounded-full"
              style={{ background: 'var(--yellow-dim)', color: 'var(--yellow)', border: '1px solid var(--yellow-border)' }}>
              Searching for: <strong>{params.q}</strong>
            </span>
            <a href={buildBasePath({ ...params, q: undefined })}
              className="text-xs transition-colors"
              style={{ color: 'var(--fg-faint)' }}>
              ✕ clear
            </a>
          </div>
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <aside className="lg:w-64 flex-shrink-0">
          <JobFilters currentParams={params} topCompanies={topCompanies} categoryCounts={categoryCounts} />
        </aside>

        <div className="flex-1">
          {jobs && jobs.length > 0 ? (
            <>
              <div className="flex flex-col gap-4">
                {(jobs as Job[]).map((job) => (
                  <JobCard key={job.id} job={job} featured={job.is_featured} />
                ))}
              </div>
              <Pagination
                currentPage={safePage}
                totalPages={totalPages}
                basePath={basePath}
              />
              <div id="get-alerts"><JobAlertInlineForm variant="jobs" defaultTrade={activeCategory ?? ''} /></div>
            </>
          ) : (
            <div className="rounded-xl p-10 text-center" style={{ background: 'var(--bg-raised)', border: '1px solid var(--border)' }}>
              <p className="text-2xl mb-3">🔍</p>
              <p className="font-semibold mb-2" style={{ color: 'var(--fg)' }}>No jobs match your filters</p>
              {hasFilters ? (
                <>
                  <div className="flex flex-wrap justify-center gap-1.5 mb-5 mt-3">
                    {params.q && <span className="text-xs px-2 py-1 rounded-full" style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--fg-muted)' }}>Search: {params.q}</span>}
                    {params.category && <span className="text-xs px-2 py-1 rounded-full" style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--fg-muted)' }}>{CATEGORY_LABELS[params.category as JobCategory]}</span>}
                    {params.location && <span className="text-xs px-2 py-1 rounded-full" style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--fg-muted)' }}>{params.location}</span>}
                    {params.type && <span className="text-xs px-2 py-1 rounded-full" style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--fg-muted)' }}>{params.type}</span>}
                    {params.remote === 'true' && <span className="text-xs px-2 py-1 rounded-full" style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--fg-muted)' }}>Remote OK</span>}
                    {params.union === 'true' && <span className="text-xs px-2 py-1 rounded-full" style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--fg-muted)' }}>Union</span>}
                    {params.per_diem === 'true' && <span className="text-xs px-2 py-1 rounded-full" style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--fg-muted)' }}>Per Diem</span>}
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <a href="/jobs" className="inline-block text-sm px-5 py-2.5 rounded-lg font-semibold transition-colors"
                      style={{ background: 'var(--yellow)', color: '#0A0A0A' }}>
                      Clear filters
                    </a>
                    <a href="#get-alerts" className="inline-block text-sm px-5 py-2.5 rounded-lg transition-colors"
                      style={{ border: '1px solid var(--border-strong)', color: 'var(--fg-muted)' }}>
                      Get alerts when matching jobs post
                    </a>
                  </div>
                </>
              ) : (
                <p className="text-sm" style={{ color: 'var(--fg-muted)' }}>New jobs are added daily. Check back shortly.</p>
              )}
            </div>
          )}
        </div>
      </div>
      {/* 3-step job alert popup — triggers after 2 job views */}
      <JobAlertPopupWrapper />
    </div>
  )
}
