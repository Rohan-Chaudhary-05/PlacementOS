import { getIndustryProfile, type IndustryProfile } from './industries'
import type { CvFormData, PolishedCv, StemIndustryId } from './types'

/**
 * Canonical spellings for tech terms, keyed by lowercase form.
 * Null prototype so user words like "constructor" can't hit Object.prototype.
 */
const CANONICAL_SPELLINGS: Record<string, string> = Object.assign(Object.create(null), {
  sql: 'SQL',
  nosql: 'NoSQL',
  ai: 'AI',
  ml: 'ML',
  nlp: 'NLP',
  aws: 'AWS',
  gcp: 'GCP',
  api: 'API',
  apis: 'APIs',
  html: 'HTML',
  css: 'CSS',
  php: 'PHP',
  cad: 'CAD',
  matlab: 'MATLAB',
  simulink: 'Simulink',
  cfd: 'CFD',
  fea: 'FEA',
  pcb: 'PCB',
  hplc: 'HPLC',
  pcr: 'PCR',
  elisa: 'ELISA',
  gmp: 'GMP',
  gis: 'GIS',
  lca: 'LCA',
  vba: 'VBA',
  rf: 'RF',
  '5g': '5G',
  'tcp/ip': 'TCP/IP',
  vhdl: 'VHDL',
  verilog: 'Verilog',
  'ci/cd': 'CI/CD',
  latex: 'LaTeX',
  javascript: 'JavaScript',
  typescript: 'TypeScript',
  'node.js': 'Node.js',
  nodejs: 'Node.js',
  pytorch: 'PyTorch',
  tensorflow: 'TensorFlow',
  numpy: 'NumPy',
  'scikit-learn': 'scikit-learn',
  powerpoint: 'PowerPoint',
  'power bi': 'Power BI',
  'vs code': 'VS Code',
  vscode: 'VS Code',
  solidworks: 'SolidWorks',
  autocad: 'AutoCAD',
  ltspice: 'LTspice',
  github: 'GitHub',
  gitlab: 'GitLab',
  linkedin: 'LinkedIn',
  chatgpt: 'ChatGPT',
  'c++': 'C++',
  'c#': 'C#',
  c: 'C',
  r: 'R',
  'gd&t': 'GD&T',
  etabs: 'ETABS',
  staad: 'STAAD',
  catia: 'CATIA',
  'iso 13485': 'ISO 13485',
})

/** Words kept lowercase inside multi-word skills */
const LOWERCASE_WORDS = new Set(['and', 'of', 'for', 'with', 'the', 'in', 'on', 'to'])

/**
 * Weak bullet openers swapped for stronger action verbs (longest match wins).
 * Only swaps that stay grammatical for any continuation — "helped train two
 * starters" is deliberately left alone because "Supported train…" is not.
 */
const WEAK_STARTERS: Array<[string, string]> = [
  ['was involved in ', 'Contributed to '],
  ['responsible for ', 'Owned '],
  ['worked on ', 'Delivered '],
  ['did ', 'Completed '],
  ['i ', ''],
]

function collapseWhitespace(value: string): string {
  return value.replace(/\s+/g, ' ').trim()
}

function capitalizeFirst(value: string): string {
  if (!value) {
    return value
  }

  return value.charAt(0).toUpperCase() + value.slice(1)
}

/** Small deterministic string hash, used to vary template choice per user */
function hashString(value: string): number {
  let hash = 0

  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) | 0
  }

  return Math.abs(hash)
}

function canonicalizeSkill(raw: string): string {
  const cleaned = collapseWhitespace(raw)
  const wholeMatch = CANONICAL_SPELLINGS[cleaned.toLowerCase()]

  if (wholeMatch) {
    return wholeMatch
  }

  return cleaned
    .split(' ')
    .map((word, index) => {
      const canonical = CANONICAL_SPELLINGS[word.toLowerCase()]

      if (canonical) {
        return canonical
      }

      if (index > 0 && LOWERCASE_WORDS.has(word.toLowerCase())) {
        return word.toLowerCase()
      }

      // Preserve user casing like "JavaScript"; only lift all-lowercase words
      return word === word.toLowerCase() ? capitalizeFirst(word) : word
    })
    .join(' ')
}

