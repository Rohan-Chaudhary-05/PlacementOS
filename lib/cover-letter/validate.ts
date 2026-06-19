import { parseSkillList } from '@/lib/cv-tailor/engine'
import type { CoverLetterForm, CoverLetterErrors } from './types'

const EMAIL_PATTERN = /^\S+@\S+\.\S+$/

function isBlank(value: string): boolean {
  return value.trim().length === 0
}

/** Validate the required fields before generating. Optional fields are skipped. */
export function validateCoverLetter(form: CoverLetterForm): CoverLetterErrors {
  const errors: CoverLetterErrors = {}

  if (isBlank(form.fullName)) errors.fullName = 'Enter your full name'

  if (isBlank(form.email)) errors.email = 'Enter your email address'
  else if (!EMAIL_PATTERN.test(form.email.trim())) errors.email = 'Enter a valid email address'

  if (isBlank(form.qualification)) errors.qualification = 'Enter your course / year (e.g. BSc Computer Science student)'
  if (isBlank(form.company)) errors.company = 'Enter the company name'
  if (isBlank(form.role)) errors.role = 'Enter the role title'
  if (isBlank(form.industry)) errors.industry = 'Choose the industry'
  if (parseSkillList(form.skillsRaw).length === 0) errors.skillsRaw = 'Add at least one skill'

  return errors
}
