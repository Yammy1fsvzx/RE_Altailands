'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import ScrollAnimation from '@/components/ScrollAnimation'
import HeroSection from '@/components/sections/HeroSection'
import InlineQuiz from '@/components/sections/InlineQuiz'
import LatestPlots from '@/components/sections/LatestPlots'

export default function HomePage() {
  const { data: session } = useSession()
  const [activeQuiz, setActiveQuiz] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const response = await fetch('/api/active-quiz')
        if (response.ok) {
          const quiz = await response.json()
          setActiveQuiz(quiz)
        }
      } catch (error) {
        console.error('Error fetching quiz:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchQuiz()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-100">
      <main className="">
        <HeroSection />

        <section className="py-10 md:py-20 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-gray-50 to-gray-100"></div>
          <div className="max-w-7xl mx-auto px-4 relative">
            <ScrollAnimation>
              <InlineQuiz />
            </ScrollAnimation>
          </div>
        </section>

        <LatestPlots />
      </main>
    </div>
  )
}
