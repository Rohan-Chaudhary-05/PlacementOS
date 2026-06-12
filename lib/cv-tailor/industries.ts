import type { StemIndustryId } from './types'

export type IndustryProfile = {
  id: StemIndustryId
  label: string
  /** Phrases woven into generated summary sentences */
  themes: string[]
  /** Case-insensitive matches are sorted to the front of the hard-skills list */
  prioritySkills: string[]
  /** Industry-flavoured heading for the hard-skills group */
  skillsHeading: string
  /**
   * Templates used when the user leaves their summary blank.
   * Slots: {qualification} {skills} {theme} {target}
   */
  summaryTemplates: string[]
}

export const STEM_INDUSTRIES: IndustryProfile[] = [
  {
    id: 'software-it',
    label: 'Software & IT',
    themes: ['scalable software', 'clean, maintainable code', 'agile delivery'],
    prioritySkills: ['python', 'javascript', 'typescript', 'react', 'sql', 'git', 'java', 'c++', 'aws', 'docker'],
    skillsHeading: 'Technical Skills',
    summaryTemplates: [
      '{qualification} student with a strong foundation in {skills}, motivated to build {theme}. Seeking a placement {target} to contribute to real-world software projects and grow as an engineer.',
      'Driven {qualification} student who enjoys turning ideas into working software using {skills}. Eager to join {target} on placement and deliver {theme} alongside experienced engineers.',
      'Curious and detail-oriented {qualification} student skilled in {skills}, with a keen interest in {theme}. Looking for a placement {target} to apply these skills to production systems.',
    ],
  },
  {
    id: 'data-ai',
    label: 'Data Science & AI',
    themes: ['data-driven decision making', 'machine learning in production', 'clear, honest analysis'],
    prioritySkills: ['python', 'sql', 'pandas', 'machine learning', 'r', 'tensorflow', 'pytorch', 'statistics', 'power bi', 'tableau'],
    skillsHeading: 'Data & Analytical Skills',
    summaryTemplates: [
      '{qualification} student with hands-on experience in {skills} and a passion for {theme}. Seeking a placement {target} to turn raw data into decisions that matter.',
      'Analytical {qualification} student who works confidently with {skills}. Keen to join {target} on placement and contribute to {theme} from day one.',
      '{qualification} student combining statistical rigour with practical skills in {skills}. Looking for a placement {target} focused on {theme}.',
    ],
  },
  {
    id: 'eng-mechanical',
    label: 'Mechanical Engineering',
    themes: ['design for manufacture', 'practical problem solving', 'reliable mechanical systems'],
    prioritySkills: ['solidworks', 'cad', 'matlab', 'ansys', 'fea', 'cfd', 'autocad', 'gd&t', 'thermodynamics'],
    skillsHeading: 'Engineering Skills',
    summaryTemplates: [
      '{qualification} student with solid grounding in {skills} and a drive for {theme}. Seeking a placement {target} to take designs from concept to reality.',
      'Hands-on {qualification} student experienced with {skills}. Eager to join {target} on placement and contribute to {theme} in a professional engineering team.',
      'Practical and methodical {qualification} student skilled in {skills}, motivated by {theme}. Looking for a placement {target} to develop as a professional engineer.',
    ],
  },
  {
    id: 'eng-civil',
    label: 'Civil & Structural Engineering',
    themes: ['safe, sustainable infrastructure', 'buildable design', 'engineering that serves communities'],
    prioritySkills: ['autocad', 'civil 3d', 'revit', 'etabs', 'staad', 'tekla', 'eurocodes', 'surveying'],
    skillsHeading: 'Engineering Skills',
    summaryTemplates: [
      '{qualification} student with working knowledge of {skills} and a commitment to {theme}. Seeking a placement {target} to contribute to projects people rely on every day.',
      'Diligent {qualification} student skilled in {skills}, motivated by {theme}. Keen to join {target} on placement and learn from live infrastructure projects.',
      '{qualification} student combining strong fundamentals with practical skills in {skills}. Looking for a placement {target} delivering {theme}.',
    ],
  },
  {
    id: 'eng-electrical',
    label: 'Electrical & Electronic Engineering',
    themes: ['robust electronic design', 'embedded systems', 'power and control systems'],
    prioritySkills: ['matlab', 'simulink', 'c', 'c++', 'pcb', 'vhdl', 'verilog', 'ltspice', 'arduino', 'embedded'],
    skillsHeading: 'Engineering Skills',
    summaryTemplates: [
      '{qualification} student with hands-on experience in {skills} and a strong interest in {theme}. Seeking a placement {target} to design, build and test real hardware.',
      'Inquisitive {qualification} student skilled in {skills}, drawn to {theme}. Eager to join {target} on placement and contribute across the design lifecycle.',
      '{qualification} student with practical skills in {skills} and a focus on {theme}. Looking for a placement {target} to grow as an electronics engineer.',
    ],
  },
  {
    id: 'biotech-pharma',
    label: 'Biotechnology & Pharmaceuticals',
    themes: ['rigorous laboratory practice', 'science that improves lives', 'quality-driven research'],
    prioritySkills: ['hplc', 'pcr', 'elisa', 'cell culture', 'gmp', 'spectroscopy', 'chromatography', 'aseptic technique'],
    skillsHeading: 'Laboratory & Scientific Skills',
    summaryTemplates: [
      '{qualification} student with practical experience in {skills} and a commitment to {theme}. Seeking a placement {target} to contribute to meaningful scientific work.',
      'Meticulous {qualification} student skilled in {skills}, motivated by {theme}. Keen to join {target} on placement and develop in a regulated scientific environment.',
      '{qualification} student combining strong scientific fundamentals with hands-on skills in {skills}. Looking for a placement {target} focused on {theme}.',
    ],
  },
  {
    id: 'healthcare-medtech',
    label: 'Healthcare & MedTech',
    themes: ['patient-centred technology', 'safe and effective medical devices', 'evidence-based innovation'],
    prioritySkills: ['matlab', 'python', 'iso 13485', 'medical imaging', 'signal processing', 'cad', 'data analysis'],
    skillsHeading: 'Technical & Clinical Skills',
    summaryTemplates: [
      '{qualification} student with skills in {skills} and a genuine interest in {theme}. Seeking a placement {target} where technology directly improves patient outcomes.',
      'Motivated {qualification} student experienced with {skills}, driven by {theme}. Eager to join {target} on placement and contribute to healthcare innovation.',
      '{qualification} student combining technical skills in {skills} with a focus on {theme}. Looking for a placement {target} in the healthcare technology space.',
    ],
  },
  {
    id: 'energy-sustainability',
    label: 'Energy & Sustainability',
    themes: ['the transition to clean energy', 'sustainable engineering', 'practical decarbonisation'],
    prioritySkills: ['matlab', 'python', 'gis', 'lca', 'energy modelling', 'renewables', 'autocad', 'excel'],
    skillsHeading: 'Technical Skills',
    summaryTemplates: [
      '{qualification} student with skills in {skills} and a commitment to {theme}. Seeking a placement {target} to help deliver a lower-carbon future.',
      'Purpose-driven {qualification} student experienced in {skills}, motivated by {theme}. Keen to join {target} on placement and work on real energy challenges.',
      '{qualification} student combining analytical skills in {skills} with a passion for {theme}. Looking for a placement {target} in the energy sector.',
    ],
  },
  {
    id: 'aerospace-defence',
    label: 'Aerospace & Defence',
    themes: ['high-reliability engineering', 'flight-critical systems', 'precision and rigour'],
    prioritySkills: ['matlab', 'simulink', 'cad', 'catia', 'cfd', 'fea', 'c++', 'systems engineering', 'aerodynamics'],
    skillsHeading: 'Engineering Skills',
    summaryTemplates: [
      '{qualification} student with strong fundamentals in {skills} and an appetite for {theme}. Seeking a placement {target} where precision and safety come first.',
      'Rigorous {qualification} student skilled in {skills}, fascinated by {theme}. Eager to join {target} on placement and contribute to demanding engineering programmes.',
      '{qualification} student combining technical depth in {skills} with a focus on {theme}. Looking for a placement {target} in aerospace or defence.',
    ],
  },
  {
    id: 'finance-quant',
    label: 'Finance & Quantitative',
    themes: ['quantitative problem solving', 'data-driven markets insight', 'rigorous financial analysis'],
    prioritySkills: ['python', 'excel', 'sql', 'r', 'vba', 'statistics', 'financial modelling', 'bloomberg'],
    skillsHeading: 'Quantitative & Technical Skills',
    summaryTemplates: [
      '{qualification} student with strong skills in {skills} and a flair for {theme}. Seeking a placement {target} to apply analytical thinking under real market conditions.',
      'Sharp, numerate {qualification} student experienced with {skills}. Keen to join {target} on placement and contribute to {theme}.',
      '{qualification} student combining quantitative training with practical skills in {skills}. Looking for a placement {target} focused on {theme}.',
    ],
  },
  {
    id: 'telecoms',
    label: 'Telecommunications & Networking',
    themes: ['resilient network infrastructure', 'next-generation connectivity', 'reliable communications at scale'],
    prioritySkills: ['networking', 'cisco', 'tcp/ip', 'python', 'linux', '5g', 'rf', 'wireshark'],
    skillsHeading: 'Technical Skills',
    summaryTemplates: [
      '{qualification} student with practical knowledge of {skills} and an interest in {theme}. Seeking a placement {target} to keep people and systems connected.',
      'Methodical {qualification} student skilled in {skills}, motivated by {theme}. Eager to join {target} on placement and work on live network infrastructure.',
      '{qualification} student combining solid fundamentals with hands-on skills in {skills}. Looking for a placement {target} delivering {theme}.',
    ],
  },
  {
    id: 'research-academia',
    label: 'Research & Academia',
    themes: ['careful, reproducible research', 'advancing scientific understanding', 'open and honest scholarship'],
    prioritySkills: ['python', 'r', 'matlab', 'latex', 'statistics', 'literature review', 'data analysis'],
    skillsHeading: 'Research & Technical Skills',
    summaryTemplates: [
      '{qualification} student with skills in {skills} and a commitment to {theme}. Seeking a placement {target} to contribute to research with real intellectual depth.',
      'Inquisitive {qualification} student experienced in {skills}, motivated by {theme}. Keen to join {target} on placement and develop as a researcher.',
      '{qualification} student combining academic rigour with practical skills in {skills}. Looking for a placement {target} focused on {theme}.',
    ],
  },
]

export function getIndustryProfile(id: StemIndustryId): IndustryProfile {
  const profile = STEM_INDUSTRIES.find((industry) => industry.id === id)

  if (!profile) {
    throw new Error(`Unknown STEM industry: ${id}`)
  }

  return profile
}
