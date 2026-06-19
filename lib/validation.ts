// Pure validation helpers — no browser or Node APIs, safe on client and server.
// NOTE: tsconfig target is es2020; avoid the regex `u` flag (not needed here).

import { FREE_EMAIL_PROVIDERS, SECTORS, WORK_MODES, type Sector, type WorkMode } from './constants'
import type { StudentProfile } from './match'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
// Academic domains: .ac.<cc> (ac.uk, ac.nz…), .edu, or .edu.<cc> (edu.au…).
const ACADEMIC_PATTERN = /(\.ac\.[a-z]{2,}|\.edu(\.[a-z]{2,})?)$/
// Reject obvious stuffing where a non-academic / free label sits right before the
// academic suffix (gmail.com.ac.uk, evil.com.ac.uk) while still allowing genuine
// university subdomains (live.warwick.ac.uk, students.bham.ac.uk).
const STUFFED_ACADEMIC =
  /(^|\.)(com|net|org|co|info|biz|gmail|googlemail|yahoo|ymail|hotmail|outlook|live|msn|icloud|me|mac|aol|proton|protonmail|gmx|mail|yandex|zoho)\.(ac\.[a-z]{2,}|edu(\.[a-z]{2,})?)$/

export function isValidEmail(email: string): boolean {
  return EMAIL_PATTERN.test(email.trim())
}

export function emailDomain(email: string): string {
  const at = email.trim().toLowerCase().lastIndexOf('@')
  return at === -1 ? '' : email.trim().toLowerCase().slice(at + 1)
}

/**
 * A genuine university / academic address (heuristic — confirmation gates
 * ownership). Like isCompanyEmail this is a UX/quality filter, not a trust
 * boundary: it's enforced client-side at student sign-up only. Student status
 * grants no privilege beyond the student's own self-scoped tracker (RLS), so
 * there is intentionally no DB trigger backstop as there is for company emails.
 */
export function isAcademicEmail(email: string): boolean {
  if (!isValidEmail(email)) return false
  const domain = emailDomain(email)
  return ACADEMIC_PATTERN.test(domain) && !STUFFED_ACADEMIC.test(domain)
}

/**
 * A real company address: valid, and not a free/personal provider — including
 * subdomains of one (mail.gmail.com). This is a UX/quality filter, not a trust
 * boundary; role and tenancy are enforced by DB triggers + RLS.
 */
export function isCompanyEmail(email: string): boolean {
  if (!isValidEmail(email)) return false
  const labels = emailDomain(email).split('.')
  for (let take = 2; take <= 3; take += 1) {
    if (labels.length >= take && FREE_EMAIL_PROVIDERS.has(labels.slice(-take).join('.'))) {
      return false
    }
  }
  return true
}

export type OpportunityInput = {
  role: string
  description: string
  location: string
  workMode: string
  salaryMin: string | number
  salaryMax: string | number
  sector: string
  duration: string
  deadline?: string
  companyValues: string
  requirements?: string
  applyUrl: string
  companyWebsite?: string
}

/**
 * A safe http(s) URL. Rejects other schemes (javascript:, data:, mailto:) so a
 * stored "apply" link can never become a script/redirect vector when rendered.
 */
