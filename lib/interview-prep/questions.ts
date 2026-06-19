import type { StemIndustryId } from '@/lib/cv-tailor/types'

export type QuestionCategory = 'behavioural' | 'motivational' | 'technical'

export type InterviewQuestion = {
  /** Stable key — used as the localStorage answer key. */
  id: string
  category: QuestionCategory
  prompt: string
  /** Optional approach tip; technical questions fall back to a generic one. */
  tip?: string
  /** True for "tell me about a time…" questions that suit the STAR structure. */
  star: boolean
  /** Set for technical questions tied to a STEM industry. */
  industry?: StemIndustryId
}

export const CATEGORY_LABELS: Record<QuestionCategory, string> = {
  behavioural: 'Behavioural',
  motivational: 'Motivational',
  technical: 'Technical',
}

/** Shown under technical questions that don't carry their own tip. */
export const TECHNICAL_TIP = 'Aim for a clear, structured explanation — a short worked example shows real understanding.'

// ── Behavioural (STAR) + motivational — asked across every placement ──
export const COMMON_QUESTIONS: InterviewQuestion[] = [
  { id: 'beh-teamwork', category: 'behavioural', star: true, prompt: 'Tell me about a time you worked effectively in a team.', tip: 'Pick one specific project; focus on your role and the outcome, not the whole group.' },
  { id: 'beh-challenge', category: 'behavioural', star: true, prompt: 'Describe a challenge or setback you faced and how you handled it.', tip: 'Show resilience and what you learned — the recovery matters more than the problem.' },
  { id: 'beh-leadership', category: 'behavioural', star: true, prompt: 'Give an example of when you took initiative or led others.', tip: "Leadership doesn't need a title — showing ownership counts." },
  { id: 'beh-conflict', category: 'behavioural', star: true, prompt: 'Tell me about a time you disagreed with someone. How did you resolve it?', tip: 'Stay professional; emphasise listening, evidence and compromise.' },
  { id: 'beh-deadline', category: 'behavioural', star: true, prompt: 'Describe a time you managed competing priorities or a tight deadline.', tip: 'Highlight how you planned, prioritised and communicated.' },
  { id: 'beh-mistake', category: 'behavioural', star: true, prompt: 'Tell me about a mistake you made and what you learned from it.', tip: 'Own it honestly; centre the lesson and the fix.' },
  { id: 'beh-communicate', category: 'behavioural', star: true, prompt: 'Give an example of explaining something complex to a non-expert.', tip: 'Show you can adapt your message to the audience.' },
  { id: 'beh-problem', category: 'behavioural', star: true, prompt: 'Walk me through a difficult problem you solved.', tip: 'Make your reasoning visible, step by step.' },

  { id: 'mot-why-placement', category: 'motivational', star: false, prompt: 'Why do you want to do a placement year?', tip: 'Connect it to your goals and what you specifically want to learn.' },
  { id: 'mot-why-company', category: 'motivational', star: false, prompt: 'Why do you want to work for this company in particular?', tip: 'Reference their projects, products or values — be specific, avoid generic praise.' },
  { id: 'mot-why-role', category: 'motivational', star: false, prompt: 'Why this role and this field?', tip: 'Link your skills and interests to the actual day-to-day work.' },
  { id: 'mot-strengths', category: 'motivational', star: false, prompt: 'What are your greatest strengths, and how do they fit this role?', tip: 'Pick two or three relevant strengths, each backed by a quick example.' },
  { id: 'mot-weakness', category: 'motivational', star: false, prompt: "What's a weakness you're actively working on?", tip: 'Be genuine; show self-awareness and the steps you take to improve.' },
  { id: 'mot-future', category: 'motivational', star: false, prompt: 'Where do you see yourself after your placement?', tip: 'Show ambition that aligns with the company and your degree.' },
]

