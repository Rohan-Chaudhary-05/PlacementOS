// Deterministic, in-browser CV parser. Takes plain text extracted from an
// uploaded CV and produces a best-effort patch for the wizard form, plus a
// report (what was found + confidence + segmented sections) that powers both the
// import summary and the manual-tagging fallback.
//
// No network, no AI, no storage — pure string heuristics. Imperfect by nature;
// the manual fallback exists precisely for the cases this misses.
// tsconfig target is es2020 — no regex `u` flag is used here.

import type { CvFormData, EducationEntry, ExperienceEntry } from './types'

export type CvSectionKey =
  | 'summary'
  | 'skills'
  | 'experience'
  | 'education'
  | 'projects'
  | 'certifications'

export type CvExtraction = {
  /** Fields to merge into the wizard form. */
  patch: Partial<CvFormData>
  /** Human-readable labels of what was filled, for the success summary. */
  found: string[]
  /** Every non-empty line of the CV, in order (for manual tagging). */
  lines: string[]
  /** Lines grouped under the section heading we detected them below. */
  sections: Record<CvSectionKey, string[]>
  confidence: 'high' | 'medium' | 'low'
}

// ───────────────────────── Patterns ─────────────────────────
// Domain split into dot-free labels so '.' can never match two ways — keeps this
// linear (no catastrophic backtracking) even on adversarial input. Quantifiers
// are bounded for the same reason.
const EMAIL_RE = /[A-Za-z0-9._%+-]{1,64}@[A-Za-z0-9-]{1,63}(?:\.[A-Za-z0-9-]{1,63})*\.[A-Za-z]{2,24}/
const LINKEDIN_RE = /(?:https?:\/\/)?(?:[a-z]{2,3}\.)?linkedin\.com\/(?:in|pub)\/[A-Za-z0-9_%-]+\/?/i
// A phone number: optional +, then 9–15 digits possibly grouped with spaces/()-.
const PHONE_RE = /(?:\+?\d[\d\s().-]{8,18}\d)/
const URL_BULLET = /^[••▪◦‣⁃·*–—>\-–—]+\s*/

// Bounded trailing quantifier ({0,7} covers "september"/"december") so a long
// run of lowercase letters can't be split many ways (ReDoS).
const MONTH = '(?:jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)[a-z]{0,7}\\.?'
const YEAR = '(?:19|20)\\d{2}'
const DATE = `(?:(?:${MONTH}|\\d{1,2})[\\s/.]+)?${YEAR}`
const PRESENT = 'present|current|now|ongoing|to date|till date'
const DATE_RANGE_RE = new RegExp(
  `(${DATE})\\s*(?:-|–|—|to|until|through)\\s*(${DATE}|${PRESENT})`,
  'i'
)

const INSTITUTION_RE = /\b(university|college|institute|school|academy|polytechnic|sixth form)\b/i
const DEGREE_RE = /\b(bsc|b\.sc|ba|b\.a|beng|meng|msc|m\.sc|ma|mba|mphil|phd|llb|llm|hnd|hnc|btec|a[-\s]?levels?|gcses?|ib|diploma|foundation|bachelor|master|doctorate|degree)\b/i
const GRADE_RE = /\b(first[-\s]?class|1st\s+class|first|2:1|2\.1|upper\s+second|2:2|2\.2|lower\s+second|third\s+class|distinction|merit|pass|gpa\s*[:=]?\s*[0-4](?:\.\d+)?|predicted\s+[\w:.]+)\b/i

const SECTION_SYNONYMS: Array<{ key: CvSectionKey; words: string[] }> = [
  { key: 'summary', words: ['summary', 'profile', 'personal statement', 'personal profile', 'about me', 'objective', 'professional summary', 'career objective'] },
  { key: 'skills', words: ['skills', 'technical skills', 'key skills', 'core skills', 'core competencies', 'competencies', 'technical competencies', 'areas of expertise'] },
  { key: 'experience', words: ['experience', 'work experience', 'employment', 'employment history', 'professional experience', 'work history', 'career history', 'relevant experience'] },
  { key: 'education', words: ['education', 'academic background', 'qualifications', 'academic history', 'academic qualifications', 'education and qualifications'] },
  { key: 'projects', words: ['projects', 'personal projects', 'academic projects', 'key projects', 'selected projects'] },
  { key: 'certifications', words: ['certifications', 'certificates', 'licenses', 'licences', 'courses', 'professional development', 'awards', 'achievements'] },
]