export function isValidUrl(value: string): boolean {
  const trimmed = value.trim()
  if (trimmed.length === 0 || trimmed.length > 2048) return false
  // Reject embedded whitespace / control chars (CR/LF/tab). The URL parser would
  // silently strip them, letting a malformed value validate and then be stored
  // verbatim — a header-injection / smuggling footgun if ever reused elsewhere.
  if (/[\s\u0000-\u001F\u007F]/.test(trimmed)) return false
  let url: URL
  try {
    url = new URL(trimmed)
  } catch {
    return false
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return false
  // Must have a real host with a dot (rejects http://localhost, http://foo).
  return url.hostname.includes('.') && !url.hostname.startsWith('.') && !url.hostname.endsWith('.')
}

/** Normalise a user-typed link: add https:// if no scheme was given. */
export function normaliseUrl(value: string): string {
  const trimmed = value.trim()
  if (trimmed === '') return ''
  if (/^https?:\/\//i.test(trimmed)) return trimmed
  // Bare domain like "acme.com/careers" → assume https.
  return `https://${trimmed}`
}

export type FieldErrors = Record<string, string>

function blank(value: unknown): boolean {
  return typeof value !== 'string' || value.trim().length === 0
}

/** Upper bound well under Postgres int4 max (2,147,483,647). */
export const MAX_SALARY = 100_000_000

/**
 * Parse a salary into a non-negative whole number, or NaN if invalid.
 * Allows digit grouping / currency symbols (22,000 · £22000) but rejects
 * decimals, negatives, and scientific notation so the integer column never
 * receives a value it will reject or that was silently corrupted.
 */
export function parseSalary(value: string | number): number {
  if (typeof value === 'number') {
    return Number.isInteger(value) && value >= 0 ? value : NaN
  }
  const trimmed = value.trim()
  // Anything other than digits, grouping, whitespace, or a currency symbol is invalid.
  if (trimmed === '' || /[^0-9,\s£$€]/.test(trimmed)) return NaN
  const digits = trimmed.replace(/[^0-9]/g, '')
  return digits === '' ? NaN : Number(digits)
}

/** Validate a company's opportunity submission. Returns {} when valid. */
export function validateOpportunity(input: OpportunityInput): FieldErrors {
  const errors: FieldErrors = {}

  if (blank(input.role)) errors.role = 'Enter the job role or title'
  if (blank(input.description)) errors.description = 'Describe the role'
  if (blank(input.location)) errors.location = 'Enter the location'
  if (!WORK_MODES.includes(input.workMode as WorkMode)) {
    errors.workMode = 'Choose remote, hybrid, or office'
  }
  if (blank(input.sector)) errors.sector = 'Select a sector'
  if (blank(input.duration)) errors.duration = 'Enter the duration (e.g. 12 months)'
  if (blank(input.companyValues)) errors.companyValues = 'Share your company values'

  if (blank(input.applyUrl)) {
    errors.applyUrl = 'Add the link where students apply'
  } else if (!isValidUrl(normaliseUrl(input.applyUrl))) {
    errors.applyUrl = 'Enter a valid web link (e.g. https://careers.acme.com/apply)'
  }

  // Optional, but if provided it must be a real link.
  if (typeof input.companyWebsite === 'string' && input.companyWebsite.trim() !== '' &&
      !isValidUrl(normaliseUrl(input.companyWebsite))) {
    errors.companyWebsite = 'Enter a valid web link, or leave it blank'
  }

  const min = parseSalary(input.salaryMin)
  const max = parseSalary(input.salaryMax)

  if (!Number.isInteger(min) || min <= 0 || min > MAX_SALARY) {
    errors.salaryMin = 'Enter a whole minimum salary'
  }
  if (!Number.isInteger(max) || max <= 0 || max > MAX_SALARY) {
    errors.salaryMax = 'Enter a whole maximum salary'
  }
  if (!errors.salaryMin && !errors.salaryMax && max < min) {
    errors.salaryMax = 'Maximum must be at least the minimum'
  }

  return errors
}

export type StudentProfileInput = {
  discipline?: unknown
  study_year?: unknown
  skills?: unknown
  target_sectors?: unknown
  work_modes?: unknown
  preferred_locations?: unknown
  min_salary?: unknown
}

function cleanStr(value: unknown, max: number): { value: string | null; tooLong: boolean } {
  if (typeof value !== 'string') return { value: null, tooLong: false }
  const trimmed = value.trim()
  if (trimmed === '') return { value: null, tooLong: false }
  return { value: trimmed.slice(0, max), tooLong: trimmed.length > max }
}

/**
 * Validate + normalise a student match profile. Shared by the client form and
 * the PUT /api/student/profile route (server is the trust boundary). Returns
 * inline `errors` plus a `clean` profile safe to upsert. Unknown sectors / work
 * modes are dropped; blank fields become null (= "no preference").
 */
export function validateStudentProfile(input: StudentProfileInput): {
  errors: FieldErrors
  clean: StudentProfile
} {
  const errors: FieldErrors = {}

  const discipline = cleanStr(input.discipline, 120)
  if (discipline.tooLong) errors.discipline = 'Keep this under 120 characters'
  const studyYear = cleanStr(input.study_year, 40)
  if (studyYear.tooLong) errors.study_year = 'Keep this short'
  const skills = cleanStr(input.skills, 2000)
  if (skills.tooLong) errors.skills = 'Keep your skills under 2000 characters'
  const locations = cleanStr(input.preferred_locations, 500)
  if (locations.tooLong) errors.preferred_locations = 'Keep this under 500 characters'

  const target_sectors = Array.isArray(input.target_sectors)
    ? Array.from(new Set(input.target_sectors.filter((s): s is Sector => SECTORS.includes(s as Sector)))).slice(0, 12)
    : []
  const work_modes = Array.isArray(input.work_modes)
    ? Array.from(new Set(input.work_modes.filter((m): m is WorkMode => WORK_MODES.includes(m as WorkMode)))).slice(0, 3)
    : []

  let min_salary: number | null = null
  const rawSalary = input.min_salary
  if (rawSalary !== null && rawSalary !== undefined && String(rawSalary).trim() !== '') {
    const parsed = parseSalary(rawSalary as string | number)
    if (!Number.isInteger(parsed) || parsed < 0 || parsed > MAX_SALARY) {
      errors.min_salary = 'Enter a whole number, or leave it blank'
    } else {
      min_salary = parsed
    }
  }

  const clean: StudentProfile = {
    discipline: discipline.value,
    study_year: studyYear.value,
    skills: skills.value,
    target_sectors,
    work_modes,
    preferred_locations: locations.value,
    min_salary,
  }
  return { errors, clean }
}

export function isValidName(value: string): boolean {
  return value.trim().length >= 1
}

export function isStrongEnoughPassword(value: string): boolean {
  return typeof value === 'string' && value.length >= 8
}
