'use client'

import { useEffect, useState } from 'react'

export default function FontLoader({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="font-system">
        {children}
      </div>
    )
  }

  return (
    <div className="font-yuanqi">
      {children}
    </div>
  )
}
