'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

export default function VisitTracker() {
  const pathname = usePathname()

  useEffect(() => {
    const recordVisit = async () => {
      try {
        await fetch('/api/analytics/visits', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ path: pathname }),
        })
      } catch (error) {
        console.error('Error recording visit:', error)
      }
    }

    recordVisit()
  }, [pathname])

  return null
} 