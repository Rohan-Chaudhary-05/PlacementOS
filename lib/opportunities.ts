// Public opportunities: the data behind the /opportunities tab and the
// /opportunities/[id] detail pages.
//
// Two sources are unified into one OpportunityView:
//   • Real ACCEPTED listings from Supabase (via the public_opportunities SQL
//     functions — safe columns only, no company email / internal review fields).
//   • Curated SAMPLE listings (DEMO_OPPORTUNITIES) shown pre-launch and as a
//     fallback so the page is never empty. Samples apply via the waitlist.
//
// Isomorphic: uses the public anon key + a SECURITY DEFINER aggregate, never the
// service-role key, so it is safe to call from server components.

import { createClient } from '@supabase/supabase-js'
import { SUPABASE_URL, SUPABASE_ANON_KEY, isSupabaseConfigured } from './supabase/env'
import type { PublicOpportunity, WorkMode } from './constants'

/** What both the listing cards and the detail page render. */
export type OpportunityView = {
  id: string
  role: string
  companyName: string
  companyWebsite: string | null
  location: string
  workMode: WorkMode
  salaryMin: number
  salaryMax: number
  currency: string
  sector: string
  duration: string
  deadline: string | null
  description: string
  companyValues: string | null
  requirements: string | null
  /** Real listings link here; demo listings are null (apply via waitlist). */
  applyUrl: string | null
  isDemo: boolean
  /** Initials for the logo avatar. */
  logo: string
}

function initialsFor(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean)
  if (words.length === 0) return '—'
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase()
  return (words[0][0] + words[1][0]).toUpperCase()
}

function publicToView(p: PublicOpportunity): OpportunityView {
  return {
    id: p.id,
    role: p.role,
    companyName: p.company_name,
    companyWebsite: p.company_website,
    location: p.location,
    workMode: p.work_mode,
    salaryMin: p.salary_min,
    salaryMax: p.salary_max,
    currency: p.currency,
    sector: p.sector,
    duration: p.duration,
    deadline: p.deadline,
    description: p.description,
    companyValues: p.company_values,
    requirements: p.requirements,
    applyUrl: p.apply_url,
    isDemo: false,
    logo: initialsFor(p.company_name),
  }
}

function anonClient() {
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}

/** Real ACCEPTED opportunities, newest first. [] when unconfigured or on error. */
export async function getPublicOpportunities(): Promise<OpportunityView[]> {
  if (!isSupabaseConfigured) return []
  try {
    const { data, error } = await anonClient().rpc('public_opportunities')
    if (error || !Array.isArray(data)) return []
    return (data as PublicOpportunity[]).map(publicToView)
  } catch {
    return []
  }
}

/** A single real ACCEPTED opportunity by UUID, or null. */
export async function getPublicOpportunity(id: string): Promise<OpportunityView | null> {
  if (!isSupabaseConfigured) return null
  try {
    const { data, error } = await anonClient().rpc('public_opportunity', { p_id: id })
    if (error || !Array.isArray(data) || data.length === 0) return null
    return publicToView(data[0] as PublicOpportunity)
  } catch {
    return null
  }
}

/** Resolve any listing id (demo- prefix → sample data, else → Supabase). */
export async function getOpportunityForDetail(id: string): Promise<OpportunityView | null> {
  if (id.startsWith('demo-')) return getDemoOpportunity(id)
  return getPublicOpportunity(id)
}

export function getDemoOpportunity(id: string): OpportunityView | null {
  return DEMO_OPPORTUNITIES.find((o) => o.id === id) ?? null
}

