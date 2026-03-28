import { createClient } from '@/lib/supabase/server'
import { JobCard } from '@/components/jobs/JobCard'
import { JobFilters } from '@/components/jobs/JobFilters'
import { CATEGORY_LABELS, type JobCategory } from '@/types'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Browse Jobs — VoltGrid Jobs',
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
    .limit(50)

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

  const { data: jobs, error } = await query

  // Get the true total count (unflitered) for display — matches homepage count
  const { count: totalCount } = await supabase
    .from('jobs')
    .select('*', { count: 'exact', head: true })
    .eq('is_active', true)

  const hasFilters = params.category || params.q || params.location || params.type ||
    params.featured || params.per_diem || params.travel || params.shift || params.union

  const activeCategory = params.category as JobCategory | undefined

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">
          {activeCategory ? `${CATEGORY_LABELS[activeCategory]} Jobs` : 'All Jobs'}
        </h1>
        <p className="text-gray-400">
          {hasFilters
            ? `${jobs?.length ?? 0} matching positions`
            : `${totalCount ?? 0} open positions`} at data centers and AI infrastructure projects
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <aside className="lg:w-64 flex-shrink-0">
          <JobFilters currentParams={params} />
        </aside>

        <div className="flex-1">
          {jobs && jobs.length > 0 ? (
            <div className="flex flex-col gap-4">
              {jobs.map((job) => (
                <JobCard key={job.id} job={job} featured={job.is_featured} />
              ))}
            </div>
          ) : (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-12 text-center">
              <div className="text-4xl mb-4">🔍</div>
              <p className="text-gray-300 font-medium mb-2">No jobs found</p>
              {hasFilters ? (
                <>
                  <p className="text-gray-500 text-sm mb-4">Try adjusting your filters or search terms.</p>
                  <a
                    href="/jobs"
                    className="inline-block text-yellow-400 text-sm hover:text-yellow-300 border border-yellow-400/30 px-4 py-2 rounded-lg hover:border-yellow-400/60 transition-colors"
                  >
                    Clear all filters →
                  </a>
                </>
              ) : (
                <p className="text-gray-500 text-sm">New jobs are added daily. Check back shortly.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
