import Link from 'next/link'
import { type Job, CATEGORY_LABELS, JOB_TYPE_LABELS } from '@/types'

function formatSalary(min?: number, max?: number, currency = 'USD') {
  if (!min && !max) return null
  const fmt = (n: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(n)
  if (min && max) return `${fmt(min)} – ${fmt(max)}`
  if (min) return `${fmt(min)}+`
  if (max) return `Up to ${fmt(max)}`
  return null
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const days = Math.floor(diff / 86400000)
  if (days === 0) return 'Today'
  if (days === 1) return '1 day ago'
  if (days < 30) return `${days} days ago`
  const weeks = Math.floor(days / 7)
  if (weeks < 8) return `${weeks} weeks ago`
  return `${Math.floor(days / 30)} months ago`
}

export function JobCard({ job, featured = false }: { job: Job; featured?: boolean }) {
  const salary = formatSalary(job.salary_min, job.salary_max, job.salary_currency)

  return (
    <Link
      href={`/jobs/${job.id}`}
      className={`block bg-gray-900 border rounded-xl p-5 hover:border-yellow-400/50 hover:bg-gray-800 transition-all group ${
        featured ? 'border-yellow-400/30' : 'border-gray-800'
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            {featured && (
              <span className="bg-yellow-400/20 text-yellow-400 text-xs font-medium px-2 py-0.5 rounded">
                Featured
              </span>
            )}
            <span className="bg-gray-800 text-gray-400 text-xs px-2 py-0.5 rounded">
              {CATEGORY_LABELS[job.category]}
            </span>
            <span className="bg-gray-800 text-gray-400 text-xs px-2 py-0.5 rounded">
              {JOB_TYPE_LABELS[job.job_type]}
            </span>
            {job.remote && (
              <span className="bg-green-900/40 text-green-400 text-xs px-2 py-0.5 rounded">
                Remote OK
              </span>
            )}
          </div>

          <h3 className="font-semibold text-white text-lg group-hover:text-yellow-400 transition-colors truncate">
            {job.title}
          </h3>
          <p className="text-gray-400 text-sm mt-0.5">
            {job.company_name} · {job.location}
          </p>
        </div>

        <div className="text-right flex-shrink-0 hidden sm:block">
          {salary && (
            <div className="text-green-400 font-semibold text-sm mb-1">{salary}</div>
          )}
          <div className="text-gray-600 text-xs">{timeAgo(job.created_at)}</div>
        </div>
      </div>

      {salary && (
        <div className="sm:hidden text-green-400 font-semibold text-sm mt-2">{salary}</div>
      )}
    </Link>
  )
}
