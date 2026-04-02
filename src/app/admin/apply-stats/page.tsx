import { createAdminClient } from '@/lib/supabase/admin'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Apply Click Stats — VoltGrid Admin' }

// Force dynamic rendering — admin page, not pre-renderable at build time
export const dynamic = 'force-dynamic'

interface ClickRow {
  job_id: string
  total_clicks: number
  top_button_clicks: number
  bottom_button_clicks: number
  last_click: string
  job_title: string
  company_name: string
  is_active: boolean
}

export default async function ApplyStatsPage() {
  const supabase = createAdminClient()

  // Aggregate clicks per job, joined with job details
  const { data: rows, error } = await supabase.rpc('apply_click_stats')

  // Fallback: if the RPC doesn't exist yet, fetch raw and aggregate in JS
  let stats: ClickRow[] = []
  if (error || !rows) {
    const { data: clicks } = await supabase
      .from('apply_clicks')
      .select('job_id, source, clicked_at')
      .order('clicked_at', { ascending: false })

    const { data: jobs } = await supabase
      .from('jobs')
      .select('id, title, company_name, is_active')

    const jobMap = Object.fromEntries((jobs ?? []).map((j: { id: string; title: string; company_name: string; is_active: boolean }) => [j.id, j]))
    const agg: Record<string, ClickRow> = {}

    for (const c of clicks ?? []) {
      if (!agg[c.job_id]) {
        const job = jobMap[c.job_id] ?? { title: '(deleted)', company_name: '—', is_active: false }
        agg[c.job_id] = {
          job_id: c.job_id,
          total_clicks: 0,
          top_button_clicks: 0,
          bottom_button_clicks: 0,
          last_click: c.clicked_at,
          job_title: job.title,
          company_name: job.company_name,
          is_active: job.is_active,
        }
      }
      agg[c.job_id].total_clicks++
      if (c.source === 'top_button') agg[c.job_id].top_button_clicks++
      if (c.source === 'bottom_button') agg[c.job_id].bottom_button_clicks++
    }

    stats = Object.values(agg).sort((a, b) => b.total_clicks - a.total_clicks)
  } else {
    stats = rows as ClickRow[]
  }

  const totalClicks = stats.reduce((sum, r) => sum + r.total_clicks, 0)

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Apply Click Stats</h1>
        <p className="text-gray-400 mt-1">
          Every time a job seeker clicks Apply, it shows up here.
        </p>
      </div>

      {/* Summary card */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <p className="text-gray-500 text-xs uppercase tracking-wide mb-1">Total Apply Clicks</p>
          <p className="text-3xl font-bold text-yellow-400">{totalClicks.toLocaleString()}</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <p className="text-gray-500 text-xs uppercase tracking-wide mb-1">Jobs with Clicks</p>
          <p className="text-3xl font-bold text-white">{stats.length}</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <p className="text-gray-500 text-xs uppercase tracking-wide mb-1">Avg Clicks / Job</p>
          <p className="text-3xl font-bold text-white">
            {stats.length ? (totalClicks / stats.length).toFixed(1) : '—'}
          </p>
        </div>
      </div>

      {stats.length === 0 ? (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-10 text-center text-gray-500">
          No apply clicks recorded yet. They&apos;ll appear here as job seekers start clicking.
        </div>
      ) : (
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800 text-gray-500 text-xs uppercase tracking-wide">
                <th className="text-left px-5 py-3">Job</th>
                <th className="text-left px-4 py-3 hidden sm:table-cell">Company</th>
                <th className="text-right px-4 py-3">Total</th>
                <th className="text-right px-4 py-3 hidden md:table-cell">Top</th>
                <th className="text-right px-4 py-3 hidden md:table-cell">Bottom</th>
                <th className="text-right px-5 py-3 hidden sm:table-cell">Last Click</th>
              </tr>
            </thead>
            <tbody>
              {stats.map((row, i) => (
                <tr
                  key={row.job_id}
                  className={`border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors ${
                    !row.is_active ? 'opacity-50' : ''
                  }`}
                >
                  <td className="px-5 py-3">
                    <a
                      href={`/jobs/${row.job_id}`}
                      className="text-white hover:text-yellow-400 transition-colors font-medium"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {row.job_title}
                    </a>
                    {!row.is_active && (
                      <span className="ml-2 text-xs text-gray-600">(inactive)</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-400 hidden sm:table-cell">
                    {row.company_name}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="text-yellow-400 font-bold text-base">
                      {row.total_clicks}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-gray-400 hidden md:table-cell">
                    {row.top_button_clicks}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-400 hidden md:table-cell">
                    {row.bottom_button_clicks}
                  </td>
                  <td className="px-5 py-3 text-right text-gray-500 hidden sm:table-cell">
                    {new Date(row.last_click).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="text-gray-600 text-xs mt-4 text-center">
        Refreshes every 5 minutes · Only visible at /admin/apply-stats
      </p>
    </div>
  )
}