// Words that disqualify a line from being a person's name.
const NAME_STOPWORDS = /\b(curriculum|vitae|resume|résumé|cv|profile|address|phone|email|mobile|tel|linkedin|github|portfolio)\b/i

function newId(prefix: string, i: number): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `${prefix}-${i}-${Math.round(Math.random() * 1e9)}`
}

function headingKey(line: string): CvSectionKey | null {
  // A heading is short and (after stripping trailing colon/punctuation) matches a synonym.
  const cleaned = line.trim().replace(/[:•.\-–—]+$/, '').trim().toLowerCase()
  if (cleaned.length === 0 || cleaned.length > 45) return null
  for (const { key, words } of SECTION_SYNONYMS) {
    for (const w of words) {
      if (cleaned === w || cleaned === `${w}s` || cleaned.startsWith(`${w} `) || cleaned.startsWith(`${w}:`)) {
        return key
      }
    }
  }
  return null
}

function stripBullet(line: string): string {
  return line.replace(URL_BULLET, '').trim()
}

function matchDateRange(line: string): { raw: string; start: string; end: string } | null {
  if (line.length > 200) return null // date ranges never live in very long lines
  const m = DATE_RANGE_RE.exec(line)
  if (!m) return null
  const titleCase = (s: string) => s.replace(/\b\w/g, (c) => c.toUpperCase())
  return { raw: m[0], start: titleCase(m[1].trim()), end: titleCase(m[2].trim()) }
}

