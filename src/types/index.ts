export type JobCategory =
  | 'electrical'
  | 'hvac'
  | 'low_voltage'
  | 'construction'
  | 'project_management'
  | 'operations'
  | 'other'

export type JobType = 'full_time' | 'part_time' | 'contract' | 'apprenticeship'

export type JobSource =
  | 'direct'
  | 'adzuna'
  | 'usajobs'
  | 'greenhouse'
  | 'lever'
  | 'workable'
  | 'dol_apprenticeship'

export interface Job {
  id: string
  employer_id?: string
  title: string
  company_name: string
  company_logo_url?: string
  category: JobCategory
  job_type: JobType
  location: string
  remote: boolean
  salary_min?: number
  salary_max?: number
  salary_currency: string
  description: string
  apply_url?: string
  apply_email?: string
  source: JobSource
  source_id?: string
  is_featured: boolean
  is_active: boolean
  expires_at: string
  created_at: string
  updated_at: string
  // Trades-specific fields
  per_diem?: boolean
  per_diem_rate?: number
  travel_required?: 'none' | 'local' | 'regional' | 'national'
  shift_type?: 'day' | 'night' | 'rotating' | '4x10' | '5x8' | 'other'
  contract_length?: string
  is_union?: boolean
}

export interface Employer {
  id: string
  user_id: string
  company_name: string
  company_slug: string
  website?: string
  logo_url?: string
  description?: string
  location?: string
  created_at: string
  updated_at: string
}

export const CATEGORY_LABELS: Record<JobCategory, string> = {
  electrical: 'Electrical',
  hvac: 'HVAC',
  low_voltage: 'Low Voltage',
  construction: 'Construction',
  project_management: 'Project Management',
  operations: 'Operations',
  other: 'Other',
}

export const JOB_TYPE_LABELS: Record<JobType, string> = {
  full_time: 'Full-Time',
  part_time: 'Part-Time',
  contract: 'Contract',
  apprenticeship: 'Apprenticeship',
}

export const TRAVEL_LABELS: Record<string, string> = {
  none: 'No Travel',
  local: 'Local Travel',
  regional: 'Regional Travel',
  national: 'National Travel',
}

export const SHIFT_LABELS: Record<string, string> = {
  day: 'Day Shift',
  night: 'Night Shift',
  rotating: 'Rotating',
  '4x10': '4×10',
  '5x8': '5×8',
  other: 'Other',
}
