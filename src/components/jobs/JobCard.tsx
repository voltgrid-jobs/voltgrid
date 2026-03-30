'use client'

import Link from 'next/link'
import Image from 'next/image'
import { type Job, CATEGORY_LABELS, JOB_TYPE_LABELS, TRAVEL_LABELS, SHIFT_LABELS } from '@/types'
import { getLogoUrl } from '@/lib/company-logos'
import { extractSalaryFromDescription } from '@/lib/salary-extract'

function formatSalary(min?: number, max?: number, currency = 'USD', period = 'year'): { primary: string; secondary?: string } | null {
  if (!min && !max) return null
  const isHourly = period === 'hour'
  const isAnnual = period === 'year'

  const fmtHourly = (n: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 2 }).format(n)
  const fmtAnnual = (n: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 }).format(n)

  const shortAnnual = (n: number) => {
    const k = Math.round(n / 1000)
    return `$${k}k`
  }

  if (isHourly) {
    if (min && max) return { primary: `${fmtHourly(min)} – ${fmtHourly(max)}/hr` }
    if (min) return { primary: `From ${fmtHourly(min)}/hr` }
    if (max) return { primary: `Up to ${fmtHourly(max)}/hr` }
  }

  if (isAnnual) {
    const toHourly = (n: number) => fmtHourly(Math.round(n / 2080))
    if (min && max) {
      const hrMin = toHourly(min)
      const hrMax = toHourly(max)
      return {
        primary: `${hrMin} – ${hrMax}/hr`,
        secondary: `(${shortAnnual(min)} – ${shortAnnual(max)}/yr)`,
      }
    }
    if (min) return { primary: `~${toHourly(min)}/hr`, secondary: `(${shortAnnual(min)}/yr)` }
    if (max) return { primary: `Up to ${toHourly(max)}/hr`, secondary: `(${shortAnnual(max)}/yr)` }
  }

  // fallback for other periods (month, etc.)
  const fmt = (n: number) => fmtAnnual(n)
  const suffix = `/${period}`
  if (min && max) return { primary: `${fmt(min)} – ${fmt(max)}${suffix}` }
  if (min) return { primary: `From ${fmt(min)}${suffix}` }
  if (max) return { primary: `Up to ${fmt(max)}${suffix}` }
  return null
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr)
  const now = new Date()
  const currentYear = now.getFullYear()
  const year = date.getFullYear()
  const opts: Intl.DateTimeFormatOptions =
    year === currentYear
      ? { month: 'short', day: 'numeric' }
      : { month: 'short', day: 'numeric', year: 'numeric' }
  return date.toLocaleDateString('en-US', opts)
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

function isClosingSoon(expiresAt?: string | null): boolean {
  if (!expiresAt) return false
  const expires = new Date(expiresAt)
  const now = new Date()
  const diffMs = expires.getTime() - now.getTime()
  const diffDays = diffMs / (1000 * 60 * 60 * 24)
  return diffDays >= 0 && diffDays <= 3
}

// Shift types that are unusual enough to surface as badges (skip default "Day Shift")
const NOTABLE_SHIFTS = new Set(['night', 'rotating', '4x10'])
// Travel levels worth surfacing as a badge (skip local/regional)
const NOTABLE_TRAVEL = new Set(['national'])

