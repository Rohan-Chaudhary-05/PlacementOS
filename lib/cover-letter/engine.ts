import { parseSkillList } from '@/lib/cv-tailor/engine'
import { getIndustryProfile } from '@/lib/cv-tailor/industries'
import type { StemIndustryId } from '@/lib/cv-tailor/types'
import type { CoverLetterForm, GeneratedCoverLetter } from './types'

function collapse(value: string): string {
  return value.replace(/\s+/g, ' ').trim()
}

function capitalizeFirst(value: string): string {
  return value ? value.charAt(0).toUpperCase() + value.slice(1) : value
}

/** Ensure a fragment reads as a sentence: trimmed, capitalised, terminal stop. */
function asSentence(value: string): string {
  const s = capitalizeFirst(collapse(value))
  if (!s) return ''
  return /[.!?]$/.test(s) ? s : `${s}.`
}

/** Small deterministic string hash — varies template choice per applicant/role. */
function hashString(value: string): number {
  let hash = 0
  for (let i = 0; i < value.length; i += 1) hash = (hash * 31 + value.charCodeAt(i)) | 0
  return Math.abs(hash)
}

/** "a, b and c" from the first three skills. */
function listSkills(skills: string[]): string {
  const top = skills.slice(0, 3)
  if (top.length === 0) return 'core technical fundamentals'
  if (top.length === 1) return top[0]
  return `${top.slice(0, -1).join(', ')} and ${top[top.length - 1]}`
}

function fill(template: string, slots: Record<string, string>): string {
  return collapse(template.replace(/\{(\w+)\}/g, (_, key) => slots[key] ?? ''))
}

/**
 * A natural reference to the role. Appends "placement" only when the title
 * doesn't already say it, so "Data Science Placement" doesn't become
 * "Data Science Placement placement".
 */
function roleReference(role: string): string {
  return /\b(placement|internship|intern|scheme|programme|program)\b/i.test(role) ? role : `${role} placement`
}

const INTRO = [
  'I am writing to apply for the {roleRef} at {company}. As a {qualification} with a genuine enthusiasm for {theme}, I was excited to come across this opportunity and would be keen to contribute to your team.',
  'I am delighted to submit my application for the {roleRef} at {company}. Currently a {qualification}, I am drawn to roles where I can apply my skills to {theme}, and this placement is exactly the kind of challenge I am looking for.',
  'Please accept my application for the {roleRef} at {company}. As a {qualification} motivated by {theme}, I believe a placement with your team would be the ideal next step in my development.',
]

const FIT = [
  'Through my studies and projects I have built strong skills in {skills}. {achievement} I am confident these strengths would allow me to make a meaningful contribution as a {role}.',
  'My background has given me hands-on experience with {skills}. {achievement} I am eager to apply this in a real-world setting and to keep learning alongside an experienced team.',
  'I bring practical skills in {skills}, developed through coursework and personal projects. {achievement} I would relish the chance to develop these further in the {role} role.',
]

const WHY = [
  'I am particularly drawn to {company} for its reputation in {industry} and its focus on {theme}. A placement here would let me learn from people doing work I admire.',
  'What attracts me to {company} is the opportunity to contribute to {theme} alongside a respected {industry} team, and to grow as a professional in the process.',
  '{company} stands out to me for its commitment to {theme}, and I would be proud to support that work during my placement.',
]

const CLOSE = [
  'I would welcome the chance to discuss how I could support the team as a {role}. Thank you for taking the time to consider my application — I look forward to hearing from you.',
  'I would be grateful for the opportunity to discuss my application further. Thank you for considering me for the {roleRef}; I hope to hear from you soon.',
  'Thank you for considering my application for the {roleRef} at {company}. I would be delighted to discuss how I can contribute, and look forward to your response.',
]

const pick = (arr: string[], seed: number) => arr[seed % arr.length]

/** Deterministically assemble a tailored cover letter from the form data. */
export function buildCoverLetter(form: CoverLetterForm, today: Date = new Date()): GeneratedCoverLetter {
  if (!form.industry) throw new Error('An industry must be selected before generating a cover letter')
  const profile = getIndustryProfile(form.industry as StemIndustryId)

  const company = collapse(form.company) || 'your company'
  const role = collapse(form.role) || 'placement'
  const qualification = collapse(form.qualification) || 'STEM student'
  const manager = collapse(form.hiringManager)
  const source = collapse(form.source)

  const seed = hashString(`${form.fullName}${company}${role}`)
  const theme = profile.themes[seed % profile.themes.length]
  const skills = listSkills(parseSkillList(form.skillsRaw))

  // Up to two achievements, woven into the fit paragraph as their own sentences.
  const achievements = form.achievementsRaw
    .split('\n')
    .map(asSentence)
    .filter(Boolean)
    .slice(0, 2)
    .join(' ')

  const slots = { role, roleRef: roleReference(role), company, qualification, theme, skills, industry: profile.label, achievement: achievements }

  const intro = pick(INTRO, seed)
  const introWithSource = source ? `${intro} I came across the role ${source}.` : intro

  const why = pick(WHY, seed + 1)
  const motivation = asSentence(form.motivation)
  const whyWithMotivation = motivation ? `${fill(why, slots)} ${motivation}` : fill(why, slots)

  const paragraphs = [
    fill(introWithSource, slots),
    fill(pick(FIT, seed + 2), slots),
    collapse(whyWithMotivation),
    fill(pick(CLOSE, seed + 3), slots),
  ]

  const contactLine = [collapse(form.location), collapse(form.phone), collapse(form.email)]
    .filter(Boolean)
    .join('   ·   ')

  const recipientBlock = [
    collapse(form.company) || 'Hiring Team',
    `Re: ${role} Placement`,
    ...(source ? [] : []),
  ]

  return {
    date: today.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
    contactLine,
    fullName: collapse(form.fullName),
    recipientBlock,
    greeting: manager ? `Dear ${manager},` : 'Dear Hiring Manager,',
    paragraphs,
    // UK convention: named recipient → "sincerely"; unnamed → "faithfully".
    signOff: manager ? 'Yours sincerely,' : 'Yours faithfully,',
    meta: { company, role, industryLabel: profile.label },
  }
}
