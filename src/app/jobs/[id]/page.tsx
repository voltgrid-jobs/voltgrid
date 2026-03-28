import { createClient } from '@/lib/supabase/server'
import { CATEGORY_LABELS, JOB_TYPE_LABELS, TRAVEL_LABELS, SHIFT_LABELS } from '@/types'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

/**
 * Server-side HTML sanitizer for job descriptions from external sources.
 * Strips all tags except a safe whitelist, decodes HTML entities,
 * and removes script/style/iframe content entirely.
 */
function sanitizeJobDescription(html: string): string {
  if (!html) return ''
  // First decode any entity-encoded HTML (e.g. &lt;div&gt; stored by some ATS sources)
  let clean = html
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, ' ')
  // Remove dangerous elements and their content entirely
  clean = clean
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<iframe[\s\S]*?<\/iframe>/gi, '')
    .replace(/<object[\s\S]*?<\/object>/gi, '')
    .replace(/<embed[^>]*>/gi, '')
    .replace(/\u00ad/g, '') // soft hyphens
  // Replace block-level tags with newlines for readable plain text
  clean = clean
    .replace(/<\/(p|div|li|h[1-6]|tr|blockquote|section|article)>/gi, '\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<li[^>]*>/gi, '\n• ')
    .replace(/<h([1-6])[^>]*>/gi, '\n')
  // Strip all remaining tags
  clean = clean.replace(/<[^>]+>/g, '')
  // Decode remaining HTML entities
  clean = clean
    .replace(/&ndash;/g, '–')
    .replace(/&mdash;/g, '—')
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(parseInt(code, 10)))
    .replace(/&[a-z]+;/gi, ' ')
  // Collapse whitespace — keep bullet structure intact
  clean = clean
    .replace(/[ \t]{2,}/g, ' ')
    .replace(/•[ \t]*\n[ \t]*/g, '• ')  // bullet + newline + space → inline
    .replace(/\n[ \t]+/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
  return clean
}
import { SaveJobButton } from '@/components/jobs/SaveJobButton'
import { AlertSignupWidget } from '@/components/jobs/AlertSignupWidget'
import { ApplyButton } from '@/components/jobs/ApplyButton'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const supabase = await createClient()
  const { data: job } = await supabase.from('jobs').select('title, company_name, location').eq('id', id).single()
  if (!job) return { title: 'Job Not Found — VoltGrid Jobs' }
  return {
    title: `${job.title} at ${job.company_name} — VoltGrid Jobs`,
    description: `${job.title} at ${job.company_name} in ${job.location}. Apply on VoltGrid Jobs.`,
  }
}

