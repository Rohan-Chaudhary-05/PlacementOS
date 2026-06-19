import { buildCoverLetter } from './engine'
import type { CoverLetterForm, GeneratedCoverLetter } from './types'

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Service seam for cover-letter generation. Runs the local deterministic engine
 * behind simulated latency — swap the body for a real API call later without
 * touching the UI. Mirrors lib/cv-tailor/polishCv.ts.
 */
export async function generateCoverLetter(form: CoverLetterForm): Promise<GeneratedCoverLetter> {
  await wait(1400)
  return buildCoverLetter(form)
}
