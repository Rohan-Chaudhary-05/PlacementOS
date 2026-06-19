import Reveal from '@/components/ui/Reveal'
import ReadinessChecklist from '@/components/placement/ReadinessChecklist'
import { PLACEMENT_TIMELINE } from '@/lib/placement-timeline'

export const metadata = { title: 'Placement Guide · PlacementOS' }

function TaskTick() {
  return (
    <svg className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  )
}

export default function PlacementGuidePage() {
  return (
    <section className="min-h-screen bg-surface py-14 sm:py-18">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="max-w-2xl">
          <p className="text-accent text-sm font-semibold uppercase tracking-widest mb-3">Placement Guide</p>
          <h1 className="text-3xl sm:text-4xl font-bold text-primary tracking-tight">Your UK placement year, mapped</h1>
          <p className="text-muted mt-3 text-base leading-relaxed">
            The UK STEM placement cycle, month by month — what to do and when, plus a personal readiness
            checklist that updates as you use your tracker. Big schemes open early and recruit on a rolling
            basis, so the golden rule is: apply early.
          </p>
        </header>

        {/* Timeline */}
        <div className="mt-12">
          {PLACEMENT_TIMELINE.map((phase, i) => {
            const last = i === PLACEMENT_TIMELINE.length - 1
            return (
              <Reveal key={phase.window} delay={i * 80}>
                <div className="flex gap-4 sm:gap-5">
                  <div className="flex flex-col items-center flex-shrink-0">
                    <span className="w-3.5 h-3.5 rounded-full bg-accent ring-4 ring-accent-light mt-1" aria-hidden />
                    {!last && <span className="w-0.5 flex-1 bg-gray-100 my-1" aria-hidden />}
                  </div>
                  <div className={`flex-1 ${last ? '' : 'pb-8'}`}>
                    <span className="inline-block text-xs font-semibold uppercase tracking-wide text-accent bg-accent-light rounded-full px-2.5 py-1">
                      {phase.window}
                    </span>
                    <h2 className="text-lg font-bold text-primary mt-2.5">{phase.title}</h2>
                    <p className="text-sm text-muted leading-relaxed mt-1.5">{phase.description}</p>
                    <ul className="mt-3 space-y-1.5">
                      {phase.tasks.map((t) => (
                        <li key={t} className="flex items-start gap-2 text-sm text-primary/75">
                          <TaskTick />
                          <span>{t}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </Reveal>
            )
          })}
        </div>

        {/* Readiness checklist */}
        <div className="mt-12">
          <ReadinessChecklist />
        </div>
      </div>
    </section>
  )
}
