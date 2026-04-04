import Badge from '@/components/ui/Badge'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'

type Placement = {
  id: number
  role: string
  company: string
  location: string
  salary: string
  salaryNum: number
  deadline: string
  duration: string
  sector: string
  match: number
  logo: string
  description: string
}

const placements: Placement[] = [
  {
    id: 1,
    role: 'Data Science Placement',
    company: 'AstraZeneca',
    location: 'Cambridge, UK',
    salary: '£22,000 / yr',
    salaryNum: 22000,
    deadline: '15 Apr 2025',
    duration: '12 months',
    sector: 'Pharma',
    match: 94,
    logo: 'AZ',
    description:
      'Join the Global AI & Data Science team to build ML pipelines supporting clinical trial analysis and drug discovery workflows.',
  },
  {
    id: 2,
    role: 'Software Engineering Intern',
    company: 'Arm',
    location: 'Cambridge, UK',
    salary: '£28,000 / yr',
    salaryNum: 28000,
    deadline: '30 Apr 2025',
    duration: '12 months',
    sector: 'Technology',
    match: 87,
    logo: 'AR',
    description:
      'Work on next-generation chip architecture tools, contributing to compilers or verification frameworks used across the global semiconductor industry.',
  },
  {
    id: 3,
    role: 'Quantitative Finance Placement',
    company: 'Goldman Sachs',
    location: 'London, UK',
    salary: '£35,000 / yr',
    salaryNum: 35000,
    deadline: '1 May 2025',
    duration: '12 months',
    sector: 'Finance',
    match: 76,
    logo: 'GS',
    description:
      'Support the Strats team in building quantitative models for risk, pricing, and portfolio analytics across global markets.',
  },
  {
    id: 4,
    role: 'Mechanical Engineering Placement',
    company: 'Rolls-Royce',
    location: 'Derby, UK',
    salary: '£21,000 / yr',
    salaryNum: 21000,
    deadline: '20 Apr 2025',
    duration: '12 months',
    sector: 'Aerospace',
    match: 91,
    logo: 'RR',
    description:
      'Embedded in the Civil Aerospace division, you will assist senior engineers in structural analysis and CFD simulation for jet engine components.',
  },
  {
    id: 5,
    role: 'Machine Learning Engineer Intern',
    company: 'DeepMind',
    location: 'London, UK',
    salary: '£32,000 / yr',
    salaryNum: 32000,
    deadline: '10 May 2025',
    duration: '6 months',
    sector: 'AI / Research',
    match: 82,
    logo: 'DM',
    description:
      'Contribute to fundamental AI safety and capabilities research. Strong mathematical foundations and Python experience required.',
  },
  {
    id: 6,
    role: 'Chemical Engineering Placement',
    company: 'BP',
    location: 'Sunbury-on-Thames, UK',
    salary: '£23,500 / yr',
    salaryNum: 23500,
    deadline: '5 May 2025',
    duration: '12 months',
    sector: 'Energy',
    match: 68,
    logo: 'BP',
    description:
      'Support the Low Carbon Solutions team in evaluating biofuels process economics and sustainability metrics for the energy transition.',
  },
  {
    id: 7,
    role: 'Technology Risk Analyst Placement',
    company: 'HSBC',
    location: 'London, UK',
    salary: '£26,000 / yr',
    salaryNum: 26000,
    deadline: '25 Apr 2025',
    duration: '12 months',
    sector: 'Finance',
    match: 73,
    logo: 'HS',
    description:
      'Work within the Global Technology Risk function on cyber resilience programmes, regulatory compliance, and third-party risk assessments.',
  },
  {
    id: 8,
    role: 'Biomedical Data Analyst Placement',
    company: 'GSK',
    location: 'Stevenage, UK',
    salary: '£21,500 / yr',
    salaryNum: 21500,
    deadline: '12 May 2025',
    duration: '12 months',
    sector: 'Pharma',
    match: 89,
    logo: 'GK',
    description:
      'Analyse genomics and clinical datasets to support the Vaccines R&D pipeline, using R and Python within a regulated environment.',
  },
]

const sectors = ['All', 'Technology', 'Finance', 'Pharma', 'Aerospace', 'AI / Research', 'Energy']

function matchVariant(match: number): 'success' | 'accent' | 'muted' {
  if (match >= 85) return 'success'
  if (match >= 70) return 'accent'
  return 'muted'
}