export function JobCard({ job, featured = false }: { job: Job; featured?: boolean }) {
  const rawSalary = formatSalary(job.salary_min, job.salary_max, job.salary_currency, job.salary_period ?? 'year')
  const extracted = (!job.salary_min && !job.salary_max && job.description)
    ? extractSalaryFromDescription(job.description) : null
  const salary: { primary: string; secondary?: string } | null =
    rawSalary ?? (extracted ? { primary: extracted } : null)
  const logoUrl = getLogoUrl(job.company_name)
  const isCanada = isCanadaJob(job.location ?? '')
  const isFrench = isFrenchDescription(job.description ?? '')
  const closingSoon = isClosingSoon(job.expires_at)

  // Priority-ordered candidate badges — max 3 shown on card
  const allBadges = [
    job.is_featured  && { label: 'Featured',    bg: 'var(--yellow-dim)',  fg: 'var(--yellow)' },
    job.per_diem     && { label: job.per_diem_rate ? `Per Diem $${job.per_diem_rate}/day` : 'Per Diem', bg: 'var(--green-dim)', fg: 'var(--green)' },
    job.is_union     && { label: 'Union',        bg: 'var(--blue-dim)',    fg: 'var(--blue-fg)' },
    job.remote       && { label: 'Remote OK',   bg: 'var(--green-dim)',   fg: 'var(--green)' },
    job.travel_required && NOTABLE_TRAVEL.has(job.travel_required) && { label: TRAVEL_LABELS[job.travel_required], bg: 'var(--bg-raised)', fg: 'var(--fg-muted)' },
    job.shift_type   && NOTABLE_SHIFTS.has(job.shift_type) && { label: SHIFT_LABELS[job.shift_type], bg: 'var(--bg-raised)', fg: 'var(--fg-muted)' },
  ].filter(Boolean) as { label: string; bg: string; fg: string }[]

  const badges = allBadges.slice(0, 3)

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
            {closingSoon && (
              <span
                className="text-xs font-semibold px-2 py-0.5 rounded"
                style={{ background: 'rgba(251,146,60,0.15)', color: '#fb923c', border: '1px solid rgba(251,146,60,0.3)' }}
              >
                Closing soon
              </span>
            )}
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

          <div className="flex items-center gap-2.5 mb-1.5">
            {logoUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={logoUrl}
                alt={`${job.company_name} logo`}
                width={24}
                height={24}
                loading="lazy"
                className="flex-shrink-0 w-6 h-6 rounded object-contain"
                style={{ background: 'var(--bg-subtle)' }}
                onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
              />
            )}
            <h3
              className="font-semibold text-base sm:text-lg truncate transition-colors"
              style={{ color: 'var(--fg)', fontFamily: 'var(--font-sans), system-ui, sans-serif' }}
            >
              {job.title}
            </h3>
          </div>
          <p className="text-sm" style={{ color: 'var(--fg-muted)' }}>
            <Link
              href={`/jobs?company=${encodeURIComponent(job.company_name)}`}
              className="hover:underline transition-colors"
              style={{ color: 'var(--fg-muted)' }}
              onClick={e => e.stopPropagation()}
            >
              {job.company_name}
            </Link>
            <span style={{ color: 'var(--fg-faint)' }}> · </span>
            {job.location}
          </p>
        </div>

        <div className="text-right flex-shrink-0 hidden sm:block">
          {salary ? (
            <div className="mb-1">
              <div className="text-sm font-semibold" style={{ color: 'var(--green)' }}>
                {salary.primary}
              </div>
              {salary.secondary && (
                <div className="text-xs" style={{ color: 'var(--fg-muted)' }}>
                  {salary.secondary}
                </div>
              )}
            </div>
          ) : (
            <div className="mb-1 text-xs" style={{ color: 'var(--fg-faint)' }}>
              Salary not disclosed ·{' '}
              <Link href="/salary-guide" className="underline" style={{ color: 'var(--yellow)' }} onClick={e => e.stopPropagation()}>
                See market rates →
              </Link>
            </div>
          )}
          <div className="text-xs" style={{ color: 'var(--fg-faint)' }}>
            Posted {formatDate(job.created_at)}
          </div>
        </div>
      </div>

      {salary ? (
        <div className="sm:hidden mt-2">
          <div className="text-sm font-semibold" style={{ color: 'var(--green)' }}>
            {salary.primary}
          </div>
          {salary.secondary && (
            <div className="text-xs" style={{ color: 'var(--fg-muted)' }}>
              {salary.secondary}
            </div>
          )}
        </div>
      ) : (
        <div className="sm:hidden mt-2 text-xs" style={{ color: 'var(--fg-faint)' }}>
          Salary not disclosed ·{' '}
          <Link href="/salary-guide" className="underline" style={{ color: 'var(--yellow)' }} onClick={e => e.stopPropagation()}>
            See market rates →
          </Link>
        </div>
      )}

      {/* Mobile freshness signal */}
      <div className="sm:hidden mt-1 text-xs" style={{ color: 'var(--fg-faint)' }}>
        Posted {formatDate(job.created_at)}
      </div>
    </Link>
  )
}
