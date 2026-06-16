'use client'

import Button from '@/components/ui/Button'
import { useWaitlist } from './WaitlistProvider'
import type { ButtonSize, ButtonVariant } from '@/components/ui/buttonStyles'
import type { ReactNode } from 'react'

interface JoinWaitlistButtonProps {
  children?: ReactNode
  variant?: ButtonVariant
  size?: ButtonSize
  className?: string
}

export default function JoinWaitlistButton({
  children = 'Join the waitlist',
  variant = 'primary',
  size = 'lg',
  className = '',
}: JoinWaitlistButtonProps) {
  const { open } = useWaitlist()
  return (
    <Button variant={variant} size={size} className={className} onClick={open}>
      {children}
    </Button>
  )
}
