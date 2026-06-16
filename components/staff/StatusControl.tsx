'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { OPPORTUNITY_STATUSES, STATUS_LABELS, type OpportunityStatus } from '@/lib/constants'

const selectedStyles: Record<OpportunityStatus, string> = {
  UNDER_REVIEW: 'bg-amber-500 text-white border-amber-500',
  ACCEPTED: 'bg-green-600 text-white border-green-600',
  DENIED: 'bg-red-600 text-white border-red-600',
}

interface StatusControlProps {
  opportunityId: string
  currentStatus: OpportunityStatus
  currentNote: string | null
}

export default function StatusControl({
  opportunityId,
  currentStatus,
  currentNote,
}: StatusControlProps) {
  const router = useRouter()
  const [status, setStatus] = useState<OpportunityStatus>(currentStatus)
  const [note, setNote] = useState(currentNote ?? '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)

  const save = async (nextStatus: OpportunityStatus) => {
    setSaving(true)
    setError('')
    setSaved(false)
    try {
      const res = await fetch(`/api/staff/opportunities/${opportunityId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus, reviewNote: note }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(data.error || 'Could not update the status.')
        setSaving(false)
        return
      }
      setStatus(nextStatus)
      setSaved(true)
      setSaving(false)
      router.refresh()
    } catch {
      setError('Network error. Please try again.')
      setSaving(false)
    }
  }

  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold text-muted uppercase tracking-wide">Set status</p>
      <div className="flex flex-wrap gap-2">
        {OPPORTUNITY_STATUSES.map((s) => {
          const isSelected = status === s
          return (
            <button
              key={s}
              type="button"
              disabled={saving}
              aria-pressed={isSelected}
              onClick={() => save(s)}
              className={[
                'px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors disabled:opacity-50',
                isSelected
                  ? selectedStyles[s]
                  : 'border-gray-200 text-muted hover:text-primary hover:border-gray-300',
              ].join(' ')}
            >
              {STATUS_LABELS[s]}
            </button>
          )
        })}
      </div>
      <textarea
        value={note}
        onChange={(e) => {
          setNote(e.target.value)
          setSaved(false)
        }}
        rows={2}
        placeholder="Optional note to the company (saved when you set a status)"
        className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white text-primary placeholder:text-muted text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent resize-y"
      />
      {error && (
        <p role="alert" className="text-xs text-red-500">
          {error}
        </p>
      )}
      {saved && !error && <p className="text-xs text-success">Saved — the company will see this.</p>}
    </div>
  )
}