// ───────────────────── Sample / demo listings ─────────────────────
// FICTIONAL employers — the companies below are invented for illustration and
// do not exist; any resemblance to a real organisation is coincidental. Marked
// isDemo so the UI labels them "Sample" and routes "Apply" to the waitlist
// (the platform is pre-launch). Replaced by real ACCEPTED listings as
// companies post.
export const DEMO_OPPORTUNITIES: OpportunityView[] = [
  {
    id: 'demo-1',
    role: 'Data Science Placement',
    companyName: 'Helixon Bio',
    companyWebsite: null,
    location: 'Cambridge, UK',
    workMode: 'HYBRID',
    salaryMin: 22000,
    salaryMax: 24000,
    currency: 'GBP',
    sector: 'Biotech & Pharma',
    duration: '12 months',
    deadline: '2026-10-15',
    description:
      'Join a data science team building ML pipelines that support clinical-stage research, from data wrangling through to model evaluation. You will work alongside senior data scientists on real research problems with genuine ownership of your analyses.',
    companyValues:
      'Science-led and patient-focused. We value curiosity, careful methods and clear communication.',
    requirements:
      'On track for a 2:1+ in a numerate STEM degree. Python and basic statistics. Curiosity about healthcare and biology a plus.',
    applyUrl: null,
    isDemo: true,
    logo: 'HB',
  },
  {
    id: 'demo-2',
    role: 'Software Engineering Intern',
    companyName: 'Fenchip Systems',
    companyWebsite: null,
    location: 'Cambridge, UK',
    workMode: 'HYBRID',
    salaryMin: 28000,
    salaryMax: 30000,
    currency: 'GBP',
    sector: 'Software & IT',
    duration: '12 months',
    deadline: '2026-10-30',
    description:
      'Work on developer tooling for chip-design workflows, contributing to compilers or verification frameworks used by hardware engineering teams. Expect real ownership of features that ship internally.',
    companyValues:
      'Engineering rigour without ego. We prize deep work, honest code review and shipping things that last.',
    requirements:
      'Strong programming fundamentals (C++ or Python). Interest in low-level systems, compilers or hardware. No prior chip experience required.',
    applyUrl: null,
    isDemo: true,
    logo: 'FS',
  },
  {
    id: 'demo-3',
    role: 'Quantitative Finance Placement',
    companyName: 'Graywick Markets',
    companyWebsite: null,
    location: 'London, UK',
    workMode: 'OFFICE',
    salaryMin: 35000,
    salaryMax: 38000,
    currency: 'GBP',
    sector: 'Finance & Quantitative',
    duration: '12 months',
    deadline: '2026-11-01',
    description:
      'Support a quantitative team building models for risk, pricing and portfolio analytics across global markets. You will write production code and work directly with traders and quants.',
    companyValues:
      'Commercial, rigorous and collaborative. We hire people who want to grow fast and take responsibility early.',
    requirements:
      'Strong mathematics and programming (Python/C++). Comfortable with probability and linear algebra. Interest in markets.',
    applyUrl: null,
    isDemo: true,
    logo: 'GM',
  },
  {
    id: 'demo-4',
    role: 'Mechanical Engineering Placement',
    companyName: 'Kestrel Propulsion',
    companyWebsite: null,
    location: 'Derby, UK',
    workMode: 'OFFICE',
    salaryMin: 21000,
    salaryMax: 23000,
    currency: 'GBP',
    sector: 'Aerospace & Defence',
    duration: '12 months',
    deadline: '2026-10-20',
    description:
      'Embedded in a propulsion engineering team, you will assist senior engineers with structural analysis and CFD simulation for engine components used in civil aviation programmes.',
    companyValues:
      'Safety and engineering rigour come first, always. We act with integrity and operate as one team.',
    requirements:
      'On track for a 2:1+ in Mechanical or Aerospace Engineering. Familiarity with CAD/FEA tools is a plus.',
    applyUrl: null,
    isDemo: true,
    logo: 'KP',
  },
  {
    id: 'demo-5',
    role: 'Machine Learning Engineer Intern',
    companyName: 'Cortexa Research',
    companyWebsite: null,
    location: 'London, UK',
    workMode: 'HYBRID',
    salaryMin: 32000,
    salaryMax: 35000,
    currency: 'GBP',
    sector: 'Data Science & AI',
    duration: '6 months',
    deadline: '2026-11-10',
    description:
      'Contribute to applied machine-learning research. You will prototype models, run experiments and work with researchers turning ideas into working systems.',
    companyValues:
      'Scientific rigour, responsibility and bold ideas — research that ships and stands up to scrutiny.',
    requirements:
      'Strong mathematical foundations and Python. Experience with PyTorch/JAX a plus. Evidence of independent projects valued.',
    applyUrl: null,
    isDemo: true,
    logo: 'CR',
  },
  {
    id: 'demo-6',
    role: 'Chemical Engineering Placement',
    companyName: 'Tidegreen Energy',
    companyWebsite: null,
    location: 'Sunbury-on-Thames, UK',
    workMode: 'HYBRID',
    salaryMin: 23500,
    salaryMax: 25000,
    currency: 'GBP',
    sector: 'Energy & Sustainability',
    duration: '12 months',
    deadline: '2026-10-25',
    description:
      'Support a low-carbon projects team evaluating biofuels process economics and sustainability metrics for the energy transition, working on projects with real commercial weight.',
    companyValues:
      'Safety, respect and excellence. We are building practical routes to lower-carbon energy.',
    requirements:
      'On track for a 2:1+ in Chemical or Process Engineering. Interest in sustainability and the energy transition.',
    applyUrl: null,
    isDemo: true,
    logo: 'TE',
  },
  {
    id: 'demo-7',
    role: 'Technology Risk Analyst Placement',
    companyName: 'Ledgerstone Bank',
    companyWebsite: null,
    location: 'London, UK',
    workMode: 'HYBRID',
    salaryMin: 26000,
    salaryMax: 28000,
    currency: 'GBP',
    sector: 'Finance & Quantitative',
    duration: '12 months',
    deadline: '2026-10-28',
    description:
      'Work within a technology risk function on cyber resilience programmes, regulatory compliance and third-party risk assessments across a retail and commercial bank.',
    companyValues:
      'We value difference, take responsibility and get it done. Integrity underpins everything we do.',
    requirements:
      'Any numerate or technology-related degree on track for a 2:1+. Interest in cyber security and risk. Strong communication.',
    applyUrl: null,
    isDemo: true,
    logo: 'LB',
  },
  {
    id: 'demo-8',
    role: 'Biomedical Data Analyst Placement',
    companyName: 'Bluepeak Biosciences',
    companyWebsite: null,
    location: 'Stevenage, UK',
    workMode: 'OFFICE',
    salaryMin: 21500,
    salaryMax: 23000,
    currency: 'GBP',
    sector: 'Biotech & Pharma',
    duration: '12 months',
    deadline: '2026-11-12',
    description:
      'Analyse genomics and clinical datasets to support an early-stage research pipeline, using R and Python within a regulated environment alongside experienced biostatisticians.',
    companyValues:
      'Patient-focused, transparent and respectful. We do the right thing and get ahead of disease together.',
    requirements:
      'On track for a 2:1+ in a numerate or life-sciences degree. R or Python. Interest in genomics and healthcare data.',
    applyUrl: null,
    isDemo: true,
    logo: 'BB',
  },
]
