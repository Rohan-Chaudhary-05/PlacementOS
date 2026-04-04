import Card from '@/components/ui/Card'
import WaitlistForm from '@/components/WaitlistForm'

const features = [
  {
    icon: (
      <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
    title: 'Smart Matching',
    description:
      'Our AI analyses your skills, degree, and preferences to surface the placements most likely to get you hired — no more scattergun applying.',
  },
  {
    icon: (
      <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2h-2" />
      </svg>
    ),
    title: 'AI Career Tools',
    description:
      'CV tailoring, cover letter generation, and interview prep — all powered by AI trained on real placement success stories from UK STEM students.',
  },
  {
    icon: (
      <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
      </svg>
    ),
    title: 'Application Tracker',
    description:
      'Keep every application, deadline, and follow-up in one place. Track your pipeline from first click to offer letter.',
  },
  {
    icon: (
      <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
    title: 'Student Blog',
    description:
      'Real placement stories, honest tips, and industry guides written by students who have been through the process at top UK companies.',
  },
]

const stats = [
  { value: '500+', label: 'Placement listings' },
  { value: '50+', label: 'Target companies' },
  { value: '12+', label: 'STEM disciplines' },
  { value: '4.8★', label: 'Avg. student rating' },
]

export default function HomePage() {
  return (
    <>
      {/* ── Hero ── */}
      <section className="bg-surface relative overflow-hidden">
        {/* Subtle background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-accent-light/30 via-transparent to-transparent pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-28 lg:pt-28 lg:pb-36">
          <div className="max-w-2xl">
            {/* Pill badge */}
            <div className="inline-flex items-center gap-2 bg-accent-light text-accent text-xs font-semibold px-3.5 py-1.5 rounded-full mb-8 border border-indigo-200">
              <span className="w-1.5 h-1.5 bg-accent rounded-full animate-pulse" />
              Now accepting waitlist registrations
            </div>

            {/* Headline */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-primary leading-[1.08] tracking-tight mb-6">
              Find your
              <br />
              placement.
              <br />
              <span className="text-accent">Land the role.</span>
            </h1>

            {/* Subheadline */}
            <p className="text-lg sm:text-xl text-muted leading-relaxed mb-10 max-w-lg">
              The AI-powered platform built by placement students, for placement students.
              Join the waitlist for early access.
            </p>

            {/* Waitlist form */}
            <div className="max-w-md">
              <WaitlistForm size="large" />
              <p className="text-sm text-muted mt-3 flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 text-success flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Join students who are done settling for irrelevant opportunities.
              </p>
            </div>
          </div>

          {/* Floating decorative card — hidden on mobile */}
          <div className="hidden lg:block absolute right-8 top-1/2 -translate-y-1/2 w-80 pointer-events-none select-none">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-card-hover p-5 space-y-3 opacity-90">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted uppercase tracking-wide">AI Match</span>
                <span className="text-xs font-bold text-success bg-green-50 px-2 py-0.5 rounded-full">94%</span>
              </div>
              <div>
                <p className="font-semibold text-primary text-sm">Data Science Placement</p>
                <p className="text-accent text-sm font-medium">AstraZeneca</p>
              </div>
              <div className="flex gap-2 flex-wrap">
                <span className="text-xs bg-gray-50 text-muted px-2 py-1 rounded-full border border-gray-100">📍 Cambridge</span>
                <span className="text-xs bg-gray-50 text-muted px-2 py-1 rounded-full border border-gray-100">💷 £22k / yr</span>
                <span className="text-xs bg-gray-50 text-muted px-2 py-1 rounded-full border border-gray-100">⏱ 12 months</span>
              </div>
              <div className="pt-1">
                <div className="w-full bg-gray-100 rounded-full h-1.5">
                  <div className="bg-accent h-1.5 rounded-full" style={{ width: '94%' }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats strip ── */}
      <section className="bg-white border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map(({ value, label }) => (
              <div key={label} className="text-center">
                <p className="text-3xl font-bold text-primary">{value}</p>
                <p className="text-sm text-muted mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="py-24 bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 max-w-xl mx-auto">
            <p className="text-accent text-sm font-semibold uppercase tracking-widest mb-3">Platform features</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-primary leading-snug">
              Everything you need to land your placement year
            </h2>
            <p className="text-muted mt-4 text-base leading-relaxed">
              Built with first-hand experience of what it actually takes to secure a
              placement in the UK STEM market.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map((feature) => (
              <Card key={feature.title} hover className="p-6 flex flex-col gap-4">
                <div className="w-10 h-10 bg-accent-light rounded-lg flex items-center justify-center flex-shrink-0">
                  {feature.icon}
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-primary mb-1.5">{feature.title}</h3>
                  <p className="text-sm text-muted leading-relaxed">{feature.description}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ── Waitlist CTA ── */}
      <section className="bg-accent relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 to-indigo-800 opacity-50 pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 leading-snug">
            Be first to access PlacementOS
          </h2>
          <p className="text-indigo-200 mb-10 max-w-md mx-auto text-base leading-relaxed">
            Join the waitlist and get early access, plus exclusive placement resources,
            interview guides, and company insights before anyone else.
          </p>
          <div className="max-w-md mx-auto">
            <WaitlistForm light size="large" />
          </div>
          <p className="text-indigo-300 text-xs mt-4">Built for UK STEM students · Early access closing soon</p>
        </div>
      </section>
    </>
  )
}
