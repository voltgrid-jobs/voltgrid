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
