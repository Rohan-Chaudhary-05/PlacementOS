import Link from 'next/link'
import { buttonClasses } from '@/components/ui/buttonStyles'

export const metadata = {
  title: 'For Companies · PlacementOS',
  description:
    'Post placement and internship opportunities to UK STEM students, and track every submission from review to acceptance.',
}

const steps = [
  {
    title: 'Create your account',
    description: 'Sign up with your company email and confirm it. Takes under a minute.',
  },
  {
    title: 'Post an opportunity',
    description:
      'Share the role, salary range, location, work mode, and your company values in one structured form.',
  },
  {
    title: 'Track the status',
    description:
      'Our team reviews each submission. Watch it move from under review to accepted — live on your dashboard.',
  },
]

export default function ForCompaniesPage() {
  return (
    <div className="bg-surface">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-accent-light/40 via-transparent to-transparent pointer-events-none" />
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 text-center">
          <div className="inline-flex items-center gap-2 bg-accent-light text-accent text-xs font-semibold px-3.5 py-1.5 rounded-full mb-6 border border-indigo-200">
            For employers
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-primary leading-tight tracking-tight max-w-3xl mx-auto">
            Reach the UK&apos;s STEM placement students
          </h1>
          <p className="text-lg text-muted leading-relaxed mt-5 max-w-xl mx-auto">
            Post your placement and internship opportunities, and track every submission from review
            to acceptance in one place.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8">
            <Link href="/company/register" className={buttonClasses('primary', 'lg')}>
              Create a company account
            </Link>
            <Link href="/login" className={buttonClasses('ghost', 'lg')}>
              Sign in
            </Link>
          </div>
        </div>
      </section>

      {/* Steps */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {steps.map((step, index) => (
            <div key={step.title} className="bg-white rounded-2xl border border-gray-100 shadow-card p-6">
              <div className="w-9 h-9 rounded-lg bg-accent-light text-accent font-bold flex items-center justify-center">
                {index + 1}
              </div>
              <h3 className="font-semibold text-primary mt-4">{step.title}</h3>
              <p className="text-sm text-muted leading-relaxed mt-1.5">{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-accent">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white">Ready to post your first role?</h2>
          <p className="text-indigo-200 mt-3 max-w-md mx-auto">
            Create your account and submit an opportunity in minutes.
          </p>
          <div className="mt-7">
            <Link
              href="/company/register"
              className={buttonClasses('secondary', 'lg', 'bg-white !text-accent hover:bg-accent-light')}
            >
              Get started
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