/** Split a comma/semicolon/newline separated list, dedupe case-insensitively, fix casing */
export function parseSkillList(raw: string): string[] {
  const seen = new Set<string>()
  const skills: string[] = []

  for (const part of raw.split(/[,;\n]/)) {
    const skill = canonicalizeSkill(part)
    const key = skill.toLowerCase()

    if (skill && !seen.has(key)) {
      seen.add(key)
      skills.push(skill)
    }
  }

  return skills
}

function sortHardSkills(skills: string[], profile: IndustryProfile): string[] {
  const priorityIndex = (skill: string): number => {
    const lower = skill.toLowerCase()
    return profile.prioritySkills.findIndex(
      (priority) => lower === priority || new RegExp(`(^|\\W)${priority.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}($|\\W)`).test(lower)
    )
  }

  return [...skills].sort((a, b) => {
    const aIndex = priorityIndex(a)
    const bIndex = priorityIndex(b)

    if (aIndex !== -1 && bIndex !== -1) {
      return aIndex - bIndex
    }

    if (aIndex !== bIndex) {
      return aIndex !== -1 ? -1 : 1
    }

    return a.localeCompare(b)
  })
}

/** Clean a single bullet: strip markers, swap weak openers, capitalize, drop trailing period */
export function polishBullet(raw: string): string {
  let bullet = collapseWhitespace(raw.replace(/^[\s\-–—•*·]+/, ''))

  if (!bullet) {
    return ''
  }

  const lower = bullet.toLowerCase()

  for (const [weak, strong] of WEAK_STARTERS) {
    if (lower.startsWith(weak)) {
      bullet = strong + bullet.slice(weak.length)
      break
    }
  }

  return capitalizeFirst(bullet.replace(/\.+$/, '').trim())
}

function parseBullets(bulletsRaw: string): string[] {
  return bulletsRaw
    .split('\n')
    .map(polishBullet)
    .filter(Boolean)
}

function formatDateRange(startDate: string, endDate: string): string {
  const start = collapseWhitespace(startDate)
  const end = collapseWhitespace(endDate)

  if (!start && !end) {
    return ''
  }

  if (!start) {
    return end
  }

  return `${start} – ${end || 'Present'}`
}

function formatSkillsForSentence(skills: string[]): string {
  const top = skills.slice(0, 3)

  if (top.length <= 1) {
    return top.join('')
  }

  return `${top.slice(0, -1).join(', ')} and ${top[top.length - 1]}`
}

/** Ensure a sentence reads cleanly: collapsed whitespace, capitalized, terminal punctuation */
function normalizeSentence(value: string): string {
  const sentence = capitalizeFirst(collapseWhitespace(value))

  if (!sentence) {
    return ''
  }

  return /[.!?]$/.test(sentence) ? sentence : `${sentence}.`
}

export function buildSummary(form: CvFormData, profile: IndustryProfile): string {
  const company = collapseWhitespace(form.targetCompany)
  const target = company ? `at ${company}` : `in ${profile.label}`
  const seed = hashString(`${form.contact.fullName}${company}`)
  const theme = profile.themes[seed % profile.themes.length]
  const providedSummary = collapseWhitespace(form.summary)

  if (providedSummary) {
    const framing = `Now seeking a placement ${company ? `at ${company}` : `in ${profile.label}`} with a focus on ${theme}.`
    return `${normalizeSentence(providedSummary)} ${framing}`
  }

  const qualification = collapseWhitespace(form.education[0]?.qualification ?? '') || 'STEM'
  const hardSkills = sortHardSkills(parseSkillList(form.hardSkillsRaw), profile)
  const skillsPhrase = formatSkillsForSentence(hardSkills) || 'core technical fundamentals'
  const template = profile.summaryTemplates[seed % profile.summaryTemplates.length]

  // Single pass with a function replacement: immune to $-patterns in user
  // text and never re-scans substituted text for later placeholders
  const slots: Record<string, string> = {
    qualification,
    skills: skillsPhrase,
    theme,
    target,
  }

  return template.replace(/\{(qualification|skills|theme|target)\}/g, (_, key) => slots[key])
}