function looksLikeName(line: string): boolean {
  const t = line.trim()
  if (t.length < 3 || t.length > 50) return false
  if (NAME_STOPWORDS.test(t)) return false
  if (/[@\d/]/.test(t)) return false
  const words = t.split(/\s+/)
  if (words.length < 2 || words.length > 4) return false
  // Each word starts with a capital (allow ALL CAPS names too).
  return words.every((w) => /^[A-Z][a-zA-Z'’.-]*$/.test(w) || /^[A-Z]{2,}$/.test(w))
}

export function skillsFromLines(lines: string[]): string[] {
  const out: string[] = []
  for (const raw of lines) {
    const line = stripBullet(raw)
      // drop a leading "Category:" label so we keep the actual skills
      .replace(/^[A-Za-z &/]{2,30}:\s*/, '')
    for (const token of line.split(/[,;|/•·•\t]| {2,}/)) {
      const s = token.trim().replace(/\.$/, '')
      if (s.length >= 2 && s.length <= 40 && /[a-zA-Z]/.test(s)) out.push(s)
    }
  }
  // De-dupe case-insensitively, preserve order.
  const seen = new Set<string>()
  const deduped: string[] = []
  for (const s of out) {
    const k = s.toLowerCase()
    if (!seen.has(k)) {
      seen.add(k)
      deduped.push(s)
    }
  }
  return deduped.slice(0, 40)
}

function assignRoleCompany(text: string): { role: string; company: string } {
  const cleaned = text.replace(/\s{2,}/g, ' ').trim()
  for (const sep of [' at ', ' — ', ' – ', ' - ', ' | ', ', ']) {
    const i = cleaned.indexOf(sep)
    if (i > 0 && i < cleaned.length - sep.length) {
      return { role: cleaned.slice(0, i).trim(), company: cleaned.slice(i + sep.length).trim() }
    }
  }
  return { role: cleaned, company: '' }
}

export function parseExperienceLines(lines: string[]): ExperienceEntry[] {
  const entries: ExperienceEntry[] = []
  let pendingTitle = ''
  let i = 0
  for (const raw of lines) {
    const line = raw.trim()
    if (!line) continue
    const dr = matchDateRange(line)
    const bullet = URL_BULLET.test(line)

    if (dr && !bullet) {
      const titleText = line.replace(dr.raw, '').replace(/[•|]/g, ' ').trim() || pendingTitle
      const { role, company } = assignRoleCompany(titleText)
      entries.push({
        id: newId('exp', i++),
        role,
        company,
        startDate: dr.start,
        endDate: dr.end,
        bulletsRaw: '',
      })
      pendingTitle = ''
    } else if (
      entries.length > 0 &&
      (bullet || /^[a-z]/.test(line) || /[.;]$/.test(line) || line.split(/\s+/).length >= 4)
    ) {
      // After an entry has started, a non-date line that reads like a phrase is a
      // bullet. Short Title-Case lines (≤3 words) are held as a possible next title.
      const cur = entries[entries.length - 1]
      cur.bulletsRaw = cur.bulletsRaw ? `${cur.bulletsRaw}\n${stripBullet(line)}` : stripBullet(line)
    } else {
      pendingTitle = line
    }
  }
  return entries.slice(0, 6)
}

export function parseEducationLines(lines: string[]): EducationEntry[] {
  const entries: EducationEntry[] = []
  let i = 0
  const start = (): EducationEntry => {
    const e: EducationEntry = {
      id: newId('edu', i++),
      institution: '',
      qualification: '',
      startDate: '',
      endDate: '',
      grade: '',
      details: '',
    }
    entries.push(e)
    return e
  }

  for (const raw of lines) {
    const line = stripBullet(raw)
    if (!line) continue
    let cur = entries[entries.length - 1]
    const hasInst = INSTITUTION_RE.test(line)
    const hasDeg = DEGREE_RE.test(line)

    // Start a new entry on a fresh institution/degree line once the current one is populated.
    if (!cur || ((hasInst || hasDeg) && (cur.institution || cur.qualification) && (cur.institution ? hasInst : true))) {
      cur = start()
    }

    if (hasInst && !cur.institution) cur.institution = line.replace(/\s*[•|].*$/, '').trim()
    if (hasDeg && !cur.qualification) cur.qualification = line.replace(/\s*[•|].*$/, '').trim()

    const dr = matchDateRange(line)
    if (dr && !cur.startDate && !cur.endDate) {
      cur.startDate = dr.start
      cur.endDate = dr.end
    }
    const grade = GRADE_RE.exec(line)
    if (grade && !cur.grade) cur.grade = grade[0].replace(/\b\w/g, (c) => c.toUpperCase())

    if (!hasInst && !hasDeg && !dr) {
      cur.details = cur.details ? `${cur.details} ${line}` : line
    }
  }

  // Keep only entries that have at least an institution or a qualification.
  return entries.filter((e) => e.institution || e.qualification).slice(0, 4)
}

function firstUkLocation(lines: string[]): string {
  const cityList = /\b(london|manchester|birmingham|leeds|glasgow|sheffield|bradford|edinburgh|liverpool|bristol|cardiff|coventry|leicester|nottingham|newcastle|brighton|southampton|portsmouth|oxford|cambridge|york|reading|derby|stevenage|belfast|aberdeen|dundee|exeter|bath|norwich|swansea)\b/i
  for (const raw of lines.slice(0, 8)) {
    const line = raw.trim()
    const ukComma = /,\s*(uk|united kingdom|england|scotland|wales|northern ireland)\b/i.exec(line)
    if (ukComma) {
      // Take the segment ending with the matched country.
      const seg = line.slice(0, ukComma.index + ukComma[0].length).split(/[•|]/).pop() || line
      return seg.trim().replace(/^[,\s]+/, '')
    }
    const city = cityList.exec(line)
    if (city && line.length < 60) return city[0].replace(/\b\w/g, (c) => c.toUpperCase())
  }
  return ''
}

export function extractCvFromText(text: string): CvExtraction {
  // Bound the work: real CVs are a few KB. Cap total size, per-line length, and
  // line count so a pathological file (e.g. one giant line) can't hang the tab.
  const lines = text
    .slice(0, 200_000)
    .replace(/\r/g, '')
    .split('\n')
    .map((l) => l.slice(0, 2_000).replace(/ /g, ' ').replace(/[ \t]+/g, ' ').trim())
    .filter((l) => l.length > 0)
    .slice(0, 5_000)

  const fullText = lines.join('\n')

  // Segment into sections.
  const sections: Record<CvSectionKey, string[]> = {
    summary: [], skills: [], experience: [], education: [], projects: [], certifications: [],
  }
  const header: string[] = []
  let current: CvSectionKey | null = null
  for (const line of lines) {
    const key = headingKey(line)
    if (key) {
      current = key
      continue
    }
    if (current) sections[current].push(line)
    else header.push(line)
  }

  // ---- Simple fields (scan whole document) ----
  const patch: Partial<CvFormData> = {}
  const contact: Partial<CvFormData['contact']> = {}
  const found: string[] = []

  const nameLine = header.find(looksLikeName) ?? lines.find(looksLikeName)
  if (nameLine) {
    contact.fullName = nameLine.trim()
    found.push('Name')
  }

  const email = EMAIL_RE.exec(fullText)
  if (email) {
    contact.email = email[0]
    found.push('Email')
  }

  const linkedin = LINKEDIN_RE.exec(fullText)
  if (linkedin) {
    contact.linkedin = linkedin[0].replace(/^https?:\/\//, '')
    found.push('LinkedIn')
  }

  // Phone: search line-by-line so we don't grab a date range or long digit run.
  // Strip any email / LinkedIn first — CVs often put them on one " · "-separated
  // contact line, and we must not let the email swallow the phone next to it.
  for (const line of lines) {
    const stripped = line.replace(EMAIL_RE, ' ').replace(LINKEDIN_RE, ' ')
    const m = PHONE_RE.exec(stripped)
    if (m) {
      const digits = m[0].replace(/\D/g, '')
      if (digits.length >= 10 && digits.length <= 15) {
        contact.phone = m[0].trim()
        found.push('Phone')
        break
      }
    }
  }

  const location = firstUkLocation(header.length ? header : lines)
  if (location) {
    contact.location = location
    found.push('Location')
  }

  if (Object.keys(contact).length > 0) patch.contact = contact as CvFormData['contact']

  // ---- Summary ----
  if (sections.summary.length > 0) {
    const summary = sections.summary.join(' ').replace(/\s{2,}/g, ' ').trim().slice(0, 700)
    if (summary.length > 0) {
      patch.summary = summary
      found.push('Summary')
    }
  }

  // ---- Skills ----
  const skills = skillsFromLines(sections.skills)
  if (skills.length > 0) {
    patch.hardSkillsRaw = skills.join(', ')
    found.push(`${skills.length} skill${skills.length === 1 ? '' : 's'}`)
  }

  // ---- Certifications ----
  if (sections.certifications.length > 0) {
    const certs = sections.certifications.map(stripBullet).filter((l) => l.length > 1).slice(0, 12)
    if (certs.length > 0) {
      patch.certificationsRaw = certs.join('\n')
      found.push(`${certs.length} certification${certs.length === 1 ? '' : 's'}`)
    }
  }

  // ---- Education ----
  const education = parseEducationLines(sections.education)
  if (education.length > 0) {
    patch.education = education
    found.push(`${education.length} education entr${education.length === 1 ? 'y' : 'ies'}`)
  }

  // ---- Experience ----
  const experience = parseExperienceLines(sections.experience)
  if (experience.length > 0) {
    patch.experience = experience
    found.push(`${experience.length} experience entr${experience.length === 1 ? 'y' : 'ies'}`)
  }

  // ---- Confidence ----
  const hasContact = Boolean(contact.fullName && contact.email)
  const hasBody = skills.length > 0 && (education.length > 0 || experience.length > 0)
  const confidence: CvExtraction['confidence'] =
    hasContact && hasBody ? 'high' : found.length >= 3 ? 'medium' : 'low'

  return { patch, found, lines, sections, confidence }
}
