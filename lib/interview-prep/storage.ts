// Client-side persistence for Interview Prep answers. No backend — answers live
// only in the student's browser (localStorage), so the tool needs no DB.

export type SavedAnswer = {
  situation?: string
  task?: string
  action?: string
  result?: string
  notes?: string
}

export type AnswerMap = Record<string, SavedAnswer>

const KEY = 'placementos:interview-prep'

export function loadAnswers(): AnswerMap {
  if (typeof window === 'undefined') return {}
  try {
    const raw = window.localStorage.getItem(KEY)
    const parsed = raw ? JSON.parse(raw) : {}
    return parsed && typeof parsed === 'object' ? (parsed as AnswerMap) : {}
  } catch {
    return {}
  }
}

export function persistAnswers(map: AnswerMap): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(KEY, JSON.stringify(map))
  } catch {
    /* storage full or unavailable — fail quietly */
  }
}

/** True once any field of an answer has non-whitespace content. */
export function answerStarted(answer?: SavedAnswer): boolean {
  if (!answer) return false
  return [answer.situation, answer.task, answer.action, answer.result, answer.notes].some(
    (v) => (v ?? '').trim().length > 0
  )
}
