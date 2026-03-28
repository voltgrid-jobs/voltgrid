import Link from 'next/link'
import { type Job, CATEGORY_LABELS, JOB_TYPE_LABELS, TRAVEL_LABELS, SHIFT_LABELS } from '@/types'

function formatSalary(min?: number, max?: number, currency = 'USD', period = 'year') {
  if (!min && !max) return null
  const isHourly = period === 'hour'
  const fmt = (n: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: isHourly ? 2 : 0 }).format(n)
  const suffix = isHourly ? '/hr' : period === 'year' ? '/yr' : `/${period}`
  if (min && max) return `${fmt(min)} – ${fmt(max)} ${suffix}`
  if (min) return `${fmt(min)}+ ${suffix}`
  if (max) return `Up to ${fmt(max)} ${suffix}`
  return null
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  if (minutes < 60) return minutes <= 1 ? 'just now' : `${minutes} minutes ago`
  if (hours < 24) return hours === 1 ? '1 hour ago' : `${hours} hours ago`
  if (days === 1) return '1 day ago'
  if (days < 7) return `${days} days ago`
  if (days < 14) return '1 week ago'
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`
  const weeks = Math.floor(days / 7)
  if (weeks < 8) return `${weeks}w ago`
  return `${Math.floor(days / 30)}mo ago`
}

// Canada province/territory detection
const CANADA_KEYWORDS = [
  'Quebec', 'Ontario', 'British Columbia', 'Alberta', 'Canada',
  'Saskatchewan', 'Manitoba', 'Nova Scotia', 'New Brunswick',
  'Newfoundland', 'Prince Edward Island', 'Yukon', 'Northwest Territories', 'Nunavut',
  ' QC', ' BC', ' ON', ' AB', ' SK', ' MB', ' NS', ' NB', ', QC', ', BC', ', ON', ', AB',
]

function isCanadaJob(location: string): boolean {
  return CANADA_KEYWORDS.some((kw) => location.includes(kw))
}

// French language detection heuristic
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

export function JobCard({ job, featured = false }: { job: Job; featured?: boolean }) {
  const salary = formatSalary(job.salary_min, job.salary_max, job.salary_currency, job.salary_period ?? 'year')
  const isCanada = isCanadaJob(job.location ?? '')
  const isFrench = isFrenchDescription(job.description ?? '')

  const badges = [
    job.is_featured  && { label: 'Featured',    bg: 'var(--yellow-dim)',  fg: 'var(--yellow)' },
    job.remote       && { label: 'Remote OK',   bg: 'var(--green-dim)',   fg: 'var(--green)' },
    job.is_union     && { label: 'Union',        bg: 'var(--blue-dim)',    fg: 'var(--blue-fg)' },
    job.per_diem     && { label: job.per_diem_rate ? `Per Diem $${job.per_diem_rate}/day` : 'Per Diem', bg: 'var(--green-dim)', fg: 'var(--green)' },
    job.travel_required && job.travel_required !== 'none' && { label: TRAVEL_LABELS[job.travel_required], bg: 'var(--bg-raised)', fg: 'var(--fg-muted)' },
    job.shift_type   && { label: SHIFT_LABELS[job.shift_type], bg: 'var(--bg-raised)', fg: 'var(--fg-muted)' },
  ].filter(Boolean) as { label: string; bg: string; fg: string }[]

  return (
    <Link
      href={`/jobs/${job.id}`}
      className="block rounded-xl p-5 transition-all group"
      style={{
        background: 'var(--bg-raised)',
        border: featured ? '1px solid var(--yellow-border)' : '1px solid var(--border)',
      }}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          {/* Badges */}
          <div className="flex items-center flex-wrap gap-1.5 mb-2">
            <span
              className="text-xs font-medium px-2 py-0.5 rounded"
              style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--fg-muted)' }}
            >
              {CATEGORY_LABELS[job.category]}
            </span>
            <span
              className="text-xs font-medium px-2 py-0.5 rounded"
              style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--fg-muted)' }}
            >
              {JOB_TYPE_LABELS[job.job_type]}
            </span>
            {badges.map(({ label, bg, fg }) => (
              <span key={label} className="text-xs font-medium px-2 py-0.5 rounded" style={{ background: bg, color: fg }}>
                {label}
              </span>
            ))}
            {isCanada && (
              <span className="text-xs font-medium px-2 py-0.5 rounded" title="Canada-based role"
                style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--fg-muted)' }}>
                🇨🇦
              </span>
            )}
            {isFrench && (
              <span className="text-xs font-medium px-2 py-0.5 rounded"
                style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--fg-muted)' }}>
                🇫🇷 French
              </span>
            )}
          </div>

          <h3
            className="font-semibold text-base sm:text-lg mb-1 truncate transition-colors"
            style={{ color: 'var(--fg)', fontFamily: 'var(--font-sans), system-ui, sans-serif' }}
          >
            {job.title}
          </h3>
          <p className="text-sm" style={{ color: 'var(--fg-muted)' }}>
            {job.company_name}
            <span style={{ color: 'var(--fg-faint)' }}> · </span>
            {job.location}
          </p>
        </div>

        <div className="text-right flex-shrink-0 hidden sm:block">
          {/* CHANGE 6: Blur salary for guest users */}
          {salary && (
            <div className="mb-1">
              <div
                className="text-sm font-semibold select-none"
                style={{ color: 'var(--green)', filter: 'blur(4px)', userSelect: 'none', pointerEvents: 'none' }}
              >
                $●●,●●● – $●●●,●●● /yr
              </div>
              <Link
                href="/auth/login"
                onClick={(e) => e.stopPropagation()}
                className="text-xs"
                style={{ color: 'var(--yellow)' }}
              >
                Sign in to view salary →
              </Link>
            </div>
          )}
          {/* CHANGE 1: Freshness signal */}
          <div className="text-xs" style={{ color: 'var(--fg-faint)' }}>
            Posted {timeAgo(job.created_at)}
          </div>
        </div>
      </div>

      {/* Mobile salary blur */}
      {salary && (
        <div className="sm:hidden mt-2">
          <div
            className="text-sm font-semibold select-none inline-block"
            style={{ color: 'var(--green)', filter: 'blur(4px)', userSelect: 'none', pointerEvents: 'none' }}
          >
            $●●,●●● – $●●●,●●● /yr
          </div>
          <Link
            href="/auth/login"
            onClick={(e) => e.stopPropagation()}
            className="text-xs ml-2"
            style={{ color: 'var(--yellow)' }}
          >
            Sign in to view →
          </Link>
        </div>
      )}

      {/* Mobile freshness signal */}
      <div className="sm:hidden mt-1 text-xs" style={{ color: 'var(--fg-faint)' }}>
        Posted {timeAgo(job.created_at)}
      </div>
    </Link>
  )
}
