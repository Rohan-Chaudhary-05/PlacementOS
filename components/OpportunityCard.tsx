import type { ReactNode } from 'react'
import Badge from '@/components/ui/Badge'
import StatusBadge from '@/components/ui/StatusBadge'
import { WORK_MODE_LABELS, type Opportunity } from '@/lib/constants'
import { formatDate, formatSalaryRange } from '@/lib/format'

interface OpportunityCardProps {
  opportunity: Opportunity
  /** Show the submitting company's name + email (staff view). */
  showCompany?: boolean
  /** Controls rendered in the card footer (e.g. staff status control). */
  footer?: ReactNode
}

export default function OpportunityCard({
  opportunity: o,
  showCompany = false,
  footer,
}: OpportunityCardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-card p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-semibold text-primary leading-snug">{o.role}</h3>
          {showCompany && (
            <p className="text-sm text-accent font-medium mt-0.5">
              {o.company_name} <span className="text-muted font-normal">· {o.company_email}</span>
            </p>
          )}
        </div>
        <div className="flex-shrink-0">
          <StatusBadge status={o.status} />
        </div>
      </div>

      <p className="text-sm text-muted leading-relaxed mt-3 whitespace-pre-line">{o.description}</p>

      <div className="flex flex-wrap gap-1.5 mt-4">
        <Badge variant="accent">{o.sector}</Badge>
        <Badge variant="muted">📍 {o.location}</Badge>
        <Badge variant="muted">{WORK_MODE_LABELS[o.work_mode]}</Badge>
        <Badge variant="muted">💷 {formatSalaryRange(o.salary_min, o.salary_max, o.currency)} / yr</Badge>
        <Badge variant="muted">⏱ {o.duration}</Badge>
        {o.deadline && <Badge variant="muted">Deadline {formatDate(o.deadline)}</Badge>}
      </div>

      {o.company_values && (
        <div className="mt-4">
          <p className="text-xs font-semibold text-muted uppercase tracking-wide">Company values</p>
          <p className="text-sm text-muted mt-1 whitespace-pre-line">{o.company_values}</p>
        </div>
      )}

      {o.requirements && (
        <div className="mt-4">
          <p className="text-xs font-semibold text-muted uppercase tracking-wide">Requirements</p>
          <p className="text-sm text-muted mt-1 whitespace-pre-line">{o.requirements}</p>
        </div>
      )}

      {o.apply_url && (
        <div className="mt-4">
          <p className="text-xs font-semibold text-muted uppercase tracking-wide">Application link</p>
          <a
            href={o.apply_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-accent hover:underline mt-1 inline-block break-all"
          >
            {o.apply_url}
          </a>
        </div>
      )}

      {o.review_note && (
        <div className="mt-4 rounded-lg bg-gray-50 border border-gray-100 px-3 py-2">
          <p className="text-xs font-semibold text-muted uppercase tracking-wide">Reviewer note</p>
          <p className="text-sm text-primary mt-0.5">{o.review_note}</p>
        </div>
      )}

      {footer && <div className="mt-4 pt-4 border-t border-gray-50">{footer}</div>}
    </div>
  )
}
