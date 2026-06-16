// Display helpers — client- and server-safe.

const CURRENCY_SYMBOLS: Record<string, string> = { GBP: '£', USD: '$', EUR: '€' }

export function formatSalaryRange(min: number, max: number, currency = 'GBP'): string {
  const symbol = CURRENCY_SYMBOLS[currency] ?? `${currency} `
  const fmt = (n: number) => n.toLocaleString('en-GB')
  return min === max ? `${symbol}${fmt(min)}` : `${symbol}${fmt(min)}–${symbol}${fmt(max)}`
}

export function formatDate(value: string | null): string {
  if (!value) return '—'
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return value
  return parsed.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}
