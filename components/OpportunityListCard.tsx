import Link from 'next/link'
import Badge from '@/components/ui/Badge'
import TrackerButton from '@/components/tracker/TrackerButton'
import { WORK_MODE_LABELS } from '@/lib/constants'
import { formatDate, formatSalaryRange } from '@/lib/format'
import type { OpportunityView } from '@/lib/opportunities'

const SECTOR_COLOURS: Record<string, string> = {
  'Biotech & Pharma': 'bg-purple-50 text-purple-700',
  'Software & IT': 'bg-blue-50 text-blue-700',
  'Finance & Quantitative': 'bg-indigo-50 text-indigo-700',
  'Aerospace & Defence': 'bg-sky-50 text-sky-700',
  'Data Science & AI': 'bg-violet-50 text-violet-700',
  'Energy & Sustainability': 'bg-emerald-50 text-emerald-700',
}

function matchVariant(match: number): 'success' | 'accent' | 'muted' {
  if (match >= 85) return 'success'
  if (match >= 70) return 'accent'
  return 'muted'
}

/** A public opportunity rendered as a card that links to its detail page. */
export default function OpportunityListCard({ opportunity: o }: { opportunity: OpportunityView }) {
  return (
    <div className="relative">
      <Link
        href={`/opportunities/${o.id}`}
        className="group block bg-white rounded-xl border border-gray-100 shadow-card p-5 hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent"
      >
        <div className="flex flex-col gap-4 h-full">
          {/* Header */}
          <div className="flex items-start gap-3">
            <div
              className={`w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 ${SECTOR_COLOURS[o.sector] ?? 'bg-gray-100 text-gray-600'}`}
            >
              {o.logo}
            </div>
            <div className="flex-1 min-w-0 pr-16">
              <h3 className="font-semibold text-primary text-sm leading-snug group-hover:text-accent transition-colors">
                {o.role}
              </h3>
              <p className="text-accent text-sm font-medium mt-0.5 truncate">{o.companyName}</p>
            </div>
          </div>

          {/* Description */}
          <p className="text-xs text-muted leading-relaxed line-clamp-2">{o.description}</p>

          {/* Metadata chips */}
          <div className="flex flex-wrap gap-1.5">
            {o.match !== null ? (
              <Badge variant={matchVariant(o.match)}>{o.match}% match</Badge>
            ) : (
              <Badge variant="success">Live</Badge>
            )}
            <Badge variant="muted">📍 {o.location}</Badge>
            <Badge variant="muted">{WORK_MODE_LABELS[o.workMode]}</Badge>
            <Badge variant="muted">⏱ {o.duration}</Badge>
            <Badge variant="muted">💷 {formatSalaryRange(o.salaryMin, o.salaryMax, o.currency)} / yr</Badge>
            <Badge variant="default">{o.sector}</Badge>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-3 mt-auto border-t border-gray-50 gap-2">
            <div className="text-xs text-muted">
              {o.deadline ? (
                <>
                  <span className="font-medium text-primary">Deadline:</span> {formatDate(o.deadline)}
                </>
              ) : (
                <span>{o.isDemo ? 'Sample listing' : 'Open now'}</span>
              )}
            </div>
            <span className="inline-flex items-center text-xs font-semibold text-accent">
              View details
              <svg className="w-3.5 h-3.5 ml-1 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </span>
          </div>
        </div>
      </Link>

      {/* Save / Applied bookmark — sibling of the Link so it isn't nested inside it. */}
      <TrackerButton opportunityRef={o.id} variant="card" className="absolute top-4 right-4 z-10" />
    </div>
  )
}
