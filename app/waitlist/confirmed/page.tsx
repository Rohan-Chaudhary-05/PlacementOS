import Link from 'next/link'
import { buttonClasses } from '@/components/ui/buttonStyles'

export const metadata = { title: "You're on the waitlist · PlacementOS" }

export default function WaitlistConfirmedPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-surface flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto w-14 h-14 rounded-full bg-green-50 flex items-center justify-center mb-5">
          <svg className="w-7 h-7 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-primary">You&apos;re on the waitlist</h1>
        <p className="text-muted mt-2 leading-relaxed">
          Your email is confirmed and your spot is secured. We&apos;ll be in touch with early access
          and exclusive placement resources.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-7">
          <Link href="/" className={buttonClasses('primary', 'md')}>
            Back to home
          </Link>
          <Link href="/opportunities" className={buttonClasses('ghost', 'md')}>
            Browse opportunities
          </Link>
        </div>
      </div>
    </div>
  )
}
