import { createClient } from '@/lib/supabase/server'
import { CATEGORY_LABELS, JOB_TYPE_LABELS } from '@/types'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { SaveJobButton } from '@/components/jobs/SaveJobButton'
import { AlertSignupWidget } from '@/components/jobs/AlertSignupWidget'

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

function formatSalary(min?: number, max?: number, currency = 'USD') {
  if (!min && !max) return null
  const fmt = (n: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 }).format(n)
  if (min && max) return `${fmt(min)} – ${fmt(max)} / year`
  if (min) return `${fmt(min)}+ / year`
  if (max) return `Up to ${fmt(max)} / year`
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

  const salary = formatSalary(job.salary_min, job.salary_max, job.salary_currency)
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
          unitText: 'YEAR',
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
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">{job.title}</h1>
              <p className="text-gray-400 text-lg">{job.company_name}</p>
              <p className="text-gray-500 mt-1">📍 {job.location}</p>
              {salary && <p className="text-green-400 font-semibold mt-2">{salary}</p>}
            </div>

            <div className="sm:flex-shrink-0 flex flex-col gap-2">
              {applyUrl && (
                <a
                  href={applyUrl}
                  target={job.apply_url ? '_blank' : undefined}
                  rel="noopener noreferrer"
                  className="inline-block bg-yellow-400 text-gray-950 px-8 py-3 rounded-xl font-semibold hover:bg-yellow-300 transition-colors text-center"
                >
                  Apply Now →
                </a>
              )}
              <SaveJobButton jobId={job.id} initialSaved={isSaved} />
            </div>
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 sm:p-8">
          <h2 className="text-xl font-bold text-white mb-4">Job Description</h2>
          <div className="text-gray-300 leading-relaxed whitespace-pre-wrap">
            {job.description}
          </div>

          {applyUrl && (
            <div className="mt-10 pt-8 border-t border-gray-800 text-center">
              <p className="text-gray-400 mb-4">Ready to apply?</p>
              <a
                href={applyUrl}
                target={job.apply_url ? '_blank' : undefined}
                rel="noopener noreferrer"
                className="inline-block bg-yellow-400 text-gray-950 px-10 py-4 rounded-xl font-semibold text-lg hover:bg-yellow-300 transition-colors"
              >
                Apply for this Job →
              </a>
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
