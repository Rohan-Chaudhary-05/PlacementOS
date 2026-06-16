// Pure validation helpers — no browser or Node APIs, safe on client and server.
// NOTE: tsconfig target is es2020; avoid the regex `u` flag (not needed here).

import { FREE_EMAIL_PROVIDERS, WORK_MODES, type WorkMode } from './constants'

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

/** A genuine university / academic address (heuristic — confirmation gates ownership). */
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

export function isValidName(value: string): boolean {
  return value.trim().length >= 1
}

export function isStrongEnoughPassword(value: string): boolean {
  return typeof value === 'string' && value.length >= 8
}
