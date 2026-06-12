import type { CvFormData, CvFormErrors, ExperienceEntry } from './types'

const EMAIL_PATTERN = /^\S+@\S+\.\S+$/

function isBlank(value: string): boolean {
  return value.trim().length === 0
}

function experienceEntryIsEmpty(entry: ExperienceEntry): boolean {
  return (
    isBlank(entry.role) &&
    isBlank(entry.company) &&
    isBlank(entry.startDate) &&
    isBlank(entry.endDate) &&
    isBlank(entry.bulletsRaw)
  )
}

export function validateStep(step: 1 | 2 | 3 | 4, form: CvFormData): CvFormErrors {
  const errors: CvFormErrors = {}

  if (step === 1) {
    if (isBlank(form.contact.fullName)) {
      errors['contact.fullName'] = 'Enter your full name'
    }

    if (isBlank(form.contact.email)) {
      errors['contact.email'] = 'Enter your email address'
    } else if (!EMAIL_PATTERN.test(form.contact.email.trim())) {
      errors['contact.email'] = 'Enter a valid email address'
    }

    if (isBlank(form.contact.phone)) {
      errors['contact.phone'] = 'Enter your phone number'
    }

    if (isBlank(form.contact.location)) {
      errors['contact.location'] = 'Enter your town or city'
    }
  }

  if (step === 2) {
    if (isBlank(form.hardSkillsRaw)) {
      errors.hardSkillsRaw = 'Add at least one hard skill'
    }
  }

  if (step === 3) {
    const hasEducation = form.education.some(
      (entry) => !isBlank(entry.institution) && !isBlank(entry.qualification)
    )

    if (!hasEducation) {
      errors.education = 'Add at least one education entry with an institution and qualification'
    }

    for (const entry of form.education) {
      const partiallyFilled =
        !isBlank(entry.institution) ||
        !isBlank(entry.qualification) ||
        !isBlank(entry.startDate) ||
        !isBlank(entry.endDate) ||
        !isBlank(entry.grade) ||
        !isBlank(entry.details)

      if (partiallyFilled && isBlank(entry.institution)) {
        errors[`education.${entry.id}.institution`] = 'Enter the institution name'
      }

      if (partiallyFilled && isBlank(entry.qualification)) {
        errors[`education.${entry.id}.qualification`] = 'Enter the qualification'
      }
    }

    for (const entry of form.experience) {
      if (experienceEntryIsEmpty(entry)) {
        continue
      }

      if (isBlank(entry.role)) {
        errors[`experience.${entry.id}.role`] = 'Enter your role title'
      }

      if (isBlank(entry.company)) {
        errors[`experience.${entry.id}.company`] = 'Enter the company name'
      }
    }

    for (const entry of form.projects) {
      if (!isBlank(entry.description) && isBlank(entry.name)) {
        errors[`projects.${entry.id}.name`] = 'Enter the project name'
      }
    }
  }

  if (step === 4) {
    if (!form.industry) {
      errors.industry = 'Select the STEM industry you are applying to'
    }
  }

  return errors
}
