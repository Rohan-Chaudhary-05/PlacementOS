import rawDemoResponse from '@/lib/demo-cv-tailor-response.json'

export type MatchStrength = 'strong' | 'moderate' | 'weak'

export type SkillsAlignmentItem = {
  jdRequirement: string
  cvEvidence: string
  matchStrength: MatchStrength
}

export type TailorCvResponse = {
  rewrittenStatement: string
  skillsAlignment: SkillsAlignmentItem[]
  gapAnalysis: string[]
  suggestedBullets: string[]
}

function wait(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

function toMatchStrength(value: string): MatchStrength {
  if (value === 'strong' || value === 'moderate' || value === 'weak') {
    return value
  }

  return 'moderate'
}

const demoResponse: TailorCvResponse = {
  ...rawDemoResponse,
  skillsAlignment: rawDemoResponse.skillsAlignment.map((item) => ({
    ...item,
    matchStrength: toMatchStrength(item.matchStrength),
  })),
}

export async function tailorCv(cv: string, jd: string): Promise<TailorCvResponse> {
  // Keep signature stable for easy swap to a real API call.
  void cv
  void jd
  await wait(2000)
  return demoResponse
}
