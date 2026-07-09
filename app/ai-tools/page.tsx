import Link from 'next/link'
import Badge from '@/components/ui/Badge'
import { buttonClasses } from '@/components/ui/buttonStyles'
import Card from '@/components/ui/Card'

const tools = [
  {
    title: 'AI CV Tailor',
    description: 'Build your CV section by section and download a polished, industry-tailored PDF in minutes.',
    href: '/ai-tools/cv-tailor',
    cta: 'Open tool',
  },
  {
    title: 'Application Tracker',
    description: 'Save roles, track every application through a 5-stage pipeline, and stay ahead of every deadline.',
    href: '/student/dashboard',
    cta: 'Open tracker',
  },
  {
    title: 'Cover Letter Generator',
    description: 'Generate a tailored, role-specific cover letter and download it as a polished PDF in minutes.',
    href: '/ai-tools/cover-letter',
    cta: 'Open tool',
  },
  {
    title: 'Interview Prep',
    description: 'Practise behavioural, motivational and technical questions with STAR scaffolding for your field.',
    href: '/ai-tools/interview-prep',
    cta: 'Open tool',
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
            <Card key={tool.title} hover className="p-6 flex flex-col gap-4">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-lg font-semibold text-primary">{tool.title}</h2>
                <Badge variant="success">Free</Badge>
              </div>

              <p className="text-sm text-muted leading-relaxed flex-1">{tool.description}</p>

              <Link href={tool.href} className={buttonClasses('primary', 'md', 'w-full sm:w-auto')}>
                {tool.cta}
              </Link>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
