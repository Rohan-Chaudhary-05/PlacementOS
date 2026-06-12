import { buildPolishedCv } from './engine'
import type { CvFormData, PolishedCv } from './types'

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Service seam for CV generation. Currently runs the local deterministic
 * engine behind simulated latency — swap the body for a real API call later
 * without touching the UI.
 */
export async function polishCv(form: CvFormData): Promise<PolishedCv> {
  await wait(1800)
  return buildPolishedCv(form)
}
