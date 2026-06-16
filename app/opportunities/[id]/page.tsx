import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Badge from '@/components/ui/Badge'
import DemoApplyButton from '@/components/DemoApplyButton'
import { buttonClasses } from '@/components/ui/buttonStyles'
import { WORK_MODE_LABELS } from '@/lib/constants'
import { formatDate, formatSalaryRange } from '@/lib/format'
import { getOpportunityForDetail } from '@/lib/opportunities'

export const revalidate = 300

type PageProps = { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  const o = await getOpportunityForDetail(id)
  if (!o) return { title: 'Opportunity not found — PlacementOS' }
  return {
    title: `${o.role} — ${o.companyName} · PlacementOS`,
    description: o.description.slice(0, 155),
  }
}

function cleanHost(url: string): string {
  try {
    return new URL(url).host.replace(/^www\./, '')
  } catch {
    return url
  }
}

export default async function OpportunityDetailPage({ params }: PageProps) {
  const { id } = await params
  const o = await getOpportunityForDetail(id)
  if (!o) notFound()

  const facts: Array<{ label: string; value: string }> = [
    { label: 'Location', value: o.location },
    { label: 'Work mode', value: WORK_MODE_LABELS[o.workMode] },
    { label: 'Salary', value: `${formatSalaryRange(o.salaryMin, o.salaryMax, o.currency)} / yr` },
    { label: 'Duration', value: o.duration },
    { label: 'Sector', value: o.sector },
    { label: 'Deadline', value: o.deadline ? formatDate(o.deadline) : 'Open now' },
  ]

  return (
    <div className="min-h-screen bg-surface">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Back link */}
        <Link
          href="/opportunities"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-accent transition-colors mb-6"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          All opportunities
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ── Main column ── */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            {/* Header card */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-6 sm:p-8">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <Badge variant="accent">{o.sector}</Badge>
                {o.match !== null && <Badge variant="success">{o.match}% match</Badge>}
                {o.isDemo && <Badge variant="muted">Sample listing</Badge>}
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-primary leading-tight">{o.role}</h1>
              <p className="text-accent font-semibold mt-1.5">{o.companyName}</p>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-100">
                {facts.map((f) => (
                  <div key={f.label}>
                    <p className="text-xs font-semibold text-muted uppercase tracking-wide">{f.label}</p>
                    <p className="text-sm text-primary mt-1 font-medium">{f.value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* About the role */}
            <section className="bg-white rounded-2xl border border-gray-100 shadow-card p-6 sm:p-8">
              <h2 className="text-lg font-semibold text-primary mb-3">About the role</h2>
              <p className="text-sm text-muted leading-relaxed whitespace-pre-line">{o.description}</p>

              {o.requirements && (
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <h3 className="text-sm font-semibold text-primary mb-2">What they&apos;re looking for</h3>
                  <p className="text-sm text-muted leading-relaxed whitespace-pre-line">{o.requirements}</p>
                </div>
              )}
            </section>

            {/* About the company */}
            <section className="bg-white rounded-2xl border border-gray-100 shadow-card p-6 sm:p-8">
              <h2 className="text-lg font-semibold text-primary mb-3">About {o.companyName}</h2>
              {o.companyValues ? (
                <p className="text-sm text-muted leading-relaxed whitespace-pre-line">{o.companyValues}</p>
              ) : (
                <p className="text-sm text-muted leading-relaxed">
                  {o.companyName} is hiring placement students through PlacementOS.
                </p>
              )}
              {o.companyWebsite && (
                <a
                  href={o.companyWebsite}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-accent hover:underline mt-4"
                >
                  Visit {cleanHost(o.companyWebsite)}
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              )}
            </section>
          </div>

          {/* ── Apply sidebar ── */}
          <aside className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-6 lg:sticky lg:top-24">
              <p className="text-xs font-semibold text-muted uppercase tracking-wide">Apply</p>
              <p className="text-2xl font-bold text-primary mt-1">
                {formatSalaryRange(o.salaryMin, o.salaryMax, o.currency)}
                <span className="text-sm font-medium text-muted"> / yr</span>
              </p>
              <p className="text-sm text-muted mt-1">
                {WORK_MODE_LABELS[o.workMode]} · {o.location}
              </p>

              <div className="mt-5">
                {o.isDemo || !o.applyUrl ? (
                  <>
                    <DemoApplyButton className="w-full" />
                    <p className="text-xs text-muted mt-3 leading-relaxed">
                      This is a sample listing. Real placements link straight to the company&apos;s
                      application page — join the waitlist for early access.
                    </p>
                  </>
                ) : (
                  <>
                    <a
                      href={o.applyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={buttonClasses('primary', 'lg', 'w-full')}
                    >
                      Apply now
                      <svg className="w-4 h-4 ml-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                    <p className="text-xs text-muted mt-3 leading-relaxed">
                      You&apos;ll be taken to {o.companyName}&apos;s application page to apply directly.
                    </p>
                  </>
                )}
              </div>

              {o.deadline && (
                <div className="mt-5 pt-5 border-t border-gray-100">
                  <p className="text-xs font-semibold text-muted uppercase tracking-wide">Application deadline</p>
                  <p className="text-sm text-primary mt-1 font-medium">{formatDate(o.deadline)}</p>
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
