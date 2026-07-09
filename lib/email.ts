import 'server-only'
import { WORK_MODE_LABELS, type Opportunity } from './constants'

/** Strip CR/LF so user-supplied text can't inject email headers. */
function singleLine(value: string): string {
  return value.replace(/[\r\n]+/g, ' ').trim()
}

/**
 * Emails a newly-submitted opportunity to the notification inbox via Resend.
 * Best-effort: returns `{ emailed: false }` (never throws) if the key is missing
 * or the request fails, so a submission is never lost because email failed.
 */
export async function sendOpportunityEmail(
  opp: Opportunity
): Promise<{ emailed: boolean; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY
  // Lowercase the recipient — Resend's testing mode matches the account email
  // case-sensitively, and email addresses are case-insensitive in practice.
  const to = (process.env.NOTIFY_EMAIL || '').trim().toLowerCase()
  const from = (process.env.RESEND_FROM || '').trim()
  if (!apiKey || !to || !from) return { emailed: false }

  const salary = `${opp.currency} ${opp.salary_min.toLocaleString()}–${opp.salary_max.toLocaleString()}`
  const text = [
    `New placement opportunity submitted on PlacementOS.`,
    ``,
    `Company:       ${opp.company_name}`,
    `Contact email: ${opp.company_email}`,
    `Website:       ${opp.company_website || '—'}`,
    `Role:          ${opp.role}`,
    `Sector:        ${opp.sector}`,
    `Location:      ${opp.location}`,
    `Work mode:     ${WORK_MODE_LABELS[opp.work_mode]}`,
    `Salary range:  ${salary}`,
    `Duration:      ${opp.duration}`,
    `Deadline:      ${opp.deadline || '—'}`,
    `Apply link:    ${opp.apply_url || '—'}`,
    ``,
    `Description:`,
    opp.description,
    ``,
    `Company values:`,
    opp.company_values || '—',
    ``,
    `Requirements:`,
    opp.requirements || '—',
    ``,
    `Status: Under review. Manage it in the staff dashboard.`,
  ].join('\n')

  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 8000)

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: [to],
        reply_to: singleLine(opp.company_email),
        subject: singleLine(`New opportunity: ${opp.role} — ${opp.company_name}`),
        text,
      }),
      signal: controller.signal,
    })
    clearTimeout(timeout)

    if (!res.ok) {
      const body = await res.text().catch(() => '')
      return { emailed: false, error: `Resend responded ${res.status}: ${body.slice(0, 200)}` }
    }
    return { emailed: true }
  } catch (err) {
    return { emailed: false, error: err instanceof Error ? err.message : String(err) }
  }
}
