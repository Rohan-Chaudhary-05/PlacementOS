import Link from 'next/link'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import { buttonClasses } from '@/components/ui/buttonStyles'
import Card from '@/components/ui/Card'

const tools = [
  {
    title: 'AI CV Tailor',
    description: 'Build your CV section by section and download a polished, industry-tailored PDF in minutes.',
    href: '/ai-tools/cv-tailor',
    cta: 'Open tool',
    status: 'demo' as const,
  },
  {
    title: 'Application Tracker',
    description: 'Save roles, tick off the ones you’ve applied to, and stay ahead of every deadline in one dashboard.',
    href: null,
    cta: null,
    status: 'coming-soon' as const,
  },
  {
    title: 'Cover Letter Generator',
    description: 'Generate a tailored, role-specific cover letter and download it as a polished PDF in minutes.',
    href: '/ai-tools/cover-letter',
    cta: 'Open tool',
    status: 'demo' as const,
  },
  {
    title: 'Interview Prep',
    description: 'Practice technical and behavioural questions with AI-powered feedback.',
    href: null,
    cta: null,
    status: 'coming-soon' as const,
  },
]

export default function AiToolsPage() {
  return (
    <section className="min-h-screen bg-surface py-14 sm:py-18">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mb-10">
          <p className="text-accent text-sm font-semibold uppercase tracking-widest mb-3">AI Tools</p>
          <h1 className="text-3xl sm:text-4xl font-bold text-primary tracking-tight">Placement application tools</h1>
          <p className="text-muted mt-3 text-base leading-relaxed">
            Build stronger applications with focused AI support for CV tailoring, cover letters,
            and interview preparation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {tools.map((tool) => (
            <Card key={tool.title} hover={!!tool.href} className="p-6 flex flex-col gap-4">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-lg font-semibold text-primary">{tool.title}</h2>
                {tool.status === 'demo' ? (
                  <Badge variant="accent">Try it - demo</Badge>
                ) : (
                  <Badge variant="muted">Coming Soon</Badge>
                )}
              </div>

              <p className="text-sm text-muted leading-relaxed flex-1">{tool.description}</p>

              {tool.href ? (
                <Link href={tool.href} className={buttonClasses('primary', 'md', 'w-full sm:w-auto')}>
                  {tool.cta}
                </Link>
              ) : (
                <Button size="md" variant="ghost" disabled className="w-full sm:w-auto">
                  Coming soon
                </Button>
              )}
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
