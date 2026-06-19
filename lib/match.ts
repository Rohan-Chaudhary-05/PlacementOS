// Deterministic, personalised opportunity matching. Isomorphic + pure — no
// Date/Math.random, no Supabase, no server-only imports (same discipline as
// lib/tracker.ts) so it can run in the client island and be unit-tested.

import { parseSkillList } from '@/lib/cv-tailor/engine'
import { WORK_MODE_LABELS, type Sector, type WorkMode } from '@/lib/constants'

/** The student_profiles row shape (snake_case, as returned by supabase-js). */
export type StudentProfile = {
  discipline: string | null
  study_year: string | null
  skills: string | null
  target_sectors: string[]
  work_modes: string[]
  preferred_locations: string | null
  min_salary: number | null
}

/** The opportunity fields matching needs — a structural subset of OpportunityView. */
export type MatchableOpp = {
  sector: string
  workMode: WorkMode
  location: string
  salaryMin: number
  salaryMax: number
  requirements: string | null
  description: string
  role: string
}

export type MatchBand = 'strong' | 'good' | 'weak'
export type MatchResult = { score: number; reasons: string[]; band: MatchBand }

export function bandFor(score: number): MatchBand {
  if (score >= 80) return 'strong'
  if (score >= 60) return 'good'
  return 'weak'
}

/** Map a band to the existing Badge palette. */
export const BAND_BADGE_VARIANT: Record<MatchBand, 'success' | 'accent' | 'muted'> = {
  strong: 'success',
  good: 'accent',
  weak: 'muted',
}

// Free-text discipline → a canonical Sector (first match wins; specific before
// broad so "aerospace engineering" → Aerospace, "electrical engineering" → Engineering).
const DISCIPLINE_SECTOR: Array<[RegExp, Sector]> = [
  [/data|machine learning|\bml\b|\bai\b|analyt|statistic/i, 'Data Science & AI'],
  [/software|computer sci|computing|comp sci|informatic|programming/i, 'Software & IT'],
  [/aerospace|aeronaut|avionic/i, 'Aerospace & Defence'],
  [/biotech|biolog|biochem|pharma|genetic|biomed/i, 'Biotech & Pharma'],
  [/medic|health|clinical|medtech|nursing/i, 'Healthcare & MedTech'],
  [/energy|renewable|sustainab|environment|climate/i, 'Energy & Sustainability'],
  [/finance|financ|\bquant|economic|accounting|actuar/i, 'Finance & Quantitative'],
  [/telecom|network|communication/i, 'Telecommunications'],
  [/manufactur|production|industrial/i, 'Manufacturing'],
  [/physics|chemistry|mathemat|\bmaths\b|research/i, 'Research & Academia'],
  [/mechanical|civil|electric|electronic|structural|engineer/i, 'Engineering'],
]

function disciplineSector(discipline: string): Sector | null {
  for (const [re, sector] of DISCIPLINE_SECTOR) if (re.test(discipline)) return sector
  return null
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/** How many of the student's skills appear (word-boundary, case-insensitive) in the text. */
function countSkillMatches(skills: string[], haystack: string): number {
  const lower = haystack.toLowerCase()
  let matched = 0
  for (const skill of skills) {
    const re = new RegExp(`(^|\\W)${escapeRegex(skill.toLowerCase())}($|\\W)`)
    if (re.test(lower)) matched += 1
  }
  return matched
}

function formatFloor(n: number): string {
  return '£' + String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

/**
 * Score how well an opportunity fits a student's profile (0–100) with a short
 * list of human reasons. Weighted average over ONLY the dimensions the student
 * expressed a preference in (renormalised), so a blank field is neutral — never
 * a penalty. Returns null when there's no profile or no active dimension (the
 * caller then shows a non-personalised fallback badge).
 */
export function scoreMatch(profile: StudentProfile | null, opp: MatchableOpp): MatchResult | null {
  if (!profile) return null

  const targetSectors = profile.target_sectors ?? []
  const workModes = profile.work_modes ?? []
  const skills = parseSkillList(profile.skills ?? '')
  const locations = (profile.preferred_locations ?? '')
    .split(/[,\n]/)
    .map((s) => s.trim())
    .filter(Boolean)
  const discipline = (profile.discipline ?? '').trim()
  const minSalary = profile.min_salary ?? 0

  const reasons: string[] = []
  let weightedSum = 0
  let totalWeight = 0

  // Sector (30) — exact target hit, else partial credit for discipline affinity.
  if (targetSectors.length > 0 || discipline.length > 0) {
    let sub = 0
    if (targetSectors.includes(opp.sector)) {
      sub = 1
      reasons.push('Matches your target sector')
    } else if (discipline && disciplineSector(discipline) === opp.sector) {
      sub = 0.6
      reasons.push('Aligned with your discipline')
    }
    weightedSum += 30 * sub
    totalWeight += 30
  }

  // Skills (35) — overlap with the listing's requirements/description/role.
  if (skills.length > 0) {
    const matched = countSkillMatches(skills, `${opp.requirements ?? ''} ${opp.description} ${opp.role}`)
    const sub = Math.min(1, matched / Math.min(skills.length, 5))
    if (matched > 0) reasons.push(`${matched} of your skill${matched === 1 ? '' : 's'} mentioned`)
    weightedSum += 35 * sub
    totalWeight += 35
  }

  // Work mode (15)
  if (workModes.length > 0) {
    const sub = workModes.includes(opp.workMode) ? 1 : 0
    if (sub === 1) reasons.push(`${WORK_MODE_LABELS[opp.workMode]} — your preference`)
    weightedSum += 15 * sub
    totalWeight += 15
  }

  // Location (10) — substring of any chosen location, or remote works anywhere.
  if (locations.length > 0) {
    const loc = opp.location.toLowerCase()
    let sub = 0
    if (locations.some((l) => loc.includes(l.toLowerCase()))) {
      sub = 1
      reasons.push(`In ${opp.location.split(',')[0].trim()} — a location you chose`)
    } else if (opp.workMode === 'REMOTE') {
      sub = 1
      reasons.push('Remote — works anywhere')
    }
    weightedSum += 10 * sub
    totalWeight += 10
  }

  // Salary (10) — meets the floor, with soft partial credit for a near miss.
  if (minSalary > 0) {
    let sub: number
    if (opp.salaryMax >= minSalary) {
      sub = 1
      reasons.push(`Pays above your ${formatFloor(minSalary)} floor`)
    } else {
      sub = Math.max(0, Math.min(1, opp.salaryMax / minSalary))
    }
    weightedSum += 10 * sub
    totalWeight += 10
  }

  if (totalWeight === 0) return null
  const score = Math.round((100 * weightedSum) / totalWeight)
  return { score, reasons: reasons.slice(0, 4), band: bandFor(score) }
}
