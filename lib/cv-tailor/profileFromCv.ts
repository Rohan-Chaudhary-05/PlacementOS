// Maps the deterministic CV extraction (lib/cv-tailor/extractCv) onto the three
// student match-profile fields a CV reliably contains: discipline, skills, and
// preferred location. Pure and deterministic — no Date/random/IO — so it is safe
// on client + server and trivial to unit-test. Everything stays in the browser;
// this only reshapes already-parsed text.

import type { CvExtraction } from './extractCv'
import { parseSkillList } from './engine'

export type ProfileCvPatch = {
  discipline?: string
  skills?: string
  preferred_locations?: string
}

// Caps mirror validateStudentProfile / the SQL column limits.
const DISCIPLINE_MAX = 120
const SKILLS_MAX = 2000
const LOCATION_MAX = 500

export function profileFromCv(extraction: CvExtraction): { patch: ProfileCvPatch; filled: string[] } {
  const cv = extraction.patch
  const patch: ProfileCvPatch = {}
  const filled: string[] = []

  // Skills — the strongest match signal (35% of the score). hardSkillsRaw is the
  // comma-joined, deduped list the extractor already built; re-run it through
  // parseSkillList for canonical spellings (nodejs → Node.js, etc.).
  const skills = parseSkillList(cv.hardSkillsRaw ?? '')
  if (skills.length > 0) {
    patch.skills = skills.join(', ').slice(0, SKILLS_MAX)
    filled.push(`${skills.length} skill${skills.length === 1 ? '' : 's'}`)
  }

  // Discipline — the first education entry's qualification line ("BSc Computer
  // Science"). The match engine keys discipline→sector on keywords, so the degree
  // prefix is harmless.
  const qualification = cv.education?.[0]?.qualification
  if (qualification) {
    const discipline = qualification.replace(/\s+/g, ' ').trim().slice(0, DISCIPLINE_MAX)
    if (discipline) {
      patch.discipline = discipline
      filled.push('Discipline')
    }
  }

  // Preferred location — the UK location the extractor found in the CV header.
  const location = cv.contact?.location
  if (location) {
    const trimmed = location.replace(/\s+/g, ' ').trim().slice(0, LOCATION_MAX)
    if (trimmed) {
      patch.preferred_locations = trimmed
      filled.push('Location')
    }
  }

  return { patch, filled }
}