function buildHeadline(form: CvFormData, profile: IndustryProfile): string {
  const company = collapseWhitespace(form.targetCompany)
  const qualification = collapseWhitespace(form.education[0]?.qualification ?? '')
  const base = qualification ? `${qualification} Student` : 'STEM Student'

  if (company) {
    return `${base} · ${profile.label} Placement Candidate for ${company}`
  }

  return `${base} · Aspiring ${profile.label} Professional`
}

/** Deterministically assemble a polished CV from the structured form data */
export function buildPolishedCv(form: CvFormData): PolishedCv {
  if (!form.industry) {
    throw new Error('An industry must be selected before generating a CV')
  }

  const profile = getIndustryProfile(form.industry as StemIndustryId)
  const company = collapseWhitespace(form.targetCompany)

  const hardSkills = sortHardSkills(parseSkillList(form.hardSkillsRaw), profile)
  const toolsAndAi = parseSkillList(form.toolsAndAiRaw)
  const softSkills = parseSkillList(form.softSkillsRaw)

  const skillGroups = [
    { heading: profile.skillsHeading, skills: hardSkills },
    { heading: 'Software, Tools & AI', skills: toolsAndAi },
    { heading: 'Soft Skills', skills: softSkills },
  ].filter((group) => group.skills.length > 0)

  const education = form.education
    .filter((entry) => collapseWhitespace(entry.institution) || collapseWhitespace(entry.qualification))
    .map((entry) => {
      const grade = collapseWhitespace(entry.grade)
      const details = normalizeSentence(entry.details)

      return {
        qualification: capitalizeFirst(collapseWhitespace(entry.qualification)),
        institution: capitalizeFirst(collapseWhitespace(entry.institution)),
        dateRange: formatDateRange(entry.startDate, entry.endDate),
        ...(grade ? { grade } : {}),
        ...(details ? { details } : {}),
      }
    })

  const experience = form.experience
    .filter((entry) => collapseWhitespace(entry.role) || collapseWhitespace(entry.company))
    .map((entry) => ({
      role: capitalizeFirst(collapseWhitespace(entry.role)),
      company: capitalizeFirst(collapseWhitespace(entry.company)),
      dateRange: formatDateRange(entry.startDate, entry.endDate),
      bullets: parseBullets(entry.bulletsRaw),
    }))

  const projects = form.projects
    .filter((entry) => collapseWhitespace(entry.name))
    .map((entry) => ({
      name: capitalizeFirst(collapseWhitespace(entry.name)),
      description: normalizeSentence(entry.description),
    }))

  // Certifications are titles, so they get the same canonical casing as skills
  const certifications = form.certificationsRaw
    .split('\n')
    .map(canonicalizeSkill)
    .filter(Boolean)

  const linkedin = collapseWhitespace(form.contact.linkedin)

  return {
    contact: {
      fullName: collapseWhitespace(form.contact.fullName),
      email: collapseWhitespace(form.contact.email),
      phone: collapseWhitespace(form.contact.phone),
      location: collapseWhitespace(form.contact.location),
      ...(linkedin ? { linkedin } : {}),
    },
    headline: buildHeadline(form, profile),
    summary: buildSummary(form, profile),
    skillGroups,
    education,
    experience,
    projects,
    certifications,
    meta: {
      industryLabel: profile.label,
      ...(company ? { targetCompany: company } : {}),
    },
  }
}
