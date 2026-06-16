import { STATUS_LABELS, type OpportunityStatus } from '@/lib/constants'

const statusStyles: Record<OpportunityStatus, string> = {
  UNDER_REVIEW: 'bg-amber-50 text-amber-700 border-amber-200',
  ACCEPTED: 'bg-green-50 text-green-700 border-green-200',
  DENIED: 'bg-red-50 text-red-700 border-red-200',
}

export default function StatusBadge({ status }: { status: OpportunityStatus }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${statusStyles[status]}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
      {STATUS_LABELS[status]}
    </span>
  )
}
