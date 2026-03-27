import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Employer Dashboard — VoltGrid Jobs' }

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login?next=/dashboard')

  // Get or create employer profile
  let { data: employer } = await supabase
    .from('employers')
    .select('*')
    .eq('user_id', user.id)
    .single()

  // Get active jobs
  const { data: jobs } = employer
    ? await supabase
        .from('jobs')
        .select('*')
        .eq('employer_id', employer.id)
        .order('created_at', { ascending: false })
    : { data: [] }

  // Get credits
  const { data: credits } = employer
    ? await supabase
        .from('employer_credits')
        .select('*')
        .eq('employer_id', employer.id)
        .single()
    : { data: null }

  const activeJobs = jobs?.filter(j => j.is_active) ?? []
  const expiredJobs = jobs?.filter(j => !j.is_active) ?? []
  const postCredits = credits?.post_credits ?? 0
  const isPro = credits?.is_pro ?? false

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">
            {employer ? employer.company_name : 'Employer Dashboard'}
          </h1>
          <p className="text-gray-500 text-sm mt-1">{user.email}</p>
        </div>
        <div className="flex items-center gap-3">
          {isPro ? (
            <span className="bg-yellow-400/20 text-yellow-400 text-xs font-semibold px-3 py-1 rounded-full">
              ⚡ Pro
            </span>
          ) : postCredits > 0 ? (
            <span className="bg-gray-800 text-gray-300 text-xs px-3 py-1 rounded-full">
              {postCredits} post credit{postCredits !== 1 ? 's' : ''} remaining
            </span>
          ) : null}
          <Link
            href="/post-job"
            className="bg-yellow-400 text-gray-950 px-4 py-2 rounded-lg font-semibold text-sm hover:bg-yellow-300 transition-colors"
          >
            + Post a Job
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
        {[
          { label: 'Active Listings', value: activeJobs.length },
          { label: 'Total Posted', value: jobs?.length ?? 0 },
          { label: 'Post Credits', value: isPro ? '∞' : postCredits },
          { label: 'Plan', value: isPro ? 'Pro' : 'Pay-per-post' },
        ].map(stat => (
          <div key={stat.label} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <div className="text-2xl font-bold text-white">{stat.value}</div>
            <div className="text-gray-500 text-sm mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Active Jobs */}
      <section className="mb-10">
        <h2 className="text-lg font-semibold text-white mb-4">Active Listings</h2>
        {activeJobs.length > 0 ? (
          <div className="flex flex-col gap-3">
            {activeJobs.map(job => (
              <DashboardJobRow key={job.id} job={job} />
            ))}
          </div>
        ) : (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 text-center">
            <p className="text-gray-500 mb-3">No active listings.</p>
            <Link href="/post-job" className="text-yellow-400 hover:text-yellow-300 text-sm">
              Post your first job →
            </Link>
          </div>
        )}
      </section>

      {/* Expired Jobs */}
      {expiredJobs.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-gray-500 mb-4">Expired / Inactive</h2>
          <div className="flex flex-col gap-3 opacity-60">
            {expiredJobs.map(job => (
              <DashboardJobRow key={job.id} job={job} expired />
            ))}
          </div>
        </section>
      )}

      {/* No employer profile yet */}
      {!employer && (
        <div className="bg-yellow-400/10 border border-yellow-400/30 rounded-xl p-6 text-center">
          <p className="text-yellow-400 font-medium mb-2">No employer profile yet</p>
          <p className="text-gray-400 text-sm mb-4">
            Post your first job to automatically create your employer profile.
          </p>
          <Link href="/post-job" className="bg-yellow-400 text-gray-950 px-6 py-2 rounded-lg font-semibold text-sm hover:bg-yellow-300 transition-colors">
            Post a Job
          </Link>
        </div>
      )}
    </div>
  )
}

function DashboardJobRow({ job, expired = false }: { job: Record<string, unknown>; expired?: boolean }) {
  const expiresAt = job.expires_at ? new Date(job.expires_at as string) : null
  const daysLeft = expiresAt ? Math.max(0, Math.ceil((expiresAt.getTime() - Date.now()) / 86400000)) : 0
  const isFeatured = Boolean(job.is_featured)

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className="font-medium text-white truncate">{job.title as string}</h3>
          {isFeatured && (
            <span className="bg-yellow-400/20 text-yellow-400 text-xs px-2 py-0.5 rounded">Featured</span>
          )}
        </div>
        <p className="text-gray-500 text-sm mt-0.5">{job.location as string}</p>
      </div>
      <div className="flex items-center gap-3 flex-shrink-0">
        {!expired && (
          <span className={`text-xs px-2 py-1 rounded-full ${
            daysLeft <= 5 ? 'bg-red-900/40 text-red-400' : 'bg-gray-800 text-gray-400'
          }`}>
            {daysLeft}d left
          </span>
        )}
        <Link
          href={`/jobs/${job.id as string}`}
          className="text-xs text-gray-500 hover:text-white transition-colors"
          target="_blank"
        >
          View ↗
        </Link>
        {!expired && (
          <form action="/api/dashboard/deactivate" method="POST" className="inline">
            <input type="hidden" name="job_id" value={job.id as string} />
            <button className="text-xs text-gray-600 hover:text-red-400 transition-colors">
              Deactivate
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
