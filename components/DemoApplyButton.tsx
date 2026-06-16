'use client'

import Button from '@/components/ui/Button'
import { useWaitlist } from '@/components/waitlist/WaitlistProvider'

/**
 * Apply CTA for SAMPLE listings. The platform is pre-launch, so "applying" to a
 * sample opens the waitlist rather than an external ATS.
 */
export default function DemoApplyButton({ className = '' }: { className?: string }) {
  const { open } = useWaitlist()
  return (
    <Button size="lg" onClick={open} className={className}>
      Join the waitlist to apply
    </Button>
  )
}
