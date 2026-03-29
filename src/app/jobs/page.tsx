import { createClient } from '@/lib/supabase/server'
import { JobCard } from '@/components/jobs/JobCard'
import { JobFilters } from '@/components/jobs/JobFilters'
import { CATEGORY_LABELS, type JobCategory } from '@/types'
import { JobAlertInlineForm } from '@/components/jobs/JobAlertInlineForm'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Browse Data Center & AI Infrastructure Jobs',
  description: 'Browse electrician, HVAC, low voltage, and construction jobs at data centers and AI infrastructure projects.',
}

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
}

export default async function JobsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams
  const supabase = await createClient()

  let query = supabase
    .from('jobs')
    .select('*')
    .eq('is_active', true)
    .order('is_featured', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(200)

  if (params.category && params.category in CATEGORY_LABELS) {
    query = query.eq('category', params.category as JobCategory)
  }

  if (params.q) {
    query = query.or(`title.ilike.%${params.q}%,company_name.ilike.%${params.q}%,description.ilike.%${params.q}%`)
  }

  if (params.location) {
    query = query.ilike('location', `%${params.location}%`)
  }

  if (params.type) {
    query = query.eq('job_type', params.type)
  }

  if (params.featured === 'true') {
    query = query.eq('is_featured', true)
  }

  if (params.per_diem === 'true') {
    query = query.eq('per_diem', true)
  }

  if (params.travel) {
    query = query.eq('travel_required', params.travel)
  }

  if (params.shift) {
    query = query.eq('shift_type', params.shift)
  }

  if (params.union === 'true') {
    query = query.eq('is_union', true)
  }

  if (params.company) {
    query = query.ilike('company_name', `%${params.company}%`)
  }

  if (params.remote === 'true') {
    query = query.eq('remote', true)
  }

  if (params.salary === 'true') {
    query = query.not('salary_min', 'is', null)
  }

  const { data: jobs, error } = await query

  // Get the true total count (unfiltered) for display — matches homepage count
  const { count: totalCount } = await supabase
    .from('jobs')
    .select('*', { count: 'exact', head: true })
    .eq('is_active', true)

  // Get top companies for filter dropdown
  const { data: allJobs } = await supabase
    .from('jobs')
    .select('company_name')
    .eq('is_active', true)

  const companyCounts: Record<string, number> = {}
  allJobs?.forEach(j => { if (j.company_name) companyCounts[j.company_name] = (companyCounts[j.company_name] || 0) + 1 })
  const topCompanies = Object.entries(companyCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 12)
    .map(([name, count]) => ({ name, count }))

  const hasFilters = params.category || params.q || params.location || params.type ||
    params.featured || params.per_diem || params.travel || params.shift || params.union || params.company ||
    params.remote || params.salary

  const activeCategory = params.category as JobCategory | undefined

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--fg)', fontFamily: 'var(--font-display), system-ui, sans-serif', letterSpacing: '-0.01em' }}>
          {params.company ? `${params.company} Jobs` : activeCategory ? `${CATEGORY_LABELS[activeCategory]} Jobs` : 'All Jobs'}
        </h1>
        <p style={{ color: 'var(--fg-muted)' }}>
          {hasFilters
            ? `${jobs?.length ?? 0} matching positions`
            : `${totalCount ?? 0} open positions`} at data centers and AI infrastructure projects
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <aside className="lg:w-64 flex-shrink-0">
          <JobFilters currentParams={params} topCompanies={topCompanies} />
        </aside>

        <div className="flex-1">
          {jobs && jobs.length > 0 ? (
            <>
              <div className="flex flex-col gap-4">
                {jobs.map((job) => (
                  <JobCard key={job.id} job={job} featured={job.is_featured} />
                ))}
              </div>
              <JobAlertInlineForm variant="jobs" defaultTrade={activeCategory ?? ''} />
            </>
          ) : (
            <div className="rounded-xl p-12 text-center" style={{ background: 'var(--bg-raised)', border: '1px solid var(--border)' }}>
              <p className="font-medium mb-2" style={{ color: 'var(--fg)' }}>No jobs found</p>
              {hasFilters ? (
                <>
                  <p className="text-sm mb-4" style={{ color: 'var(--fg-muted)' }}>Try adjusting your filters or search terms.</p>
                  <a href="/jobs" className="inline-block text-sm px-4 py-2 rounded-lg transition-colors"
                    style={{ color: 'var(--yellow)', border: '1px solid var(--yellow-border)' }}>
                    Clear all filters →
                  </a>
                </>
              ) : (
                <p className="text-sm" style={{ color: 'var(--fg-muted)' }}>New jobs are added daily. Check back shortly.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