// ── Technical — a handful of common questions per STEM industry ──
export const TECHNICAL_QUESTIONS: InterviewQuestion[] = [
  // Software & IT
  { id: 'tech-software-it-1', category: 'technical', star: false, industry: 'software-it', prompt: 'Explain the difference between a stack and a queue, with a use case for each.' },
  { id: 'tech-software-it-2', category: 'technical', star: false, industry: 'software-it', prompt: 'What is Big-O notation, and why does it matter when choosing an algorithm?' },
  { id: 'tech-software-it-3', category: 'technical', star: false, industry: 'software-it', prompt: "How would you go about finding a bug in code you didn't write?" },
  { id: 'tech-software-it-4', category: 'technical', star: false, industry: 'software-it', prompt: 'What roughly happens when you type a URL into a browser and press Enter?' },

  // Data Science & AI
  { id: 'tech-data-ai-1', category: 'technical', star: false, industry: 'data-ai', prompt: 'What is overfitting, and how can you reduce it?' },
  { id: 'tech-data-ai-2', category: 'technical', star: false, industry: 'data-ai', prompt: 'Explain the difference between supervised and unsupervised learning.' },
  { id: 'tech-data-ai-3', category: 'technical', star: false, industry: 'data-ai', prompt: 'How would you handle missing or messy data in a dataset?' },
  { id: 'tech-data-ai-4', category: 'technical', star: false, industry: 'data-ai', prompt: "What's the difference between correlation and causation?" },

  // Mechanical Engineering
  { id: 'tech-eng-mechanical-1', category: 'technical', star: false, industry: 'eng-mechanical', prompt: 'Explain the difference between stress and strain.' },
  { id: 'tech-eng-mechanical-2', category: 'technical', star: false, industry: 'eng-mechanical', prompt: 'What factors would you weigh when selecting a material for a part?' },
  { id: 'tech-eng-mechanical-3', category: 'technical', star: false, industry: 'eng-mechanical', prompt: 'Walk me through the design process from concept to manufacture.' },
  { id: 'tech-eng-mechanical-4', category: 'technical', star: false, industry: 'eng-mechanical', prompt: 'What is a factor of safety, and why is it used?' },

  // Civil & Structural Engineering
  { id: 'tech-eng-civil-1', category: 'technical', star: false, industry: 'eng-civil', prompt: 'Explain the difference between a beam in bending and in shear.' },
  { id: 'tech-eng-civil-2', category: 'technical', star: false, industry: 'eng-civil', prompt: "What's the difference between dead loads and live loads?" },
  { id: 'tech-eng-civil-3', category: 'technical', star: false, industry: 'eng-civil', prompt: 'How do the Eurocodes guide structural design?' },
  { id: 'tech-eng-civil-4', category: 'technical', star: false, industry: 'eng-civil', prompt: 'What makes a design buildable as well as structurally sound?' },

  // Electrical & Electronic Engineering
  { id: 'tech-eng-electrical-1', category: 'technical', star: false, industry: 'eng-electrical', prompt: 'Explain the difference between AC and DC.' },
  { id: 'tech-eng-electrical-2', category: 'technical', star: false, industry: 'eng-electrical', prompt: 'What is the purpose of a capacitor in a circuit?' },
  { id: 'tech-eng-electrical-3', category: 'technical', star: false, industry: 'eng-electrical', prompt: "How would you debug a circuit that isn't behaving as expected?" },
  { id: 'tech-eng-electrical-4', category: 'technical', star: false, industry: 'eng-electrical', prompt: 'What is the difference between analogue and digital signals?' },

  // Biotechnology & Pharmaceuticals
  { id: 'tech-biotech-pharma-1', category: 'technical', star: false, industry: 'biotech-pharma', prompt: 'Why is aseptic technique important, and how do you maintain it?' },
  { id: 'tech-biotech-pharma-2', category: 'technical', star: false, industry: 'biotech-pharma', prompt: 'What is GMP, and why does it matter in a pharma setting?' },
  { id: 'tech-biotech-pharma-3', category: 'technical', star: false, industry: 'biotech-pharma', prompt: 'How do you make sure your experimental results are reproducible?' },
  { id: 'tech-biotech-pharma-4', category: 'technical', star: false, industry: 'biotech-pharma', prompt: 'Walk me through good practice for running a routine lab assay.' },

  // Healthcare & MedTech
  { id: 'tech-healthcare-medtech-1', category: 'technical', star: false, industry: 'healthcare-medtech', prompt: 'What makes a medical device both safe and effective?' },
  { id: 'tech-healthcare-medtech-2', category: 'technical', star: false, industry: 'healthcare-medtech', prompt: 'Why is regulation such as ISO 13485 important in MedTech?' },
  { id: 'tech-healthcare-medtech-3', category: 'technical', star: false, industry: 'healthcare-medtech', prompt: 'How would you approach validating a new device or feature?' },
  { id: 'tech-healthcare-medtech-4', category: 'technical', star: false, industry: 'healthcare-medtech', prompt: 'How do you balance innovation with patient safety?' },

  // Energy & Sustainability
  { id: 'tech-energy-sustainability-1', category: 'technical', star: false, industry: 'energy-sustainability', prompt: 'What are the main challenges of the transition to renewable energy?' },
  { id: 'tech-energy-sustainability-2', category: 'technical', star: false, industry: 'energy-sustainability', prompt: 'What is a life-cycle assessment, and why is it useful?' },
  { id: 'tech-energy-sustainability-3', category: 'technical', star: false, industry: 'energy-sustainability', prompt: 'Compare two renewable energy sources and their trade-offs.' },
  { id: 'tech-energy-sustainability-4', category: 'technical', star: false, industry: 'energy-sustainability', prompt: 'How would you go about reducing the carbon footprint of a process?' },

  // Aerospace & Defence
  { id: 'tech-aerospace-defence-1', category: 'technical', star: false, industry: 'aerospace-defence', prompt: 'Explain the difference between lift and drag.' },
  { id: 'tech-aerospace-defence-2', category: 'technical', star: false, industry: 'aerospace-defence', prompt: 'Why is a high factor of safety especially critical in aerospace?' },
  { id: 'tech-aerospace-defence-3', category: 'technical', star: false, industry: 'aerospace-defence', prompt: 'How is reliability ensured in flight-critical systems?' },
  { id: 'tech-aerospace-defence-4', category: 'technical', star: false, industry: 'aerospace-defence', prompt: 'What is systems engineering, and why does it matter here?' },

  // Finance & Quantitative
  { id: 'tech-finance-quant-1', category: 'technical', star: false, industry: 'finance-quant', prompt: 'What is the time value of money, and why does it matter?' },
  { id: 'tech-finance-quant-2', category: 'technical', star: false, industry: 'finance-quant', prompt: 'Walk me through how you would build a simple financial model.' },
  { id: 'tech-finance-quant-3', category: 'technical', star: false, industry: 'finance-quant', prompt: 'How do you assess and manage risk in a portfolio?' },
  { id: 'tech-finance-quant-4', category: 'technical', star: false, industry: 'finance-quant', prompt: 'How would you explain compound interest to a non-finance client?' },

  // Telecommunications & Networking
  { id: 'tech-telecoms-1', category: 'technical', star: false, industry: 'telecoms', prompt: 'Explain the TCP/IP model in simple terms.' },
  { id: 'tech-telecoms-2', category: 'technical', star: false, industry: 'telecoms', prompt: 'What is the difference between bandwidth and latency?' },
  { id: 'tech-telecoms-3', category: 'technical', star: false, industry: 'telecoms', prompt: 'How does data get routed across a network?' },
  { id: 'tech-telecoms-4', category: 'technical', star: false, industry: 'telecoms', prompt: 'What problems does 5G aim to solve?' },

  // Research & Academia
  { id: 'tech-research-academia-1', category: 'technical', star: false, industry: 'research-academia', prompt: 'How do you carry out a literature review effectively?' },
  { id: 'tech-research-academia-2', category: 'technical', star: false, industry: 'research-academia', prompt: 'What makes a piece of research reproducible?' },
  { id: 'tech-research-academia-3', category: 'technical', star: false, industry: 'research-academia', prompt: 'How do you make sure your analysis is statistically sound?' },
  { id: 'tech-research-academia-4', category: 'technical', star: false, industry: 'research-academia', prompt: 'How would you present complex findings to a general audience?' },
]

/** Common questions plus, if an industry is chosen, its technical questions. */
export function questionsFor(industry: StemIndustryId | ''): InterviewQuestion[] {
  const technical = industry ? TECHNICAL_QUESTIONS.filter((q) => q.industry === industry) : []
  return [...COMMON_QUESTIONS, ...technical]
}