function formatSalary(min?: number, max?: number, currency = 'USD', period = 'year') {
  if (!min && !max) return null
  const isHourly = period === 'hour'
  const fmt = (n: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      maximumFractionDigits: isHourly ? 2 : 0,
    }).format(n)
  const suffix = isHourly ? '/ hr' : period === 'year' ? '/ year' : `/ ${period}`
  if (min && max) return `${fmt(min)} – ${fmt(max)} ${suffix}`
  if (min) return `${fmt(min)}+ ${suffix}`
  if (max) return `Up to ${fmt(max)} ${suffix}`
  return null
}

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data: job } = await supabase.from('jobs').select('*').eq('id', id).eq('is_active', true).single()
  if (!job) notFound()

  const { data: { user } } = await supabase.auth.getUser()
  let isSaved = false
  if (user) {
    const { data: saved } = await supabase
      .from('saved_jobs').select('id').eq('user_id', user.id).eq('job_id', id).single()
    isSaved = !!saved
  }

  const salary = formatSalary(job.salary_min, job.salary_max, job.salary_currency, job.salary_period ?? 'year')
  const applyUrl = job.apply_url || (job.apply_email ? `mailto:${job.apply_email}` : null)

  // Map internal job_type values to schema.org employmentType
  const employmentTypeMap: Record<string, string> = {
    full_time: 'FULL_TIME',
    part_time: 'PART_TIME',
    contract: 'CONTRACTOR',
    apprenticeship: 'OTHER',
  }

  // JSON-LD structured data for Google Jobs
  const jsonLd: Record<string, unknown> = {
    '@context': 'https://schema.org/',
    '@type': 'JobPosting',
    title: job.title,
    description: job.description,
    hiringOrganization: {
      '@type': 'Organization',
      name: job.company_name,
      ...(job.company_logo_url && { logo: job.company_logo_url }),
    },
    jobLocation: {
      '@type': 'Place',
      address: { '@type': 'PostalAddress', addressLocality: job.location },
    },
    ...(job.remote && { jobLocationType: 'TELECOMMUTE' }),
    employmentType: employmentTypeMap[job.job_type] ?? 'OTHER',
    datePosted: job.created_at,
    ...(job.expires_at && { validThrough: job.expires_at }),
    ...(applyUrl && { url: applyUrl }),
    ...(job.salary_min && {
      baseSalary: {
        '@type': 'MonetaryAmount',
        currency: job.salary_currency ?? 'USD',
        value: {
          '@type': 'QuantitativeValue',
          ...(job.salary_min && { minValue: job.salary_min }),
          ...(job.salary_max && { maxValue: job.salary_max }),
          unitText: (job.salary_period === 'hour' ? 'HOUR' : job.salary_period === 'month' ? 'MONTH' : 'YEAR'),
        },
      },
    }),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        <div className="mb-6">
          <Link href="/jobs" className="text-gray-500 hover:text-gray-300 text-sm transition-colors">
            ← Back to jobs
          </Link>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 sm:p-8 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
            <div className="flex-1">
              <div className="flex flex-wrap gap-2 mb-3">
                {job.is_featured && (
                  <span className="bg-yellow-400/20 text-yellow-400 text-xs font-medium px-2 py-0.5 rounded">
                    Featured
                  </span>
                )}
                <span className="bg-gray-800 text-gray-400 text-xs px-2 py-0.5 rounded">
                  {CATEGORY_LABELS[job.category as keyof typeof CATEGORY_LABELS]}
                </span>
                <span className="bg-gray-800 text-gray-400 text-xs px-2 py-0.5 rounded">
                  {JOB_TYPE_LABELS[job.job_type as keyof typeof JOB_TYPE_LABELS]}
                </span>
                {job.remote && (
                  <span className="bg-green-900/40 text-green-400 text-xs px-2 py-0.5 rounded">
                    Remote OK
                  </span>
                )}
                {job.is_union && (
                  <span className="bg-blue-900/40 text-blue-300 text-xs px-2 py-0.5 rounded font-medium">
                    🔵 Union
                  </span>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">{job.title}</h1>
              <p className="text-gray-400 text-lg">{job.company_name}</p>
              <p className="text-gray-500 mt-1">📍 {job.location}</p>
              {salary && <p className="text-green-400 font-semibold mt-2">{salary}</p>}
            </div>

            <div className="sm:flex-shrink-0 flex flex-col gap-2">
              {applyUrl && (
                <ApplyButton
                  jobId={job.id}
                  applyUrl={applyUrl}
                  isExternalUrl={!!job.apply_url}
                  source="top_button"
                />
              )}
              <SaveJobButton jobId={job.id} initialSaved={isSaved} />
            </div>
          </div>
        </div>

        {/* Trades-specific job details */}
        {(job.per_diem || job.travel_required || job.shift_type || job.contract_length || job.is_union) && (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 sm:p-8 mb-6">
            <h2 className="text-lg font-bold text-white mb-4">Job Details</h2>
            <dl className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {job.per_diem && (
                <div>
                  <dt className="text-gray-500 text-xs uppercase tracking-wide mb-1">Per Diem</dt>
                  <dd className="text-emerald-400 font-semibold">
                    {job.per_diem_rate ? `$${job.per_diem_rate}/day` : 'Included'}
                  </dd>
                </div>
              )}
              {job.travel_required && job.travel_required !== 'none' && (
                <div>
                  <dt className="text-gray-500 text-xs uppercase tracking-wide mb-1">Travel</dt>
                  <dd className="text-sky-400 font-medium">{TRAVEL_LABELS[job.travel_required]}</dd>
                </div>
              )}
              {job.shift_type && (
                <div>
                  <dt className="text-gray-500 text-xs uppercase tracking-wide mb-1">Shift</dt>
                  <dd className="text-gray-200 font-medium">{SHIFT_LABELS[job.shift_type]}</dd>
                </div>
              )}
              {job.contract_length && (
                <div>
                  <dt className="text-gray-500 text-xs uppercase tracking-wide mb-1">Duration</dt>
                  <dd className="text-gray-200 font-medium">{job.contract_length}</dd>
                </div>
              )}
              {job.is_union && (
                <div>
                  <dt className="text-gray-500 text-xs uppercase tracking-wide mb-1">Union</dt>
                  <dd className="text-blue-400 font-medium">🔵 CBA / Signatory</dd>
                </div>
              )}
            </dl>
          </div>
        )}

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 sm:p-8">
          <h2 className="text-xl font-bold text-white mb-4">Job Description</h2>
          <div className="text-gray-300 leading-relaxed">
            {sanitizeJobDescription(job.description)
              .split('\n')
              .map((line, i) => {
                const trimmed = line.trim()
                if (!trimmed) return <div key={i} className="h-3" />
                if (trimmed.startsWith('• ')) {
                  return (
                    <div key={i} className="flex gap-2 my-1">
                      <span className="text-yellow-400 flex-shrink-0 mt-0.5">•</span>
                      <span>{trimmed.slice(2)}</span>
                    </div>
                  )
                }
                // Section headers: short lines in ALL CAPS or ending with no punctuation after a blank line
                const isHeader = trimmed.length < 60 && trimmed === trimmed.toUpperCase() && trimmed.length > 3
                if (isHeader) {
                  return <h3 key={i} className="font-semibold text-white mt-5 mb-2 text-sm uppercase tracking-wide">{trimmed}</h3>
                }
                return <p key={i} className="my-1">{trimmed}</p>
              })
            }
          </div>

          {applyUrl && (
            <div className="mt-10 pt-8 border-t border-gray-800 text-center">
              <p className="text-gray-400 mb-4">Ready to apply?</p>
              <ApplyButton
                jobId={job.id}
                applyUrl={applyUrl}
                isExternalUrl={!!job.apply_url}
                label="Apply for this Job →"
                source="bottom_button"
                className="inline-block bg-yellow-400 text-gray-950 px-10 py-4 rounded-xl font-semibold text-lg hover:bg-yellow-300 transition-colors"
              />
            </div>
          )}
        </div>

        <div className="mt-6">
          <AlertSignupWidget keywords={job.title} category={job.category} />
        </div>
      </div>
    </>
  )
}
