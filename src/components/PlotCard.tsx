'use client'

import Image from 'next/image'
import Link from 'next/link'
import { formatPrice } from '@/utils/formatters'
import { MapPinIcon } from '@heroicons/react/24/outline'

interface PlotCardProps {
  plot: {
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
}

export default function PlotCard({ plot }: PlotCardProps) {
  const mainImage = plot.media[0]?.url || '/images/plot-placeholder.jpg'
  
  return (
    <Link 
      href={`/catalog/${plot.slug}`}
      className="group block bg-white rounded-xl sm:rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300"
    >
      {/* Изображение с оверлеем */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image
          src={mainImage}
          alt={plot.title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        
        {/* Цена поверх изображения */}
        <div className="absolute bottom-3 sm:bottom-4 left-3 sm:left-4 right-3 sm:right-4 flex items-end justify-between">
          <div>
            <div className="text-lg sm:text-xl font-bold text-white mb-0.5 sm:mb-1">
              {formatPrice(plot.price)} ₽
            </div>
            <div className="text-xs sm:text-sm text-[#16a34a] font-medium">
              {formatPrice(plot.pricePerMeter)} ₽/м²
            </div>
          </div>
          <div className="bg-[#16a34a] text-white px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs sm:text-sm font-medium">
            {plot.area} м²
          </div>
        </div>
      </div>

      {/* Контент */}
      <div className="p-3 sm:p-4">
        {/* Заголовок */}
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 group-hover:text-[#16a34a] transition-colors duration-300 mb-2 sm:mb-3 line-clamp-2">
          {plot.title.length > 30 ? `${plot.title.slice(0, 30)}...` : plot.title}
        </h3>

        {/* Местоположение */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <MapPinIcon className="w-4 sm:w-5 h-4 sm:h-5 text-[#16a34a] flex-shrink-0" />
          <span className="text-sm sm:text-base text-gray-600 truncate">{plot.locality}, {plot.region}</span>
        </div>
      </div>
    </Link>
  )
} 