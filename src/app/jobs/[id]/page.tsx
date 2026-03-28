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
// Canada and French detection (mirrors JobCard logic)
const CANADA_KEYWORDS = [
  'Quebec', 'Ontario', 'British Columbia', 'Alberta', 'Canada',
  'Saskatchewan', 'Manitoba', 'Nova Scotia', 'New Brunswick',
  'Newfoundland', 'Prince Edward Island', 'Yukon', 'Northwest Territories', 'Nunavut',
  ' QC', ' BC', ' ON', ' AB', ' SK', ' MB', ' NS', ' NB', ', QC', ', BC', ', ON', ', AB',
]
function isCanadaJob(location: string): boolean {
  return CANADA_KEYWORDS.some((kw) => location.includes(kw))
}
const FRENCH_WORDS = ['poste', 'emploi', 'vous', 'notre', 'nous', 'pour', 'avec', 'dans', 'une', 'des']
function isFrenchDescription(description: string): boolean {
  if (!description) return false
  const lower = description.toLowerCase()
  let count = 0
  for (const word of FRENCH_WORDS) {
    const regex = new RegExp(`\\b${word}\\b`, 'g')
    const matches = lower.match(regex)
    if (matches) count += matches.length
  }
  return count >= 3
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
  const isCanada = isCanadaJob(job.location ?? '')
  const isFrench = isFrenchDescription(job.description ?? '')

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
          <Link href="/jobs" className="text-sm transition-colors" style={{ color: 'var(--fg-muted)' }}>
            ← Back to jobs
          </Link>
        </div>

        {/* Header card */}
        <div className="rounded-2xl p-6 sm:p-8 mb-4" style={{ background: 'var(--bg-raised)', border: '1px solid var(--border)' }}>
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
            <div className="flex-1">
              <div className="flex flex-wrap gap-1.5 mb-3">
                {job.is_featured && (
                  <span className="text-xs font-medium px-2 py-0.5 rounded" style={{ background: 'var(--yellow-dim)', color: 'var(--yellow)' }}>Featured</span>
                )}
                <span className="text-xs px-2 py-0.5 rounded" style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--fg-muted)' }}>
                  {CATEGORY_LABELS[job.category as keyof typeof CATEGORY_LABELS]}
                </span>
                <span className="text-xs px-2 py-0.5 rounded" style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--fg-muted)' }}>
                  {JOB_TYPE_LABELS[job.job_type as keyof typeof JOB_TYPE_LABELS]}
                </span>
                {job.remote && (
                  <span className="text-xs px-2 py-0.5 rounded" style={{ background: 'var(--green-dim)', color: 'var(--green)' }}>Remote OK</span>
                )}
                {job.is_union && (
                  <span className="text-xs font-medium px-2 py-0.5 rounded" style={{ background: 'var(--blue-dim)', color: 'var(--blue-fg)' }}>Union</span>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl font-semibold mb-2" style={{ color: 'var(--fg)', fontFamily: 'var(--font-display), system-ui, sans-serif', letterSpacing: '-0.01em' }}>
                {job.title}
              </h1>
              <p className="text-base" style={{ color: 'var(--fg-muted)' }}>{job.company_name}</p>
              <p className="text-sm mt-1" style={{ color: 'var(--fg-faint)' }}>{job.location}</p>
              {/* CHANGE 6: Blur salary for guests */}
              {salary && (
                user ? (
                  <p className="font-semibold mt-2" style={{ color: 'var(--green)' }}>{salary}</p>
                ) : (
                  <div className="mt-2 flex items-center gap-2 flex-wrap">
                    <span
                      className="font-semibold select-none"
                      style={{ color: 'var(--green)', filter: 'blur(5px)', userSelect: 'none', pointerEvents: 'none' }}
                    >
                      $●●,●●● – $●●●,●●● / year
                    </span>
                    <Link
                      href={`/auth/login?next=/jobs/${job.id}`}
                      className="text-xs px-2.5 py-1 rounded-full font-medium transition-opacity"
                      style={{ background: 'var(--yellow-dim)', color: 'var(--yellow)', border: '1px solid var(--yellow-border)' }}
                    >
                      Sign in to see full salary — it&apos;s free
                    </Link>
                  </div>
                )
              )}
            </div>

            <div className="sm:flex-shrink-0 flex flex-col gap-2">
              {applyUrl && (
                <ApplyButton jobId={job.id} applyUrl={applyUrl} isExternalUrl={!!job.apply_url} source="top_button" />
              )}
              <SaveJobButton jobId={job.id} initialSaved={isSaved} />
            </div>
          </div>
        </div>

        {/* Trades details */}
        {(job.per_diem || job.travel_required || job.shift_type || job.contract_length || job.is_union) && (
          <div className="rounded-2xl p-6 sm:p-8 mb-4" style={{ background: 'var(--bg-raised)', border: '1px solid var(--border)' }}>
            <p className="text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: 'var(--fg-faint)' }}>Job Details</p>
            <dl className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {job.per_diem && (
                <div>
                  <dt className="text-xs uppercase tracking-wide mb-1" style={{ color: 'var(--fg-faint)' }}>Per Diem</dt>
                  <dd className="font-semibold text-sm" style={{ color: 'var(--green)' }}>{job.per_diem_rate ? `$${job.per_diem_rate}/day` : 'Included'}</dd>
                </div>
              )}
              {job.travel_required && job.travel_required !== 'none' && (
                <div>
                  <dt className="text-xs uppercase tracking-wide mb-1" style={{ color: 'var(--fg-faint)' }}>Travel</dt>
                  <dd className="font-medium text-sm" style={{ color: 'var(--blue-fg)' }}>{TRAVEL_LABELS[job.travel_required]}</dd>
                </div>
              )}
              {job.shift_type && (
                <div>
                  <dt className="text-xs uppercase tracking-wide mb-1" style={{ color: 'var(--fg-faint)' }}>Shift</dt>
                  <dd className="font-medium text-sm" style={{ color: 'var(--fg)' }}>{SHIFT_LABELS[job.shift_type]}</dd>
                </div>
              )}
              {job.contract_length && (
                <div>
                  <dt className="text-xs uppercase tracking-wide mb-1" style={{ color: 'var(--fg-faint)' }}>Duration</dt>
                  <dd className="font-medium text-sm" style={{ color: 'var(--fg)' }}>{job.contract_length}</dd>
                </div>
              )}
              {job.is_union && (
                <div>
                  <dt className="text-xs uppercase tracking-wide mb-1" style={{ color: 'var(--fg-faint)' }}>Union</dt>
                  <dd className="font-medium text-sm" style={{ color: 'var(--blue-fg)' }}>CBA / Signatory</dd>
                </div>
              )}
            </dl>
          </div>
        )}

        {/* CHANGE 3: Canada / French notice banners */}
        {(isCanada || isFrench) && (
          <div className="flex flex-col gap-2 mb-4">
            {isCanada && (
              <div
                className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm"
                style={{ background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.2)', color: 'var(--fg-muted)' }}
              >
                <span>🇨🇦</span>
                <span>This role is based in Canada</span>
              </div>
            )}
            {isFrench && (
              <div
                className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm"
                style={{ background: 'var(--bg-raised)', border: '1px solid var(--border)', color: 'var(--fg-muted)' }}
              >
                <span>📋</span>
                <span>This listing is posted in French</span>
              </div>
            )}
          </div>
        )}

        {/* Description */}
        <div className="rounded-2xl p-6 sm:p-8" style={{ background: 'var(--bg-raised)', border: '1px solid var(--border)' }}>
          <p className="text-xs font-semibold tracking-widest uppercase mb-5" style={{ color: 'var(--fg-faint)' }}>Job Description</p>
          <div className="job-description">
            {sanitizeJobDescription(job.description)
              .split('\n')
              .map((line, i) => {
                const trimmed = line.trim()
                if (!trimmed) return <div key={i} className="h-4" />
                if (trimmed.startsWith('• ')) {
                  return (
                    <div key={i} className="flex gap-3 my-2">
                      <span style={{ color: 'var(--yellow)', flexShrink: 0, marginTop: '0.2rem', fontWeight: 700 }}>—</span>
                      <span>{trimmed.slice(2)}</span>
                    </div>
                  )
                }
                const isHeader = trimmed.length < 60 && trimmed === trimmed.toUpperCase() && trimmed.length > 3
                if (isHeader) {
                  return <h3 key={i}>{trimmed}</h3>
                }
                return <p key={i} className="my-1.5">{trimmed}</p>
              })
            }
          </div>

          {applyUrl && (
            <div className="mt-10 pt-8 text-center" style={{ borderTop: '1px solid var(--border)' }}>
              <p className="text-sm mb-4" style={{ color: 'var(--fg-muted)' }}>Ready to apply?</p>
              <ApplyButton
                jobId={job.id}
                applyUrl={applyUrl}
                isExternalUrl={!!job.apply_url}
                label="Apply for this Job →"
                source="bottom_button"
                className="inline-block px-10 py-4 rounded-xl font-semibold text-lg transition-opacity"
                style={{ background: 'var(--yellow)', color: '#0A0A0A' }}
              />
            </div>
          )}
        </div>

        <div className="mt-4">
          <AlertSignupWidget keywords={job.title} category={job.category} />
        </div>
      </div>
    </>
  )
}
