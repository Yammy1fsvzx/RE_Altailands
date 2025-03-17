'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowRightIcon } from '@heroicons/react/24/outline'
import PlotCard from '@/components/PlotCard'
import { getLatestPlots } from '@/lib/api'

interface Plot {
  id: string
  title: string
  slug: string
  area: number
  price: number
  pricePerMeter: number
  region: string
  locality: string
  media: {
    url: string
  }[]
}

export default function LatestPlots() {
  const [plots, setPlots] = useState<Plot[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadPlots = async () => {
      try {
        const data = await getLatestPlots()
        setPlots(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Произошла ошибка')
      } finally {
        setIsLoading(false)
      }
    }

    loadPlots()
  }, [])

  return (
    <section className="py-8 sm:py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        {/* Заголовок секции */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 sm:mb-8">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1 sm:mb-2">
              Свежие предложения
            </h2>
            {/* <p className="text-sm sm:text-base text-gray-600">
              Посмотрите наши новейшие предложения
            </p> */}
          </div>
          <Link 
            href="/catalog"
            className="inline-flex items-center text-[#16a34a] hover:text-emerald-600 font-medium mt-4 sm:mt-0"
          >
            <span className="text-sm sm:text-base">Смотреть весь каталог</span>
            <ArrowRightIcon className="w-4 sm:w-5 h-4 sm:h-5 ml-1.5 sm:ml-2" />
          </Link>
        </div>

        {/* Сетка участков */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          {isLoading ? (
            <PlotsSkeleton />
          ) : error ? (
            <div className="col-span-full text-center py-6 sm:py-8 text-gray-500 text-sm sm:text-base">
              {error}
            </div>
          ) : (
            plots.map((plot) => (
              <PlotCard key={plot.id} plot={plot} />
            ))
          )}
        </div>
      </div>
    </section>
  )
}

function PlotsSkeleton() {
  return (
    <>
      {[1, 2].map((i) => (
        <div 
          key={i}
          className="bg-white rounded-xl sm:rounded-2xl overflow-hidden animate-pulse"
        >
          <div className="aspect-[4/3] bg-gray-200" />
          <div className="p-3 sm:p-4 space-y-2 sm:space-y-3">
            <div className="h-5 sm:h-6 bg-gray-200 rounded w-3/4" />
            <div className="h-4 sm:h-5 bg-gray-200 rounded w-1/2" />
          </div>
        </div>
      ))}
    </>
  )
} 