'use client'

import { ButtonHTMLAttributes, forwardRef } from 'react'
import { buttonClasses, type ButtonSize, type ButtonVariant } from './buttonStyles'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', className = '', children, ...props }, ref) => {
    return (
      <button ref={ref} className={buttonClasses(variant, size, className)} {...props}>
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'

export default Button
