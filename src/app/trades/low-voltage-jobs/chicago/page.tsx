
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { JobCard } from '@/components/jobs/JobCard'
import { AlertSignupWidget } from '@/components/jobs/AlertSignupWidget'
import type { Job, JobCategory } from '@/types'

const TRADE_SLUG = 'low-voltage-jobs'
const TRADE_CATEGORY = 'low_voltage'
const TRADE_NAME = 'Low Voltage & Structured Cabling Jobs'
const TRADE_SHORT_NAME = 'Low Voltage'
const TRADE_ICON = '📡'
const TRADE_BLURB = 'Fiber, copper, structured cabling, and network infrastructure specialists for data center builds.'
const TRADE_SEO_BLURB = 'Every data center requires miles of fiber, copper, and structured cabling — from backbone infrastructure to cross-connects and patch panels. Low voltage technicians with data center experience are in constant demand as new facilities open and existing ones expand.'
const TRADE_META_DESCRIPTION = 'Low voltage and structured cabling jobs at data centers. Fiber, copper, network infrastructure, and telecommunications roles at colocation and hyperscale facilities.'

const LOCATION_SLUG = 'chicago'
const LOCATION_NAME = 'Chicago'

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: `${TRADE_NAME} in ${LOCATION_NAME} — VoltGrid Jobs`,
    description: `${TRADE_META_DESCRIPTION} in ${LOCATION_NAME}.`,
  }
}

export default async function TradeLocationPage() {
  const supabase = await createClient()
  const { data: jobsData } = await supabase
    .from('jobs')
    .select('*')
    .eq('is_active', true)
    .eq('category', TRADE_CATEGORY)
    .eq('location_slug', LOCATION_SLUG) // Assuming 'location_slug' field exists in 'jobs' table
    .order('is_featured', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(50)

  const jobs: Job[] = jobsData ?? []

  return (
    <main className="min-h-screen">
      {/* Breadcrumb */}
      <nav className="max-w-5xl mx-auto px-4 pt-6 pb-2">
        <ol className="flex items-center gap-2 text-sm text-gray-500">
          <li>
            <Link href="/" className="hover:text-yellow-400 transition-colors">
              Home
            </Link>
          </li>
          <li className="text-gray-700">/</li>
          <li>
            <Link href="/trades" className="hover:text-yellow-400 transition-colors">
              Trades
            </Link>
          </li>
          <li className="text-gray-700">/</li>
          <li>
            <Link href={`/trades/${TRADE_SLUG}`} className="hover:text-yellow-400 transition-colors">
              {TRADE_NAME}
            </Link>
          </li>
          <li className="text-gray-700">/</li>
          <li className="text-gray-300">{LOCATION_NAME}</li>
        </ol>
      </nav>

      {/* Hero */}
      <section className="border-b border-gray-800 py-12 px-4">
        <div className="max-w-5xl mx-auto">
          <p className="text-3xl mb-3">{TRADE_ICON}</p>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
            {TRADE_NAME} in {LOCATION_NAME}
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mb-4">{TRADE_BLURB}</p>
          <p className="text-gray-300 font-medium">
            {jobs.length > 0
              ? `${jobs.length} job${jobs.length === 1 ? '' : 's'} available`
              : 'New jobs posted regularly'}
          </p>

          {/* SEO paragraph */}
          <p className="text-gray-500 text-sm mt-5 max-w-3xl leading-relaxed">{TRADE_SEO_BLURB} Considering the growing data center presence in {LOCATION_NAME}, demand for skilled {TRADE_SHORT_NAME}s is exceptionally high.</p>
        </div>
      </section>

      {/* Jobs */}
      <section className="max-w-5xl mx-auto px-4 py-10">
        {jobs.length > 0 ? (
          <div className="space-y-3">
            {jobs.map(job => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-gray-400 text-lg mb-2">No {TRADE_SHORT_NAME} listings in {LOCATION_NAME} right now — set up a job alert</p>
            <p className="text-gray-600 text-sm mb-6">
              We&apos;ll email you as soon as new {TRADE_SHORT_NAME} jobs are posted in {LOCATION_NAME}.
            </p>
            <div className="max-w-md mx-auto mb-6">
              <AlertSignupWidget keywords="" category={TRADE_CATEGORY as JobCategory} />
            </div>
            <Link href="/jobs" className="text-yellow-400 text-sm hover:underline">
              Browse all open positions →
            </Link>
          </div>
        )}
      </section>

      {/* Alert widget (always shown below job list) */}
      {jobs.length > 0 && (
        <section className="max-w-5xl mx-auto px-4 pb-10">
          <div className="max-w-md">
            <AlertSignupWidget keywords="" category={TRADE_CATEGORY as JobCategory} />
          </div>
        </section>
      )}

      {/* Hiring CTA */}
      <section className="border-t border-gray-800 py-12 px-4 text-center">
        <p className="text-gray-400 mb-3">
          Hiring {TRADE_SHORT_NAME}s in {LOCATION_NAME}?
        </p>
        <Link
          href="/post-job"
          className="inline-block bg-yellow-400 text-gray-950 font-bold px-6 py-3 rounded-xl hover:bg-yellow-300 transition-colors"
        >
          Post a job from $149 →
        </Link>
      </section>
    </main>
  )
}
