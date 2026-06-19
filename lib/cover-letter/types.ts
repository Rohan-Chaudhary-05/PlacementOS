import type { StemIndustryId } from '@/lib/cv-tailor/types'

export type CoverLetterForm = {
  // You
  fullName: string
  email: string
  phone: string
  location: string
  /** e.g. "second-year BSc Computer Science student" */
  qualification: string
  // The role
  company: string
  role: string
  industry: StemIndustryId | ''
  /** Optional — named recipient. Drives "Dear …," + sincerely/faithfully. */
  hiringManager: string
  /** Optional — where you saw the role, e.g. "on your careers page". */
  source: string
  // Your pitch
  /** Comma/newline separated */
  skillsRaw: string
  /** One achievement / highlight per line */
  achievementsRaw: string
  /** Optional — why this company, in your own words */
  motivation: string
}

export type GeneratedCoverLetter = {
  date: string
  /** Your sender contact line (location · phone · email) */
  contactLine: string
  fullName: string
  /** Recipient heading lines (company, "Re: … Placement", source) */
  recipientBlock: string[]
  greeting: string
  paragraphs: string[]
  signOff: string
  meta: { company: string; role: string; industryLabel: string }
}

/** Keys like "fullName", "company", "skillsRaw" */
export type CoverLetterErrors = Record<string, string>
