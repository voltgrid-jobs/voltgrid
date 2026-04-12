import { createAdminClient } from '@/lib/supabase/admin'
import { buildFunnelReport } from '@/lib/analytics/queries'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Website Metrics — Admin' }
export const dynamic = 'force-dynamic'

function pct(n: number) {
  return `${(n * 100).toFixed(1)}%`
}

function StatCard({
  label,
  value,
  sub,
  color = 'var(--fg)',
}: {
  label: string
  value: string | number
  sub?: string
  color?: string
}) {
  return (
    <div
      className="rounded-xl p-5"
      style={{ background: 'var(--bg-raised)', border: '1px solid var(--border)' }}
    >
      <p className="text-xs uppercase tracking-wide mb-1" style={{ color: 'var(--fg-faint)' }}>
        {label}
      </p>
      <p className="text-2xl font-bold" style={{ color }}>
        {value}
      </p>
      {sub && (
        <p className="text-xs mt-1" style={{ color: 'var(--fg-muted)' }}>
          {sub}
        </p>
      )}
    </div>
  )
}

function FunnelBar({
  label,
  value,
  max,
  color,
}: {
  label: string
  value: number
  max: number
  color: string
}) {
  const width = max > 0 ? Math.max((value / max) * 100, 2) : 0
  return (
    <div className="flex items-center gap-3 py-2">
      <span className="text-sm w-36 shrink-0" style={{ color: 'var(--fg-muted)' }}>
        {label}
      </span>
      <div className="flex-1 h-7 rounded-md overflow-hidden" style={{ background: 'var(--bg)' }}>
        <div
          className="h-full rounded-md flex items-center px-2"
          style={{ width: `${width}%`, background: color, minWidth: value > 0 ? 32 : 0 }}
        >
          <span className="text-xs font-bold" style={{ color: '#0A0A0A' }}>
            {value}
          </span>
        </div>
      </div>
    </div>
  )
}

