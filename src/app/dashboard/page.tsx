import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { DashboardTabs } from './DashboardTabs'

export const metadata: Metadata = { title: 'Dashboard — VoltGrid Jobs' }

// ── Trade category → short badge label ──────────────────────────────────────
const TRADE_LABELS: Record<string, string> = {
  electrician:          'Electrician',
  plumber:              'Plumber',
  hvac:                 'HVAC',
  welder:               'Welder',
  carpenter:            'Carpenter',
  pipefitter:           'Pipefitter',
  ironworker:           'Ironworker',
  pipewelding:          'Pipe Welding',
  instrumentation:      'Instrumentation',
  millwright:           'Millwright',
  boilermaker:          'Boilermaker',
  rigger:               'Rigger',
  scaffolding:          'Scaffolding',
  concrete:             'Concrete',
  insulation:           'Insulation',
  sheet_metal:          'Sheet Metal',
  heavy_equipment:      'Heavy Equipment',
  general_labour:       'General Labour',
  safety:               'Safety',
  superintendent:       'Superintendent',
  project_manager:      'Project Manager',
  estimator:            'Estimator',
  foreman:              'Foreman',
  other:                'Trades',
  electrical:           'Electrical',
  low_voltage:          'Low Voltage',
  construction:         'Construction',
  project_management:   'Project Mgmt',
  operations:           'Operations',
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login?next=/dashboard')

  // ── Fetch employer data ────────────────────────────────────────────────────
  const { data: employer } = await supabase
    .from('employers')
    .select('*')
    .eq('user_id', user.id)
    .single()

  const { data: jobs } = employer
    ? await supabase
        .from('jobs')
        .select('*')
        .eq('employer_id', employer.id)
        .order('created_at', { ascending: false })
    : { data: [] }

  // ── Apply click counts ─────────────────────────────────────────────────────
  const clickMap: Record<string, number> = {}
  if (jobs && jobs.length > 0) {
    const adminClient = createAdminClient()
    const jobIds = jobs.map(j => j.id)
    const { data: clicks } = await adminClient
      .from('apply_clicks')
      .select('job_id')
      .in('job_id', jobIds)
    if (clicks) {
      for (const c of clicks) {
        clickMap[c.job_id] = (clickMap[c.job_id] ?? 0) + 1
      }
    }
  }

  // ── Credits ────────────────────────────────────────────────────────────────
  const { data: credits } = employer
    ? await supabase
        .from('employer_credits')
        .select('*')
        .eq('employer_id', employer.id)
        .single()
    : { data: null }

  // ── Job seeker data ────────────────────────────────────────────────────────
  const { data: savedJobs } = await supabase
    .from('saved_jobs')
    .select('job_id, created_at, jobs(*)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(20)

  const { data: alerts } = await supabase
    .from('job_alerts')
    .select('*')
    .eq('user_id', user.id)
    .eq('is_active', true)

  // ── Determine user type ────────────────────────────────────────────────────
  const isEmployer = employer !== null
  const isJobSeeker = (savedJobs && savedJobs.length > 0) || (alerts && alerts.length > 0)
  const isBoth = isEmployer && isJobSeeker

  // Determine default tab
  const params = await searchParams
  const requestedTab = params?.tab
  let defaultTab: 'postings' | 'searches'
  if (requestedTab === 'searches') {
    defaultTab = 'searches'
  } else if (requestedTab === 'postings') {
    defaultTab = 'postings'
  } else if (isEmployer) {
    defaultTab = 'postings'
  } else {
    defaultTab = 'searches'
  }

  // ── Employer stats ─────────────────────────────────────────────────────────
  const activeJobs  = jobs?.filter(j => j.is_active) ?? []
  const expiredJobs = jobs?.filter(j => !j.is_active) ?? []
  const postCredits = credits?.post_credits ?? 0
  const isPro       = credits?.is_pro ?? false
  const totalClicks = Object.values(clickMap).reduce((a, b) => a + b, 0)
  const bestJob = jobs && jobs.length > 0
    ? jobs.reduce((best, j) => (clickMap[j.id] ?? 0) >= (clickMap[best.id] ?? 0) ? j : best, jobs[0])
    : null
  const bestClicks = bestJob ? (clickMap[bestJob.id] ?? 0) : 0

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--fg)' }}>
            {employer ? employer.company_name : 'Dashboard'}
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--fg-faint)' }}>{user.email}</p>
        </div>
        <div className="flex items-center gap-3">
          {isPro ? (
            <span style={{
              background: 'var(--yellow-dim)',
              color: 'var(--yellow)',
              border: '1px solid var(--yellow-border)',
            }} className="text-xs font-semibold px-3 py-1 rounded-full">
              ⚡ Pro
            </span>
          ) : postCredits > 0 ? (
            <span style={{
              background: 'var(--bg-raised)',
              color: 'var(--fg-muted)',
              border: '1px solid var(--border)',
            }} className="text-xs px-3 py-1 rounded-full">
              {postCredits} post credit{postCredits !== 1 ? 's' : ''} remaining
            </span>
          ) : null}
          {isEmployer && (
            <Link
              href="/post-job"
              style={{ background: 'var(--yellow)', color: '#0D0D0D' }}
              className="px-4 py-2 rounded-lg font-semibold text-sm hover:opacity-90 transition-opacity"
            >
              + Post a Job
            </Link>
          )}
          <form action="/api/auth/signout" method="POST">
            <button
              className="text-xs px-3 py-2 rounded-lg hover:opacity-70 transition-opacity"
              style={{ color: 'var(--fg-muted)', border: '1px solid var(--border)' }}
            >
              Sign out
            </button>
          </form>
        </div>
      </div>

      {/* ── Tabs (only shown if both roles apply, or always to allow switching) */}
      <DashboardTabs
        defaultTab={defaultTab}
        showPostings={isEmployer}
        showSearches={true}
        // ── Postings tab content ──────────────────────────────────────────
        postingsContent={
          <div>
            {/* Summary stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10">
              <StatCard label="Active Listings" value={activeJobs.length} />
              <StatCard label="Total Posted"    value={jobs?.length ?? 0} />
              <StatCard
                label="Apply Clicks"
                value={totalClicks}
                highlight={totalClicks > 0}
                sub={totalClicks === 0 ? 'Tracking active' : 'all time'}
              />
              <StatCard
                label="Best Listing"
                value={bestJob ? (bestClicks > 0 ? `${bestClicks} clicks` : '—') : '—'}
                highlight={bestClicks > 0}
                sub={bestJob && bestClicks > 0 ? truncate(bestJob.title as string, 18) : undefined}
              />
            </div>

            {/* Active listings */}
            <section className="mb-10">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xs font-semibold tracking-wide uppercase" style={{ color: 'var(--fg-faint)', letterSpacing: '0.08em' }}>
                  Active Listings
                </h2>
                <span className="text-xs" style={{ color: 'var(--fg-faint)' }}>
                  {activeJobs.length} listing{activeJobs.length !== 1 ? 's' : ''}
                </span>
              </div>
              {activeJobs.length > 0 ? (
                <div className="flex flex-col gap-3">
                  {activeJobs.map(job => (
                    <JobStatsCard key={job.id} job={job} clicks={clickMap[job.id] ?? 0} />
                  ))}
                </div>
              ) : (
                <div style={{ background: 'var(--bg-raised)', border: '1px solid var(--border)' }} className="rounded-xl p-8 text-center">
                  <p className="text-sm mb-3" style={{ color: 'var(--fg-faint)' }}>No active listings yet.</p>
                  <Link href="/post-job" style={{ color: 'var(--yellow)' }} className="text-sm hover:opacity-80 transition-opacity">
                    Post your first job →
                  </Link>
                </div>
              )}
            </section>

            {/* Expired listings */}
            {expiredJobs.length > 0 && (
              <section className="mb-10">
                <h2 className="text-xs font-semibold tracking-wide uppercase mb-4" style={{ color: 'var(--fg-faint)', letterSpacing: '0.08em' }}>
                  Expired / Inactive
                </h2>
                <div className="flex flex-col gap-3 opacity-50">
                  {expiredJobs.map(job => (
                    <JobStatsCard key={job.id} job={job} clicks={clickMap[job.id] ?? 0} expired />
                  ))}
                </div>
              </section>
            )}

            {/* No employer profile */}
            {!employer && (
              <div style={{ background: 'var(--yellow-dim)', border: '1px solid var(--yellow-border)' }} className="rounded-xl p-6 text-center">
                <p className="font-medium mb-2" style={{ color: 'var(--yellow)' }}>No employer profile yet</p>
                <p className="text-sm mb-4" style={{ color: 'var(--fg-muted)' }}>
                  Post your first job to automatically create your employer profile.
                </p>
                <Link href="/post-job" style={{ background: 'var(--yellow)', color: '#0D0D0D' }}
                  className="inline-block px-6 py-2 rounded-lg font-semibold text-sm hover:opacity-90 transition-opacity">
                  Post a Job
                </Link>
              </div>
            )}

            <p className="text-xs text-center mt-8" style={{ color: 'var(--fg-faint)' }}>
              ⚡ Apply click tracking is live — data updates in real time as workers engage with your listings.
            </p>
          </div>
        }
        // ── Searches tab content ──────────────────────────────────────────
        searchesContent={
          <div>
            {/* Quick stats */}
            <div className="flex flex-wrap items-center gap-2 mb-8 p-4 rounded-xl" style={{ background: 'var(--bg-raised)', border: '1px solid var(--border)' }}>
              <span className="text-sm" style={{ color: 'var(--fg-muted)' }}>
                <span className="font-semibold" style={{ color: 'var(--fg)' }}>{savedJobs?.length ?? 0}</span> saved job{(savedJobs?.length ?? 0) !== 1 ? 's' : ''}
              </span>
              <span style={{ color: 'var(--fg-faint)' }}>·</span>
              <span className="text-sm" style={{ color: 'var(--fg-muted)' }}>
                <span className="font-semibold" style={{ color: 'var(--fg)' }}>{alerts?.length ?? 0}</span> active alert{(alerts?.length ?? 0) !== 1 ? 's' : ''}
              </span>
              <span style={{ color: 'var(--fg-faint)' }}>·</span>
              <span className="text-sm" style={{ color: 'var(--fg-faint)' }}>Last digest: not yet sent</span>
            </div>

            {/* Saved Jobs */}
            <section className="mb-10">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xs font-semibold tracking-wide uppercase" style={{ color: 'var(--fg-faint)', letterSpacing: '0.08em' }}>
                  Saved Jobs ({savedJobs?.length ?? 0})
                </h2>
              </div>
              {savedJobs && savedJobs.length > 0 ? (
                <div className="flex flex-col gap-3">
                  {savedJobs.map((s) => {
                    const job = (Array.isArray(s.jobs) ? s.jobs[0] : s.jobs) as Record<string, unknown> | null
                    if (!job) return null
                    const isActive = Boolean(job.is_active)
                    const expiresAt = job.expires_at ? new Date(job.expires_at as string) : null
                    const isExpired = expiresAt ? expiresAt < new Date() : !isActive
                    return (
                      <div key={s.job_id} style={{ background: 'var(--bg-raised)', border: '1px solid var(--border)' }}
                        className="rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-0.5">
                            <h3 className="font-semibold text-sm" style={{ color: 'var(--fg)' }}>{job.title as string}</h3>
                            {isExpired ? (
                              <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(239,68,68,0.12)', color: '#F87171', border: '1px solid rgba(239,68,68,0.2)' }}>
                                Expired
                              </span>
                            ) : (
                              <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'var(--green-dim)', color: 'var(--green)', border: '1px solid rgba(74,222,128,0.2)' }}>
                                Active
                              </span>
                            )}
                          </div>
                          <p className="text-xs" style={{ color: 'var(--fg-faint)' }}>
                            {job.company_name as string} · {job.location as string}
                          </p>
                        </div>
                        <div className="flex items-center gap-3 flex-shrink-0">
                          {!isExpired && (
                            <Link href={`/jobs/${s.job_id}`} className="text-xs hover:opacity-80 transition-opacity" style={{ color: 'var(--yellow)' }}>
                              View →
                            </Link>
                          )}
                          <form action="/api/saved-jobs/remove" method="POST" className="inline">
                            <input type="hidden" name="job_id" value={s.job_id} />
                            <button className="text-xs px-3 py-1.5 rounded-lg hover:text-red-400 transition-colors" style={{ color: 'var(--fg-muted)', border: '1px solid var(--border)' }}>
                              Remove
                            </button>
                          </form>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div style={{ background: 'var(--bg-raised)', border: '1px solid var(--border)' }} className="rounded-xl p-8 text-center">
                  <p className="text-sm mb-3" style={{ color: 'var(--fg-faint)' }}>No saved jobs yet.</p>
                  <Link href="/jobs" style={{ color: 'var(--yellow)' }} className="text-sm hover:opacity-80 transition-opacity">
                    Browse jobs →
                  </Link>
                </div>
              )}
            </section>

            {/* My Alerts */}
            <section className="mb-10">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xs font-semibold tracking-wide uppercase" style={{ color: 'var(--fg-faint)', letterSpacing: '0.08em' }}>
                  My Alerts ({alerts?.length ?? 0})
                </h2>
              </div>
              {alerts && alerts.length > 0 ? (
                <div className="flex flex-col gap-3">
                  {alerts.map((alert) => (
                    <div key={alert.id} style={{ background: 'var(--bg-raised)', border: '1px solid var(--border)' }}
                      className="rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium" style={{ color: 'var(--fg)' }}>
                          {alert.keywords || 'All jobs'}
                          {alert.location && ` · ${alert.location}`}
                          {alert.category && ` · ${alert.category}`}
                        </p>
                        <p className="text-xs mt-0.5" style={{ color: 'var(--fg-faint)' }}>{alert.frequency} digest</p>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <form action="/api/alerts/delete" method="POST" className="inline">
                          <input type="hidden" name="alert_id" value={alert.id} />
                          <button className="text-xs px-3 py-1.5 rounded-lg hover:text-red-400 transition-colors" style={{ color: 'var(--fg-muted)', border: '1px solid var(--border)' }}>
                            Delete
                          </button>
                        </form>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ background: 'var(--bg-raised)', border: '1px solid var(--border)' }} className="rounded-xl p-8 text-center">
                  <p className="text-sm mb-2" style={{ color: 'var(--fg-faint)' }}>No job alerts set up.</p>
                  <p className="text-xs" style={{ color: 'var(--fg-faint)' }}>Set up alerts from any job listing page.</p>
                </div>
              )}
            </section>

            {/* Browse CTA */}
            <div className="text-center mt-6">
              <Link href="/jobs" className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-sm transition-opacity hover:opacity-90"
                style={{ background: 'var(--yellow)', color: '#0D0D0D' }}>
                Browse more jobs →
              </Link>
            </div>
          </div>
        }
      />
    </div>
  )
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function truncate(s: string, n: number) {
  return s.length > n ? s.slice(0, n) + '…' : s
}

// ── Summary stat card ─────────────────────────────────────────────────────────
function StatCard({
  label,
  value,
  highlight = false,
  sub,
}: {
  label: string
  value: number | string
  highlight?: boolean
  sub?: string
}) {
  return (
    <div style={{ background: 'var(--bg-raised)', border: '1px solid var(--border)' }} className="rounded-xl p-4">
      <div className="text-2xl font-bold tabular-nums" style={{ color: highlight ? 'var(--yellow)' : 'var(--fg)' }}>
        {value}
      </div>
      <div className="text-xs mt-1" style={{ color: 'var(--fg-faint)' }}>{label}</div>
      {sub && <div className="text-xs mt-0.5 truncate" style={{ color: 'var(--fg-muted)' }}>{sub}</div>}
    </div>
  )
}

// ── Job stats card ────────────────────────────────────────────────────────────
function JobStatsCard({
  job,
  clicks,
  expired = false,
}: {
  job: Record<string, unknown>
  clicks: number
  expired?: boolean
}) {
  const expiresAt  = job.expires_at ? new Date(job.expires_at as string) : null
  const daysLeft   = expiresAt ? Math.ceil((expiresAt.getTime() - Date.now()) / 86400000) : null
  const isFeatured = Boolean(job.is_featured)
  const category   = (job.category as string) ?? ''
  const tradeLabel = TRADE_LABELS[category] ?? (category ? category : 'Trades')

  let daysStyle: React.CSSProperties = {}
  let daysText = ''
  if (expired || (daysLeft !== null && daysLeft <= 0)) {
    daysStyle = { background: 'rgba(239,68,68,0.12)', color: '#F87171', border: '1px solid rgba(239,68,68,0.2)' }
    daysText  = 'Expired'
  } else if (daysLeft !== null && daysLeft <= 5) {
    daysStyle = { background: 'rgba(251,191,36,0.12)', color: 'var(--yellow)', border: '1px solid var(--yellow-border)' }
    daysText  = 'Expires soon'
  } else if (daysLeft !== null) {
    daysStyle = { background: 'var(--green-dim)', color: 'var(--green)', border: '1px solid rgba(74,222,128,0.2)' }
    daysText  = `${daysLeft}d left`
  }

  return (
    <div style={{ background: 'var(--bg-raised)', border: '1px solid var(--border)' }}
      className="rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-4">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-1">
          <h3 className="font-semibold truncate" style={{ color: 'var(--fg)' }}>{job.title as string}</h3>
          {isFeatured && (
            <span style={{ background: 'var(--yellow-dim)', color: 'var(--yellow)', border: '1px solid var(--yellow-border)' }}
              className="text-xs px-2 py-0.5 rounded-full font-medium">
              ⚡ Featured
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm" style={{ color: 'var(--fg-faint)' }}>{job.location as string}</span>
          {tradeLabel && (
            <span style={{ background: 'var(--bg-subtle)', color: 'var(--fg-muted)', border: '1px solid var(--border)' }}
              className="text-xs px-2 py-0.5 rounded-full">
              {tradeLabel}
            </span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap flex-shrink-0">
        <span
          style={clicks > 0
            ? { background: 'var(--yellow-dim)', color: 'var(--yellow)', border: '1px solid var(--yellow-border)' }
            : { background: 'var(--bg-subtle)', color: 'var(--fg-faint)', border: '1px solid var(--border)' }
          }
          className="text-xs px-3 py-1 rounded-full font-medium whitespace-nowrap"
          title="Apply button clicks"
        >
          ⚡ {clicks} {clicks === 1 ? 'click' : 'clicks'}
        </span>
        {daysText && (
          <span style={daysStyle} className="text-xs px-3 py-1 rounded-full font-medium whitespace-nowrap">
            {daysText}
          </span>
        )}
        <Link href={`/jobs/${job.id as string}`} target="_blank" style={{ color: 'var(--fg-faint)' }}
          className="text-xs hover:opacity-80 transition-opacity whitespace-nowrap">
          View listing →
        </Link>
        {!expired && (
          <Link href="/post-job" style={{ color: 'var(--yellow)' }}
            className="text-xs hover:opacity-80 transition-opacity whitespace-nowrap"
            title="Boost this listing for more visibility">
            Boost ↑
          </Link>
        )}
        {!expired && (
          <form action="/api/dashboard/deactivate" method="POST" className="inline">
            <input type="hidden" name="job_id" value={job.id as string} />
            <button style={{ color: 'var(--fg-faint)' }} className="text-xs hover:text-red-400 transition-colors">
              Deactivate
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
