// Shared domain constants and types. Keep enum values in sync with
// supabase/migrations/0001_init.sql (SQLite/Postgres CHECK constraints).

export const USER_ROLES = ['student', 'company', 'staff'] as const
export type UserRole = (typeof USER_ROLES)[number]

/** Where each role lands after sign-in. Client-safe (no server imports). */
export function dashboardPathFor(role: UserRole): string {
  if (role === 'company') return '/company/dashboard'
  if (role === 'staff') return '/staff/dashboard'
  return '/'
}

export const OPPORTUNITY_STATUSES = ['UNDER_REVIEW', 'ACCEPTED', 'DENIED'] as const
export type OpportunityStatus = (typeof OPPORTUNITY_STATUSES)[number]

export const STATUS_LABELS: Record<OpportunityStatus, string> = {
  UNDER_REVIEW: 'Under review',
  ACCEPTED: 'Accepted',
  DENIED: 'Denied',
}

export const WORK_MODES = ['REMOTE', 'HYBRID', 'OFFICE'] as const
export type WorkMode = (typeof WORK_MODES)[number]

export const WORK_MODE_LABELS: Record<WorkMode, string> = {
  REMOTE: 'Remote',
  HYBRID: 'Hybrid',
  OFFICE: 'Office',
}

// STEM-leaning sectors offered when a company posts an opportunity.
export const SECTORS = [
  'Software & IT',
  'Data Science & AI',
  'Engineering',
  'Aerospace & Defence',
  'Biotech & Pharma',
  'Healthcare & MedTech',
  'Energy & Sustainability',
  'Finance & Quantitative',
  'Telecommunications',
  'Research & Academia',
  'Manufacturing',
  'Other',
] as const
export type Sector = (typeof SECTORS)[number]

// Free / personal email providers rejected for company registration.
// MUST stay in sync with the free_domains array in enforce_company_email()
// in supabase/migrations/0001_init.sql — edit both together.
export const FREE_EMAIL_PROVIDERS: ReadonlySet<string> = new Set([
  'gmail.com', 'googlemail.com', 'yahoo.com', 'yahoo.co.uk', 'yahoo.fr', 'yahoo.de', 'yahoo.ca', 'yahoo.in', 'ymail.com', 'rocketmail.com',
  'hotmail.com', 'hotmail.co.uk', 'hotmail.fr', 'outlook.com', 'outlook.fr', 'live.com', 'live.co.uk', 'msn.com',
  'icloud.com', 'me.com', 'mac.com', 'aol.com', 'proton.me', 'protonmail.com', 'pm.me', 'tutanota.com', 'tuta.io',
  'gmx.com', 'gmx.co.uk', 'gmx.de', 'mail.com', 'mail.ru', 'yandex.com', 'yandex.ru', 'zoho.com', 'fastmail.com', 'hey.com',
  'qq.com', '163.com', '126.com', 'web.de', 'naver.com', 'rediffmail.com', 'hushmail.com',
])

// Shape of a public.opportunities row.
export type Opportunity = {
  id: string
  company_id: string
  company_name: string
  company_email: string
  role: string
  description: string
  location: string
  work_mode: WorkMode
  salary_min: number
  salary_max: number
  currency: string
  sector: string
  duration: string
  deadline: string | null
  company_values: string | null
  requirements: string | null
  status: OpportunityStatus
  review_note: string | null
  reviewed_by: string | null
  created_at: string
  updated_at: string
}

export type Profile = {
  id: string
  role: UserRole
  company_name: string | null
  created_at: string
}
