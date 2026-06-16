'use client'

import { InputHTMLAttributes, forwardRef } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className = '', id, ...props }, ref) => {
    const errorId = id && error ? `${id}-error` : undefined
    const hintId = id && hint && !error ? `${id}-hint` : undefined

    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label htmlFor={id} className="text-sm font-medium text-primary">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          aria-invalid={error ? true : undefined}
          aria-describedby={errorId ?? hintId}
          className={[
            'w-full px-4 py-2.5 rounded-lg border bg-white text-primary',
            'placeholder:text-muted text-sm',
            'transition-all duration-150',
            'focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent',
            error ? 'border-red-400 focus:ring-red-400' : 'border-gray-200',
            className,
          ].join(' ')}
          {...props}
        />
        {hint && !error && (
          <p id={hintId} className="text-xs text-muted mt-0.5">
            {hint}
          </p>
        )}
        {error && (
          <p id={errorId} role="alert" className="text-xs text-red-500 mt-0.5">
            {error}
          </p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

export default Input
