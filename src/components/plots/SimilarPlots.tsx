'use client'

import { useEffect, useState } from 'react'
import PlotCard from '@/components/PlotCard'

interface Plot {
  id: string
  title: string
  slug: string
  area: number
  price: number
  pricePerMeter: number
  region: string
  locality: string
  landUseType: string
  landCategory: string
  media: {
    url: string
  }[]
}

interface SimilarPlotsProps {
  currentPlotId: string
  region: string
  priceRange: [number, number]
  areaRange: [number, number]
}

export default function SimilarPlots({ 
  currentPlotId,
  region,
  priceRange,
  areaRange 
}: SimilarPlotsProps) {
  const [plots, setPlots] = useState<Plot[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSimilarPlots = async () => {
      try {
        const params = new URLSearchParams({
          region,
          priceMin: priceRange[0].toString(),
          priceMax: priceRange[1].toString(),
          areaMin: areaRange[0].toString(),
          areaMax: areaRange[1].toString(),
          exclude: currentPlotId
        })

        const response = await fetch(`/api/plots/similar?${params.toString()}`)
        if (!response.ok) throw new Error('Failed to fetch similar plots')
        
        const data = await response.json()
        setPlots(data)
      } catch (error) {
        console.error('Error fetching similar plots:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchSimilarPlots()
  }, [currentPlotId, region, priceRange, areaRange])

  if (loading) {
    return (
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Похожие участки
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm overflow-hidden h-[400px]">
              <div className="aspect-[4/3] bg-gray-200 animate-pulse" />
              <div className="p-4 space-y-3">
                <div className="h-6 bg-gray-200 rounded animate-pulse" />
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-2/3" />
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (plots.length === 0) {
    return null
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Похожие участки
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plots.map(plot => (
          <PlotCard key={plot.id} plot={plot} />
        ))}
      </div>
    </div>
  )
} 