function LogoAvatar({ initials, sector }: { initials: string; sector: string }) {
  const colours: Record<string, string> = {
    Pharma: 'bg-purple-50 text-purple-700',
    Technology: 'bg-blue-50 text-blue-700',
    Finance: 'bg-indigo-50 text-indigo-700',
    Aerospace: 'bg-sky-50 text-sky-700',
    'AI / Research': 'bg-violet-50 text-violet-700',
    Energy: 'bg-emerald-50 text-emerald-700',
  }
  return (
    <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 ${colours[sector] ?? 'bg-gray-100 text-gray-600'}`}>
      {initials}
    </div>
  )
}

export default function OpportunitiesPage() {
  return (
    <div className="min-h-screen bg-surface">
      {/* Page header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-primary">Placement Opportunities</h1>
              <p className="text-muted mt-1.5">
                AI-matched placements for UK STEM students ·{' '}
                <span className="font-medium text-primary">{placements.length} roles</span>
              </p>
            </div>
            {/* Search stub */}
            <div className="relative w-full sm:w-72">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="search"
                placeholder="Search roles or companies…"
                className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-gray-200 bg-white text-sm text-primary placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col lg:flex-row gap-8">

          {/* ── Filter sidebar ── */}
          <aside className="w-full lg:w-60 flex-shrink-0">
            <div className="bg-white rounded-xl border border-gray-100 shadow-card p-5 space-y-6 lg:sticky lg:top-24">
              <h2 className="text-sm font-semibold text-primary">Filters</h2>

              {/* Sector */}
              <div>
                <p className="text-xs font-semibold text-muted uppercase tracking-widest mb-3">Sector</p>
                <div className="flex flex-wrap gap-1.5">
                  {sectors.map((s) => (
                    <button
                      key={s}
                      className={[
                        'px-3 py-1 rounded-full text-xs font-medium transition-colors duration-150',
                        s === 'All'
                          ? 'bg-accent text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-accent-light hover:text-accent',
                      ].join(' ')}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Location */}
              <div>
                <label className="block text-xs font-semibold text-muted uppercase tracking-widest mb-2">
                  Location
                </label>
                <select className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm text-primary bg-white focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent">
                  <option>All locations</option>
                  <option>London</option>
                  <option>Cambridge</option>
                  <option>Derby</option>
                  <option>Stevenage</option>
                  <option>Sunbury-on-Thames</option>
                </select>
              </div>

              {/* Duration */}
              <div>
                <label className="block text-xs font-semibold text-muted uppercase tracking-widest mb-2">
                  Duration
                </label>
                <select className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm text-primary bg-white focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent">
                  <option>Any duration</option>
                  <option>6 months</option>
                  <option>12 months</option>
                </select>
              </div>

              {/* Salary */}
              <div>
                <label className="block text-xs font-semibold text-muted uppercase tracking-widest mb-2">
                  Minimum salary
                </label>
                <select className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm text-primary bg-white focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent">
                  <option>Any salary</option>
                  <option>£18,000+</option>
                  <option>£22,000+</option>
                  <option>£26,000+</option>
                  <option>£30,000+</option>
                </select>
              </div>

              {/* AI match */}
              <div>
                <label className="block text-xs font-semibold text-muted uppercase tracking-widest mb-2">
                  Min AI match
                </label>
                <select className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm text-primary bg-white focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent">
                  <option>Any match</option>
                  <option>70%+</option>
                  <option>80%+</option>
                  <option>90%+</option>
                </select>
              </div>

              <button className="w-full text-center text-xs text-muted hover:text-accent transition-colors py-1">
                Clear all filters
              </button>
            </div>
          </aside>

          {/* ── Listings ── */}
          <div className="flex-1 grid grid-cols-1 xl:grid-cols-2 gap-4">
            {placements.map((p) => (
              <Card key={p.id} hover className="p-5 flex flex-col gap-4">
                {/* Header row */}
                <div className="flex items-start gap-3">
                  <LogoAvatar initials={p.logo} sector={p.sector} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-semibold text-primary text-sm leading-snug">{p.role}</h3>
                        <p className="text-accent text-sm font-medium mt-0.5">{p.company}</p>
                      </div>
                      <Badge variant={matchVariant(p.match)} className="flex-shrink-0 mt-0.5">
                        {p.match}% match
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <p className="text-xs text-muted leading-relaxed line-clamp-2">{p.description}</p>

                {/* Metadata chips */}
                <div className="flex flex-wrap gap-1.5">
                  <Badge variant="muted">📍 {p.location}</Badge>
                  <Badge variant="muted">⏱ {p.duration}</Badge>
                  <Badge variant="muted">💷 {p.salary}</Badge>
                  <Badge variant="default">{p.sector}</Badge>
                </div>

                {/* Footer row */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-50 gap-2">
                  <div className="text-xs text-muted">
                    <span className="font-medium text-primary">Closes:</span> {p.deadline}
                  </div>
                  <Button variant="primary" size="sm">
                    Apply Now
                    <svg className="w-3.5 h-3.5 ml-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
