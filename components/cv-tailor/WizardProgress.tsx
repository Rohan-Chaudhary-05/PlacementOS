'use client'

export const WIZARD_STEPS = [
  'About you',
  'Skills & certifications',
  'Experience & education',
  'Target role',
] as const

interface WizardProgressProps {
  currentStep: number
  onStepClick?: (step: number) => void
}

export default function WizardProgress({ currentStep, onStepClick }: WizardProgressProps) {
  return (
    <ol className="flex items-start gap-2 sm:gap-4">
      {WIZARD_STEPS.map((label, index) => {
        const step = index + 1
        const isComplete = step < currentStep
        const isActive = step === currentStep
        const isClickable = isComplete && onStepClick

        return (
          <li key={label} className="flex-1 min-w-0">
            <button
              type="button"
              disabled={!isClickable}
              onClick={() => onStepClick?.(step)}
              className={[
                'w-full flex flex-col items-center gap-1.5 group',
                isClickable ? 'cursor-pointer' : 'cursor-default',
              ].join(' ')}
              aria-current={isActive ? 'step' : undefined}
              aria-label={`Step ${step}: ${label}`}
            >
              <span
                className={[
                  'flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold',
                  'transition-colors duration-150',
                  isActive
                    ? 'bg-accent text-white'
                    : isComplete
                      ? 'bg-accent-light text-accent group-hover:bg-indigo-100'
                      : 'bg-gray-100 text-muted',
                ].join(' ')}
              >
                {isComplete ? (
                  <svg aria-hidden="true" className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  step
                )}
              </span>
              <span
                className={[
                  'text-xs font-medium text-center leading-tight hidden sm:block',
                  isActive ? 'text-primary' : 'text-muted',
                ].join(' ')}
              >
                {label}
              </span>
            </button>
          </li>
        )
      })}
    </ol>
  )
}
