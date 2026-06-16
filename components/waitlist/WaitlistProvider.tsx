'use client'

import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'
import WaitlistModal from './WaitlistModal'

type WaitlistContextValue = { open: () => void }

const WaitlistContext = createContext<WaitlistContextValue | null>(null)

export function useWaitlist(): WaitlistContextValue {
  const ctx = useContext(WaitlistContext)
  if (!ctx) throw new Error('useWaitlist must be used within a WaitlistProvider')
  return ctx
}

export default function WaitlistProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const open = useCallback(() => setIsOpen(true), [])

  return (
    <WaitlistContext.Provider value={{ open }}>
      {children}
      <WaitlistModal open={isOpen} onClose={() => setIsOpen(false)} />
    </WaitlistContext.Provider>
  )
}
