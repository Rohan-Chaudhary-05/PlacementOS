// Server component — no client JS. The count is rendered into the HTML and
// refreshed on the page's revalidation schedule (see app/page.tsx), so there is
// no per-visitor request or polling.

export default function WaitlistCount({
  count,
  className = '',
}: {
  count: number | null
  className?: string
}) {
  if (count === null || count < 1) return null

  return (
    <p className={['flex items-center gap-2 text-sm text-muted', className].join(' ')}>
      <span className="relative flex h-2 w-2" aria-hidden="true">
        <span className="absolute inline-flex h-full w-full rounded-full bg-success/60 animate-ping" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
      </span>
      <span>
        <span className="font-semibold text-primary tabular-nums">
          {count.toLocaleString('en-GB')}
        </span>{' '}
        {count === 1 ? 'student' : 'students'} already on the waitlist
      </span>
    </p>
  )
}
