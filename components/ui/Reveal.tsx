'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'

/**
 * Fades + slides its children up the first time they scroll into view.
 * Dependency-free (IntersectionObserver) and quiet by design. Honours
 * `prefers-reduced-motion` by showing content immediately with no transition.
 *
 * `delay` (ms) staggers siblings — e.g. cards in a grid revealing in sequence.
 */
export default function Reveal({
  children,
  delay = 0,
  className = '',
}: {
  children: ReactNode
  delay?: number
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [shown, setShown] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setShown(true)
      return
    }
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          // Reveal when scrolled into view, or if it's already above the viewport
          // (e.g. scroll restoration, an in-page anchor, or a fast jump) so content
          // is never left invisible above the fold.
          if (entry.isIntersecting || entry.boundingClientRect.top < 0) {
            setShown(true)
            observer.disconnect()
          }
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -8% 0px' }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      style={{ transitionDelay: shown ? `${delay}ms` : '0ms' }}
      className={[
        'transition-all duration-700 ease-out motion-reduce:transition-none motion-reduce:transform-none',
        shown ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4',
        className,
      ].join(' ')}
    >
      {children}
    </div>
  )
}
