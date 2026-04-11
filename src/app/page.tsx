export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { JobCard } from '@/components/jobs/JobCard'
import { CATEGORY_LABELS, type JobCategory } from '@/types'
import { LogoCarousel } from '@/components/LogoCarousel'
import { CompactHeroSignup } from '@/components/jobs/CompactHeroSignup'

const CATEGORIES: { key: JobCategory; label: string }[] = [
  { key: 'electrical',          label: 'Electrical' },
  { key: 'hvac',                label: 'HVAC' },
  { key: 'low_voltage',         label: 'Low Voltage' },
  { key: 'construction',        label: 'Construction' },
  { key: 'project_management',  label: 'Project Mgmt' },
  { key: 'operations',          label: 'Operations' },
]

export default async function HomePage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let featuredJobs: any[] | null = null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let recentJobs: any[] | null = null
  let totalJobs: number | null = null
  let distinctCompanies = 0
  let jobsThisWeek: number | null = null
  let alertSubscribers: number | null = null
  let electricalJobsCount: number | null = null

  try {
    const supabase = await createClient()

    const [
      { data: featured },
      { data: recent },
      { count: total },
      { data: companiesData },
    ] = await Promise.all([
      supabase.from('jobs').select('*').eq('is_active', true).eq('is_featured', true)
        .order('created_at', { ascending: false }).limit(3),
      supabase.from('jobs').select('*').eq('is_active', true)
        .order('created_at', { ascending: false }).limit(9),
      supabase.from('jobs').select('*', { count: 'exact', head: true }).eq('is_active', true),
      supabase.from('jobs').select('company_name').eq('is_active', true),
    ])

    featuredJobs = featured
    recentJobs = recent
    totalJobs = total
    distinctCompanies = companiesData
      ? new Set(companiesData.map((j) => j.company_name)).size
      : 0

    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    const [
      { count: thisWeek },
      { count: alertSubs },
      { count: electricalCount },
    ] = await Promise.all([
      supabase.from('jobs').select('*', { count: 'exact', head: true }).eq('is_active', true).gte('created_at', oneWeekAgo),
      supabase.from('job_alerts').select('*', { count: 'exact', head: true }),
      supabase.from('jobs').select('*', { count: 'exact', head: true }).eq('is_active', true).eq('category', 'electrical'),
    ])
    jobsThisWeek = thisWeek
    alertSubscribers = alertSubs
    electricalJobsCount = electricalCount
  } catch (err) {
    console.error('[HomePage] Supabase error:', err)
    // Page renders with fallback zeros — no 500
  }

  const orgSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'VoltGrid Jobs',
    url: 'https://voltgridjobs.com',
    logo: 'https://voltgridjobs.com/voltgrid-logo-horizontal.png',
    description: 'Niche job board for data center electricians, HVAC technicians, and low-voltage specialists.',
    sameAs: [
      'https://twitter.com/VoltGridJobs',
      'https://www.linkedin.com/company/voltgrid-jobs',
    ],
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }} />
    <div>
      {/* HERO */}
      <section style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-20 sm:py-28">
          <div className="max-w-3xl">
            <div
              className="inline-flex items-center gap-2 text-xs font-semibold tracking-widest uppercase px-3 py-1.5 rounded-full mb-8 animate-fade-up"
              style={{ background: 'var(--yellow-dim)', color: 'var(--yellow)', border: '1px solid var(--yellow-border)' }}
            >
              <span>⚡</span>
              <span>The AI infrastructure build-out is hiring trades workers now</span>
            </div>

            <h1
              className="animate-fade-up delay-100 leading-none mb-6"
              style={{
                fontFamily: 'var(--font-display), system-ui, sans-serif',
                fontSize: 'clamp(2.5rem, 7vw, 5rem)',
                fontWeight: 800,
                letterSpacing: '-0.01em',
                color: 'var(--fg)',
              }}
            >
              Fill Your Data Center<br />
              <span style={{ color: 'var(--yellow)' }}>Trades Roles Faster.</span>
            </h1>

            <p className="text-lg sm:text-xl mb-6 max-w-xl animate-fade-up delay-200" style={{ color: 'var(--fg-muted)', lineHeight: 1.6 }}>
              VoltGrid connects you with electricians, HVAC techs, and low voltage techs pre-qualified for AI data center work. Post a job and reach hundreds of trades workers actively looking for data center roles.
            </p>

            {/* Trust stats row */}
            <div className="flex flex-wrap items-center gap-2 mb-10 animate-fade-up delay-250">
              <div
                className="inline-flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-full"
                style={{ background: 'var(--bg-raised)', border: '1px solid var(--border)', color: 'var(--fg)' }}
              >
                <span style={{ color: 'var(--yellow)' }}>⚡</span>
                <span>{totalJobs ?? 0} jobs</span>
              </div>
              <span style={{ color: 'var(--fg-faint)' }}>·</span>
              <div
                className="inline-flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-full"
                style={{ background: 'var(--bg-raised)', border: '1px solid var(--border)', color: 'var(--fg)' }}
              >
                <span>🏢</span>
                <span>{distinctCompanies} companies hiring</span>
              </div>
              {jobsThisWeek != null && totalJobs != null && jobsThisWeek < totalJobs * 0.8 && jobsThisWeek > 0 && (
                <>
                  <span style={{ color: 'var(--fg-faint)' }}>·</span>
                  <div
                    className="inline-flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-full"
                    style={{ background: 'var(--bg-raised)', border: '1px solid var(--border)', color: 'var(--fg)' }}
                  >
                    <span style={{ color: 'var(--green)' }}>↑</span>
                    <span>{jobsThisWeek} added this week</span>
                  </div>
                </>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 animate-fade-up delay-300">
              <Link
                href="/jobs"
                className="px-8 py-4 rounded-xl font-semibold text-lg transition-opacity"
                style={{ background: 'var(--yellow)', color: '#0A0A0A' }}
              >
                Browse All Jobs
              </Link>
              <Link
                href="/post-job"
                className="px-8 py-4 rounded-xl font-semibold text-lg transition-colors"
                style={{ border: '1px solid var(--border-strong)', color: 'var(--fg-muted)' }}
              >
                Hire Trades Workers →
              </Link>
            </div>

            {/* Hero CTA capture — primary conversion path */}
            <div className="mt-8 animate-fade-up delay-400" style={{ maxWidth: '540px' }}>
              <CompactHeroSignup
                source="homepage-hero"
                defaultTrade="electrical"
                headline="Post a job — reach trades workers today."
                subtext="Targeted reach to electricians, HVAC, and low voltage techs actively seeking data center roles."
                trustLine={
                  electricalJobsCount && electricalJobsCount > 0
                    ? `${electricalJobsCount} live electrical roles posted now on VoltGrid.`
                    : undefined
                }
              />
            </div>
          </div>
        </div>
      </section>

      {/* COMPANY LOGO BAR — auto-scrolling carousel */}
      <LogoCarousel label="Open Roles From" />

      {/* CATEGORIES */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <h2 className="text-xs font-semibold tracking-widest uppercase mb-6" style={{ color: 'var(--fg-faint)' }}>
          Browse by Trade
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {CATEGORIES.map(({ key, label }) => (
            <Link
              key={key}
              href={`/jobs?category=${key}`}
              className="rounded-xl p-4 text-center transition-all group"
              style={{ background: 'var(--bg-raised)', border: '1px solid var(--border)' }}
            >
              <div className="text-sm font-semibold transition-colors" style={{ color: 'var(--fg-muted)' }}>
                {label}
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* FEATURED */}
      {featuredJobs && featuredJobs.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-10">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xs font-semibold tracking-widest uppercase" style={{ color: 'var(--fg-faint)' }}>Featured Jobs</h2>
            <Link href="/jobs?featured=true" className="text-sm transition-colors" style={{ color: 'var(--yellow)' }}>
              View all →
            </Link>
          </div>
          <div className="flex flex-col gap-3">
            {featuredJobs.map((job) => <JobCard key={job.id} job={job} featured />)}
          </div>
        </section>
      )}

      {/* RECENT JOBS */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-16">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xs font-semibold tracking-widest uppercase" style={{ color: 'var(--fg-faint)' }}>Latest Jobs</h2>
          <Link href="/jobs" className="text-sm transition-colors" style={{ color: 'var(--yellow)' }}>
            View all {totalJobs ?? 0} →
          </Link>
        </div>
        {recentJobs && recentJobs.length > 0 ? (
          <div className="flex flex-col gap-3">
            {recentJobs.map((job) => <JobCard key={job.id} job={job} />)}
          </div>
        ) : (
          <div className="rounded-xl p-12 text-center" style={{ background: 'var(--bg-raised)', border: '1px solid var(--border)' }}>
            <p style={{ color: 'var(--fg-muted)' }}>Jobs loading soon.</p>
          </div>
        )}
      </section>

      {/* SALARY GUIDE CTA STRIP */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-10">
        <Link
          href="/salary-guide"
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl px-6 py-5 transition-colors group"
          style={{ background: 'var(--bg-raised)', border: '1px solid var(--border)' }}
        >
          <div>
            <p className="text-xs font-semibold tracking-widest uppercase mb-1" style={{ color: 'var(--yellow)' }}>
              2026 Salary Guide
            </p>
            <p className="font-semibold" style={{ color: 'var(--fg)' }}>
              What are electricians and HVAC techs earning at data centers in 2026?
            </p>
            <p className="text-sm mt-0.5" style={{ color: 'var(--fg-muted)' }}>
              Hourly rates, annual salaries, and per diem benchmarks by trade.
            </p>
          </div>
          <span className="shrink-0 text-sm font-semibold whitespace-nowrap" style={{ color: 'var(--yellow)' }}>
            Download free →
          </span>
        </Link>

        {/* Second homepage capture — tied to the salary guide teaser */}
        <div
          className="mt-4"
          style={{
            background: 'rgba(250, 204, 21, 0.05)',
            border: '1px solid var(--yellow-border)',
            borderRadius: '16px',
            padding: 'clamp(1.25rem, 3vw, 1.75rem)',
          }}
        >
          <p
            className="text-xs font-semibold tracking-widest uppercase mb-2"
            style={{ color: 'var(--yellow)' }}
          >
            Pay data + matching roles
          </p>
          <h3
            className="font-bold mb-3"
            style={{
              fontFamily: 'var(--font-display), system-ui, sans-serif',
              fontSize: 'clamp(1.1rem, 3vw, 1.35rem)',
              color: 'var(--fg)',
              letterSpacing: '-0.01em',
            }}
          >
            See what electricians are getting paid, then get matching jobs by email
          </h3>
          <CompactHeroSignup
            source="homepage-salary-teaser"
            defaultTrade="electrical"
          />
        </div>
      </section>

      {/* EMPLOYER CTA */}
      <section style={{ borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', background: 'var(--bg-subtle)' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-20 text-center">
          <p className="text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: 'var(--yellow)' }}>
            For Employers
          </p>
          <h2
            className="mb-4 leading-tight"
            style={{
              fontFamily: 'var(--font-display), system-ui, sans-serif',
              fontSize: 'clamp(2rem, 5vw, 3.5rem)',
              fontWeight: 700,
              color: 'var(--fg)',
            }}
          >
            Hiring for your data center project?
          </h2>
          <p className="text-lg mb-10 max-w-xl mx-auto" style={{ color: 'var(--fg-muted)' }}>
            Reach qualified electricians, HVAC techs, and low voltage specialists who already know what a data center is. Starting at $149 per listing.
          </p>
          <Link
            href="/post-job"
            className="inline-block px-10 py-4 rounded-xl font-semibold text-lg transition-opacity"
            style={{ background: 'var(--yellow)', color: '#0A0A0A' }}
          >
            Post Your First Job
          </Link>
        </div>
      </section>
    </div>
    </>
  )
}