export default async function MetricsPage() {
  const now = new Date()
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

  const [report7d, report30d] = await Promise.all([
    buildFunnelReport({ from: sevenDaysAgo.toISOString(), to: now.toISOString() }),
    buildFunnelReport({ from: thirtyDaysAgo.toISOString(), to: now.toISOString() }),
  ])

  // Source breakdown — which forms drive signups
  const admin = createAdminClient()
  const { data: sourceBreakdown } = await admin
    .from('funnel_events')
    .select('metadata')
    .eq('event_type', 'alert_submit')
    .gte('created_at', thirtyDaysAgo.toISOString())
    .lte('created_at', now.toISOString())

  const sourceCounts: Record<string, number> = {}
  for (const row of sourceBreakdown ?? []) {
    const meta = row.metadata as Record<string, unknown> | null
    const outcome = meta?.outcome as string | undefined
    if (outcome === 'already_subscribed') continue
    const page = (row as Record<string, unknown>).source_page as string | undefined
    const key = page || 'unknown'
    sourceCounts[key] = (sourceCounts[key] || 0) + 1
  }

  // Actually query source_page directly
  const { data: sourceRows } = await admin
    .from('funnel_events')
    .select('source_page')
    .eq('event_type', 'alert_submit')
    .gte('created_at', thirtyDaysAgo.toISOString())
    .lte('created_at', now.toISOString())

  const srcCounts: Record<string, number> = {}
  for (const row of sourceRows ?? []) {
    const key = (row.source_page as string) || 'unknown'
    srcCounts[key] = (srcCounts[key] || 0) + 1
  }
  const sortedSources = Object.entries(srcCounts).sort((a, b) => b[1] - a[1])

  // Subscriber totals
  const [
    { count: totalSubscribers },
    { count: confirmedSubscribers },
    { count: activeSubscribers },
  ] = await Promise.all([
    admin.from('job_alerts').select('*', { count: 'exact', head: true }),
    admin.from('job_alerts').select('*', { count: 'exact', head: true }).not('confirmed_at', 'is', null),
    admin.from('job_alerts').select('*', { count: 'exact', head: true }).eq('is_active', true).not('confirmed_at', 'is', null),
  ])

  // Apply clicks (last 30 days)
  const { count: applyClicks30d } = await admin
    .from('apply_clicks')
    .select('*', { count: 'exact', head: true })
    .gte('clicked_at', thirtyDaysAgo.toISOString())

  // Active jobs
  const { count: activeJobs } = await admin
    .from('jobs')
    .select('*', { count: 'exact', head: true })
    .eq('is_active', true)

  // Daily signups over last 14 days for sparkline
  const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)
  const { data: dailySignups } = await admin
    .from('funnel_events')
    .select('created_at')
    .eq('event_type', 'alert_submit')
    .gte('created_at', fourteenDaysAgo.toISOString())

  const dailyCounts: Record<string, number> = {}
  for (let i = 0; i < 14; i++) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
    dailyCounts[d.toISOString().slice(0, 10)] = 0
  }
  for (const row of dailySignups ?? []) {
    const day = (row.created_at as string).slice(0, 10)
    if (dailyCounts[day] !== undefined) dailyCounts[day]++
  }
  const dailyData = Object.entries(dailyCounts).sort().map(([date, count]) => ({ date, count }))

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1
          className="text-2xl font-bold"
          style={{ color: 'var(--fg)', fontFamily: 'var(--font-display), system-ui, sans-serif' }}
        >
          Website Metrics
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--fg-muted)' }}>
          Real-time performance data for voltgridjobs.com
        </p>
      </div>

      {/* ── Top-level KPIs ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-10">
        <StatCard label="Active Jobs" value={activeJobs ?? 0} color="var(--yellow)" />
        <StatCard label="Total Subscribers" value={totalSubscribers ?? 0} />
        <StatCard
          label="Confirmed"
          value={confirmedSubscribers ?? 0}
          sub={totalSubscribers ? `${pct((confirmedSubscribers ?? 0) / totalSubscribers)} confirm rate` : undefined}
          color="var(--green)"
        />
        <StatCard label="Active Alerts" value={activeSubscribers ?? 0} color="var(--green)" />
        <StatCard label="Apply Clicks (30d)" value={applyClicks30d ?? 0} />
      </div>

      {/* ── 7-day vs 30-day toggle cards ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
        {/* 7-day funnel */}
        <div
          className="rounded-xl p-6"
          style={{ background: 'var(--bg-raised)', border: '1px solid var(--border)' }}
        >
          <h2 className="text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: 'var(--yellow)' }}>
            Last 7 Days
          </h2>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div>
              <p className="text-xs" style={{ color: 'var(--fg-faint)' }}>Signups</p>
              <p className="text-xl font-bold" style={{ color: 'var(--fg)' }}>{report7d.alertSubmits}</p>
            </div>
            <div>
              <p className="text-xs" style={{ color: 'var(--fg-faint)' }}>Confirmed</p>
              <p className="text-xl font-bold" style={{ color: 'var(--green)' }}>{report7d.alertConfirms}</p>
            </div>
            <div>
              <p className="text-xs" style={{ color: 'var(--fg-faint)' }}>Emails Delivered</p>
              <p className="text-xl font-bold" style={{ color: 'var(--fg)' }}>{report7d.alertsDelivered}</p>
            </div>
            <div>
              <p className="text-xs" style={{ color: 'var(--fg-faint)' }}>Emails Opened</p>
              <p className="text-xl font-bold" style={{ color: 'var(--fg)' }}>{report7d.alertsOpened}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 pt-3" style={{ borderTop: '1px solid var(--border)' }}>
            <div>
              <p className="text-xs" style={{ color: 'var(--fg-faint)' }}>SERP Landings</p>
              <p className="text-lg font-bold" style={{ color: 'var(--fg)' }}>{report7d.serpLandings}</p>
            </div>
            <div>
              <p className="text-xs" style={{ color: 'var(--fg-faint)' }}>Salary Guide Views</p>
              <p className="text-lg font-bold" style={{ color: 'var(--fg)' }}>{report7d.salaryGuideViews}</p>
            </div>
            <div>
              <p className="text-xs" style={{ color: 'var(--fg-faint)' }}>CTA Impressions</p>
              <p className="text-lg font-bold" style={{ color: 'var(--fg)' }}>{report7d.ctaImpressions}</p>
            </div>
            <div>
              <p className="text-xs" style={{ color: 'var(--fg-faint)' }}>Unsubscribes</p>
              <p className="text-lg font-bold" style={{ color: report7d.unsubscribes > 0 ? '#F87171' : 'var(--fg)' }}>
                {report7d.unsubscribes}
              </p>
            </div>
          </div>
        </div>

        {/* 30-day funnel */}
        <div
          className="rounded-xl p-6"
          style={{ background: 'var(--bg-raised)', border: '1px solid var(--border)' }}
        >
          <h2 className="text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: 'var(--yellow)' }}>
            Last 30 Days
          </h2>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div>
              <p className="text-xs" style={{ color: 'var(--fg-faint)' }}>Signups</p>
              <p className="text-xl font-bold" style={{ color: 'var(--fg)' }}>{report30d.alertSubmits}</p>
            </div>
            <div>
              <p className="text-xs" style={{ color: 'var(--fg-faint)' }}>Confirmed</p>
              <p className="text-xl font-bold" style={{ color: 'var(--green)' }}>{report30d.alertConfirms}</p>
            </div>
            <div>
              <p className="text-xs" style={{ color: 'var(--fg-faint)' }}>Emails Delivered</p>
              <p className="text-xl font-bold" style={{ color: 'var(--fg)' }}>{report30d.alertsDelivered}</p>
            </div>
            <div>
              <p className="text-xs" style={{ color: 'var(--fg-faint)' }}>Emails Opened</p>
              <p className="text-xl font-bold" style={{ color: 'var(--fg)' }}>{report30d.alertsOpened}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 pt-3" style={{ borderTop: '1px solid var(--border)' }}>
            <div>
              <p className="text-xs" style={{ color: 'var(--fg-faint)' }}>SERP Landings</p>
              <p className="text-lg font-bold" style={{ color: 'var(--fg)' }}>{report30d.serpLandings}</p>
            </div>
            <div>
              <p className="text-xs" style={{ color: 'var(--fg-faint)' }}>Salary Guide Views</p>
              <p className="text-lg font-bold" style={{ color: 'var(--fg)' }}>{report30d.salaryGuideViews}</p>
            </div>
            <div>
              <p className="text-xs" style={{ color: 'var(--fg-faint)' }}>CTA Impressions</p>
              <p className="text-lg font-bold" style={{ color: 'var(--fg)' }}>{report30d.ctaImpressions}</p>
            </div>
            <div>
              <p className="text-xs" style={{ color: 'var(--fg-faint)' }}>Unsubscribes</p>
              <p className="text-lg font-bold" style={{ color: report30d.unsubscribes > 0 ? '#F87171' : 'var(--fg)' }}>
                {report30d.unsubscribes}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Conversion Funnel (30d) ── */}
      <div
        className="rounded-xl p-6 mb-10"
        style={{ background: 'var(--bg-raised)', border: '1px solid var(--border)' }}
      >
        <h2 className="text-xs font-semibold tracking-widest uppercase mb-1" style={{ color: 'var(--yellow)' }}>
          Conversion Funnel — 30 Days
        </h2>
        <p className="text-xs mb-4" style={{ color: 'var(--fg-faint)' }}>
          From search engine landing to email click
        </p>

        <FunnelBar label="SERP Landings" value={report30d.serpLandings} max={report30d.serpLandings} color="var(--fg-muted)" />
        <FunnelBar label="CTA Impressions" value={report30d.ctaImpressions} max={report30d.serpLandings || report30d.ctaImpressions} color="#60A5FA" />
        <FunnelBar label="Alert Signups" value={report30d.alertSubmits} max={report30d.serpLandings || report30d.ctaImpressions || report30d.alertSubmits} color="var(--yellow)" />
        <FunnelBar label="Confirmed" value={report30d.alertConfirms} max={report30d.serpLandings || report30d.ctaImpressions || report30d.alertSubmits} color="var(--green)" />
        <FunnelBar label="Emails Delivered" value={report30d.alertsDelivered} max={report30d.serpLandings || report30d.ctaImpressions || report30d.alertsDelivered} color="#A78BFA" />
        <FunnelBar label="Emails Opened" value={report30d.alertsOpened} max={report30d.serpLandings || report30d.ctaImpressions || report30d.alertsDelivered} color="#F472B6" />
        <FunnelBar label="Emails Clicked" value={report30d.alertsClicked} max={report30d.serpLandings || report30d.ctaImpressions || report30d.alertsDelivered} color="#34D399" />

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-6 pt-4" style={{ borderTop: '1px solid var(--border)' }}>
          <div className="text-center">
            <p className="text-xs" style={{ color: 'var(--fg-faint)' }}>Submit → Confirm</p>
            <p className="text-lg font-bold" style={{ color: report30d.rates.submitConfirmRate > 0.3 ? 'var(--green)' : 'var(--yellow)' }}>
              {pct(report30d.rates.submitConfirmRate)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs" style={{ color: 'var(--fg-faint)' }}>Delivered → Open</p>
            <p className="text-lg font-bold" style={{ color: report30d.rates.deliveredOpenRate > 0.3 ? 'var(--green)' : 'var(--yellow)' }}>
              {pct(report30d.rates.deliveredOpenRate)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs" style={{ color: 'var(--fg-faint)' }}>Open → Click</p>
            <p className="text-lg font-bold" style={{ color: report30d.rates.openClickRate > 0.1 ? 'var(--green)' : 'var(--yellow)' }}>
              {pct(report30d.rates.openClickRate)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs" style={{ color: 'var(--fg-faint)' }}>Salary Guide CTA</p>
            <p className="text-lg font-bold" style={{ color: 'var(--fg)' }}>
              {pct(report30d.rates.salaryGuideCtaRate)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs" style={{ color: 'var(--fg-faint)' }}>Unsubscribe Rate</p>
            <p className="text-lg font-bold" style={{ color: report30d.rates.unsubscribeRate > 0.05 ? '#F87171' : 'var(--green)' }}>
              {pct(report30d.rates.unsubscribeRate)}
            </p>
          </div>
        </div>
      </div>

      {/* ── Signup Source Breakdown (30d) ── */}
      <div
        className="rounded-xl p-6 mb-10"
        style={{ background: 'var(--bg-raised)', border: '1px solid var(--border)' }}
      >
        <h2 className="text-xs font-semibold tracking-widest uppercase mb-1" style={{ color: 'var(--yellow)' }}>
          Signup Sources — 30 Days
        </h2>
        <p className="text-xs mb-4" style={{ color: 'var(--fg-faint)' }}>
          Which forms and pages drive the most email signups
        </p>

        {sortedSources.length === 0 ? (
          <p className="text-sm" style={{ color: 'var(--fg-muted)' }}>No source data yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <th className="text-left py-2 font-medium" style={{ color: 'var(--fg-faint)' }}>Source</th>
                <th className="text-right py-2 font-medium" style={{ color: 'var(--fg-faint)' }}>Signups</th>
                <th className="text-right py-2 font-medium" style={{ color: 'var(--fg-faint)' }}>Share</th>
              </tr>
            </thead>
            <tbody>
              {sortedSources.map(([source, count]) => {
                const total = sortedSources.reduce((s, [, c]) => s + c, 0)
                return (
                  <tr key={source} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td className="py-2 font-mono text-xs" style={{ color: 'var(--fg)' }}>{source}</td>
                    <td className="py-2 text-right font-semibold" style={{ color: 'var(--fg)' }}>{count}</td>
                    <td className="py-2 text-right" style={{ color: 'var(--fg-muted)' }}>{pct(count / total)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Daily Signups (14d) ── */}
      <div
        className="rounded-xl p-6 mb-10"
        style={{ background: 'var(--bg-raised)', border: '1px solid var(--border)' }}
      >
        <h2 className="text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: 'var(--yellow)' }}>
          Daily Signups — Last 14 Days
        </h2>

        <div className="flex items-end gap-1" style={{ height: 120 }}>
          {dailyData.map(({ date, count }) => {
            const maxCount = Math.max(...dailyData.map((d) => d.count), 1)
            const height = Math.max((count / maxCount) * 100, 4)
            return (
              <div key={date} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-[10px] font-semibold" style={{ color: count > 0 ? 'var(--fg)' : 'var(--fg-faint)' }}>
                  {count || ''}
                </span>
                <div
                  className="w-full rounded-sm"
                  style={{
                    height: `${height}%`,
                    background: count > 0 ? 'var(--yellow)' : 'var(--border)',
                    minHeight: 4,
                  }}
                />
                <span className="text-[9px]" style={{ color: 'var(--fg-faint)' }}>
                  {date.slice(5)}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Quick links ── */}
      <div className="flex gap-3 text-sm">
        <a
          href="/admin/apply-stats"
          className="px-4 py-2 rounded-lg transition-opacity hover:opacity-90"
          style={{ background: 'var(--bg-raised)', border: '1px solid var(--border)', color: 'var(--fg-muted)' }}
        >
          Apply Click Stats →
        </a>
        <a
          href="/dashboard"
          className="px-4 py-2 rounded-lg transition-opacity hover:opacity-90"
          style={{ background: 'var(--bg-raised)', border: '1px solid var(--border)', color: 'var(--fg-muted)' }}
        >
          Dashboard →
        </a>
      </div>
    </div>
  )
}
