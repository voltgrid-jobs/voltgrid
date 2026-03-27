import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { JobCard } from '@/components/jobs/JobCard'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'My Account — VoltGrid Jobs' }

export default async function AccountPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  // Get saved jobs
  const { data: savedJobs } = await supabase
    .from('saved_jobs')
    .select('job_id, created_at, jobs(*)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(20)

  // Get active alerts
  const { data: alerts } = await supabase
    .from('job_alerts')
    .select('*')
    .eq('user_id', user.id)
    .eq('is_active', true)

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">My Account</h1>
          <p className="text-gray-500 text-sm mt-1">{user.email}</p>
        </div>
        <form action="/api/auth/signout" method="POST">
          <button className="text-sm text-gray-500 hover:text-gray-300 transition-colors">
            Sign out
          </button>
        </form>
      </div>

      {/* Saved Jobs */}
      <section className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">
            Saved Jobs ({savedJobs?.length ?? 0})
          </h2>
          <Link href="/jobs" className="text-yellow-400 text-sm hover:text-yellow-300">
            Browse more →
          </Link>
        </div>

        {savedJobs && savedJobs.length > 0 ? (
          <div className="flex flex-col gap-4">
            {savedJobs.map((s) => {
              const job = s.jobs as unknown
              if (!job) return null
              return <JobCard key={s.job_id} job={job as Parameters<typeof JobCard>[0]['job']} />
            })}
          </div>
        ) : (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 text-center">
            <p className="text-gray-500">No saved jobs yet.</p>
            <Link href="/jobs" className="text-yellow-400 text-sm hover:text-yellow-300 mt-2 inline-block">
              Browse jobs →
            </Link>
          </div>
        )}
      </section>

      {/* Job Alerts */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">
            Job Alerts ({alerts?.length ?? 0})
          </h2>
        </div>

        {alerts && alerts.length > 0 ? (
          <div className="flex flex-col gap-3">
            {alerts.map((alert) => (
              <div key={alert.id} className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <p className="text-white text-sm font-medium">
                    {alert.keywords || 'All jobs'}
                    {alert.location && ` · ${alert.location}`}
                    {alert.category && ` · ${alert.category}`}
                  </p>
                  <p className="text-gray-500 text-xs mt-0.5">{alert.frequency} digest</p>
                </div>
                <form action="/api/alerts/delete" method="POST">
                  <input type="hidden" name="alert_id" value={alert.id} />
                  <button className="text-xs text-gray-600 hover:text-red-400 transition-colors">
                    Remove
                  </button>
                </form>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 text-center">
            <p className="text-gray-500 mb-2">No job alerts set up.</p>
            <p className="text-gray-600 text-sm">Set up alerts from any job listing page.</p>
          </div>
        )}
      </section>
    </div>
  )
}
