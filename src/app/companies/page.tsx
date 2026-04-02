export const dynamic = 'force-dynamic'

import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { CompanyLogo } from '@/components/employers/CompanyLogo'
import { getLogoUrl, getDomain } from '@/lib/company-logos'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Companies Hiring Data Center Trades Workers',
  description:
    'Browse companies actively hiring electricians, HVAC techs, and low voltage specialists for data center and AI infrastructure projects.',
  alternates: { canonical: 'https://voltgridjobs.com/companies' },
  openGraph: {
    title: 'Companies Hiring Data Center Trades Workers',
    description:
      'Hyperscale operators, contractors, and staffing firms actively hiring trades workers for data center projects.',
    type: 'website',
  },
}

function slugify(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

export default async function CompaniesPage() {
  let companies: { name: string; count: number; slug: string; logoUrl: string | null; domain: string | null; trades: string[] }[] = []

  try {
    const supabase = await createClient()

    const { data: jobs } = await supabase
      .from('jobs')
      .select('company_name, category')
      .eq('is_active', true)
      .not('company_name', 'is', null)

    // Aggregate job counts per company
    const counts = new Map<string, number>()
    const categories = new Map<string, Set<string>>()
    for (const job of jobs ?? []) {
      if (!job.company_name) continue
      counts.set(job.company_name, (counts.get(job.company_name) ?? 0) + 1)
      if (job.category) {
        if (!categories.has(job.company_name)) categories.set(job.company_name, new Set())
        categories.get(job.company_name)!.add(job.category)
      }
    }

    companies = [...counts.entries()]
      .filter(([, count]) => count >= 1)
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => ({
        name,
        count,
        slug: slugify(name),
        logoUrl: getLogoUrl(name),
        domain: getDomain(name),
        trades: [...(categories.get(name) ?? [])],
      }))
  } catch (err) {
    console.error('[CompaniesPage] Supabase error:', err)
    // Render empty state — no 500
  }

  const TRADE_LABELS: Record<string, string> = {
    electrical: 'Electrical',
    hvac: 'HVAC',
    low_voltage: 'Low Voltage',
    construction: 'Construction',
    project_management: 'Project Mgmt',
    operations: 'Operations',
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
      {/* Breadcrumb */}
      <p className="text-sm mb-6" style={{ color: 'var(--fg-faint)' }}>
        <Link href="/" style={{ color: 'var(--fg-faint)' }} className="hover:text-yellow-400 transition-colors">Home</Link>
        {' '}/{' '}
        <span style={{ color: 'var(--fg-muted)' }}>Companies</span>
      </p>

      <div className="mb-10">
        <h1
          className="mb-3 leading-tight"
          style={{
            fontFamily: 'var(--font-display), system-ui, sans-serif',
            fontSize: 'clamp(1.75rem, 5vw, 2.75rem)',
            fontWeight: 800,
            color: 'var(--fg)',
            letterSpacing: '-0.01em',
          }}
        >
          Companies hiring trades workers
        </h1>
        <p className="text-base" style={{ color: 'var(--fg-muted)', lineHeight: 1.6, maxWidth: '600px' }}>
          Hyperscale operators, general contractors, colocation providers, and staffing firms with open roles on VoltGrid.
        </p>
      </div>

      {companies.length === 0 ? (
        <p style={{ color: 'var(--fg-muted)' }}>No companies with active listings right now. Check back soon.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {companies.map(({ name, count, slug, logoUrl, domain, trades }) => (
            <Link
              key={name}
              href={`/companies/${slug}`}
              className="group rounded-xl p-5 flex flex-col gap-3 transition-colors"
              style={{ background: 'var(--bg-raised)', border: '1px solid var(--border)' }}
            >
              <div className="flex items-center gap-3">
                {domain ? (
                  <div style={{ width: 32, height: 32, flexShrink: 0 }}>
                    <CompanyLogo name={name} logoUrl={logoUrl} domain={domain} />
                  </div>
                ) : (
                  <div
                    className="w-8 h-8 rounded flex items-center justify-center text-xs font-bold flex-shrink-0"
                    style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--fg-muted)' }}
                  >
                    {name[0].toUpperCase()}
                  </div>
                )}
                <p className="font-semibold text-sm leading-tight group-hover:text-yellow-400 transition-colors" style={{ color: 'var(--fg)' }}>
                  {name}
                </p>
              </div>

              <div className="flex items-center justify-between">
                <p className="text-xs" style={{ color: 'var(--fg-faint)' }}>
                  {count} open {count === 1 ? 'role' : 'roles'}
                </p>
                {trades.length > 0 && (
                  <div className="flex flex-wrap gap-1 justify-end">
                    {trades.slice(0, 2).map(t => (
                      <span
                        key={t}
                        className="text-xs px-1.5 py-0.5 rounded"
                        style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--fg-faint)' }}
                      >
                        {TRADE_LABELS[t] ?? t}
                      </span>
                    ))}
                    {trades.length > 2 && (
                      <span className="text-xs" style={{ color: 'var(--fg-faint)' }}>+{trades.length - 2}</span>
                    )}
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}

      <div className="mt-12 rounded-xl px-6 py-6 text-center" style={{ background: 'var(--bg-raised)', border: '1px solid var(--border)' }}>
        <p className="font-semibold mb-2" style={{ color: 'var(--fg)' }}>Are you hiring?</p>
        <p className="text-sm mb-4" style={{ color: 'var(--fg-muted)' }}>
          Post your open roles and reach electricians, HVAC techs, and low voltage specialists who know what a data center is.
        </p>
        <Link
          href="/post-job"
          className="inline-block font-bold px-6 py-3 rounded-xl transition-colors"
          style={{ background: 'var(--yellow)', color: '#0A0A0A' }}
        >
          Post a job from $149 →
        </Link>
      </div>
    </div>
  )
}
