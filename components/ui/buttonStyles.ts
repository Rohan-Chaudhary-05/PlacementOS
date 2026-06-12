export type ButtonVariant = 'primary' | 'secondary' | 'ghost'
export type ButtonSize = 'sm' | 'md' | 'lg'

export const buttonVariantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-accent text-white hover:bg-indigo-700 shadow-sm hover:shadow focus:ring-accent',
  secondary:
    'bg-accent-light text-accent hover:bg-indigo-100 focus:ring-accent',
  ghost:
    'bg-transparent text-primary border border-gray-200 hover:bg-gray-50 focus:ring-gray-300',
}

export const buttonSizeStyles: Record<ButtonSize, string> = {
  sm: 'px-3.5 py-1.5 text-sm rounded-lg',
  md: 'px-4 py-2 text-sm rounded-lg',
  lg: 'px-6 py-3 text-base rounded-xl',
}

/** Shared class builder so links can be styled as buttons without nesting <button> in <a> */
export function buttonClasses(
  variant: ButtonVariant = 'primary',
  size: ButtonSize = 'md',
  extra = ''
): string {
  return [
    'inline-flex items-center justify-center font-medium',
    'transition-all duration-150',
    'focus:outline-none focus:ring-2 focus:ring-offset-2',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    buttonVariantStyles[variant],
    buttonSizeStyles[size],
    extra,
  ].join(' ')
}
