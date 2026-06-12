export type ContactDetails = {
  fullName: string
  email: string
  phone: string
  location: string
  linkedin: string
}

export type ExperienceEntry = {
  id: string
  role: string
  company: string
  startDate: string
  endDate: string
  /** One bullet point per line */
  bulletsRaw: string
}

export type EducationEntry = {
  id: string
  institution: string
  qualification: string
  startDate: string
  endDate: string
  grade: string
  details: string
}

export type ProjectEntry = {
  id: string
  name: string
  description: string
}

export type StemIndustryId =
  | 'software-it'
  | 'data-ai'
  | 'eng-mechanical'
  | 'eng-civil'
  | 'eng-electrical'
  | 'biotech-pharma'
  | 'healthcare-medtech'
  | 'energy-sustainability'
  | 'aerospace-defence'
  | 'finance-quant'
  | 'telecoms'
  | 'research-academia'

export type CvFormData = {
  contact: ContactDetails
  /** Optional — the engine generates one when left blank */
  summary: string
  /** Comma/newline separated */
  hardSkillsRaw: string
  softSkillsRaw: string
  /** AI tools, software and technology use */
  toolsAndAiRaw: string
  /** One certification per line */
  certificationsRaw: string
  experience: ExperienceEntry[]
  education: EducationEntry[]
  projects: ProjectEntry[]
  industry: StemIndustryId | ''
  targetCompany: string
}

export type PolishedCv = {
  contact: {
    fullName: string
    email: string
    phone: string
    location: string
    linkedin?: string
  }
  headline: string
  summary: string
  skillGroups: Array<{ heading: string; skills: string[] }>
  education: Array<{
    qualification: string
    institution: string
    dateRange: string
    grade?: string
    details?: string
  }>
  experience: Array<{
    role: string
    company: string
    dateRange: string
    bullets: string[]
  }>
  projects: Array<{ name: string; description: string }>
  certifications: string[]
  meta: { industryLabel: string; targetCompany?: string }
}

/** Keys like "contact.email", "experience.<id>.role" */
export type CvFormErrors = Record<string, string>
