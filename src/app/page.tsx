import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { JobCard } from '@/components/jobs/JobCard'
import { CATEGORY_LABELS, type JobCategory } from '@/types'

const CATEGORIES: { key: JobCategory; icon: string }[] = [
  { key: 'electrical', icon: '⚡' },
  { key: 'hvac', icon: '❄️' },
  { key: 'low_voltage', icon: '📡' },
  { key: 'construction', icon: '🏗️' },
  { key: 'project_management', icon: '📋' },
  { key: 'operations', icon: '⚙️' },
]

export default async function HomePage() {
  const supabase = await createClient()

  const { data: featuredJobs } = await supabase
    .from('jobs')
    .select('*')
    .eq('is_active', true)
    .eq('is_featured', true)
    .order('created_at', { ascending: false })
    .limit(3)

  const { data: recentJobs } = await supabase
    .from('jobs')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(9)

  const { count: totalJobs } = await supabase
    .from('jobs')
    .select('*', { count: 'exact', head: true })
    .eq('is_active', true)

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-b from-gray-900 to-gray-950 border-b border-gray-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-20 text-center">
          <div className="inline-flex items-center gap-2 bg-yellow-400/10 text-yellow-400 text-sm font-medium px-3 py-1 rounded-full mb-6">
            <span>⚡</span>
            <span>The AI infrastructure boom needs trades workers</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            Trades Jobs at<br />
            <span className="text-yellow-400">Data Centers & AI Sites</span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
            Electricians, HVAC techs, and low voltage specialists — find the high-paying roles
            building the infrastructure behind AI. {totalJobs ?? 0} jobs available now.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/jobs"
              className="bg-yellow-400 text-gray-950 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-yellow-300 transition-colors"
            >
              Browse All Jobs
            </Link>
            <Link
              href="/post-job"
              className="border border-gray-700 text-gray-300 px-8 py-4 rounded-xl font-semibold text-lg hover:border-gray-500 hover:text-white transition-colors"
            >
              Post a Job — $149
            </Link>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-14">
        <h2 className="text-2xl font-bold text-white mb-8">Browse by Trade</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {CATEGORIES.map(({ key, icon }) => (
            <Link
              key={key}
              href={`/jobs?category=${key}`}
              className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center hover:border-yellow-400/50 hover:bg-gray-800 transition-all group"
            >
              <div className="text-2xl mb-2">{icon}</div>
              <div className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors">
                {CATEGORY_LABELS[key]}
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Jobs */}
      {featuredJobs && featuredJobs.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Featured Jobs</h2>
            <Link href="/jobs?featured=true" className="text-yellow-400 text-sm hover:text-yellow-300">
              View all →
            </Link>
          </div>
          <div className="flex flex-col gap-4">
            {featuredJobs.map((job) => (
              <JobCard key={job.id} job={job} featured />
            ))}
          </div>
        </section>
      )}

      {/* Recent Jobs */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-16">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Latest Jobs</h2>
          <Link href="/jobs" className="text-yellow-400 text-sm hover:text-yellow-300">
            View all {totalJobs ?? 0} jobs →
          </Link>
        </div>
        {recentJobs && recentJobs.length > 0 ? (
          <div className="flex flex-col gap-4">
            {recentJobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        ) : (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-12 text-center">
            <div className="text-4xl mb-4">⚡</div>
            <p className="text-gray-400 mb-2">Jobs are loading...</p>
            <p className="text-gray-600 text-sm">The aggregation pipeline will populate listings shortly.</p>
          </div>
        )}
      </section>

      {/* Employer CTA */}
      <section className="bg-gray-900 border-y border-gray-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Hiring trades workers for your data center project?
          </h2>
          <p className="text-gray-400 mb-8 text-lg">
            Reach the most qualified electricians, HVAC techs, and low voltage specialists in the industry.
            Starting at $149 per listing.
          </p>
          <Link
            href="/post-job"
            className="inline-block bg-yellow-400 text-gray-950 px-10 py-4 rounded-xl font-semibold text-lg hover:bg-yellow-300 transition-colors"
          >
            Post Your First Job
          </Link>
        </div>
      </section>
    </div>
  )
}
