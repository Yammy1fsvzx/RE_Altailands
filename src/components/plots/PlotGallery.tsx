'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ChevronLeftIcon, ChevronRightIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { getMediaUrl } from '@/lib/utils'

interface PlotMedia {
  id: string
  url: string
  type: string
}

interface PlotGalleryProps {
  media: PlotMedia[]
}

export default function PlotGallery({ media }: PlotGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showLightbox, setShowLightbox] = useState(false)

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % media.length)
  }

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + media.length) % media.length)
  }

  return (
    <>
      {/* Основная галерея */}
      <div className="relative bg-gray-900 h-[500px] sm:h-[400px] md:h-[650px]">
        {media.length > 0 ? (
          <>
            <Image
              src={media[currentIndex].url}
              alt=""
              fill
              className="object-contain"
              onClick={() => setShowLightbox(true)}
              priority
            />
            
            {/* Навигационные кнопки */}
            {media.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 hover:bg-white shadow-lg transition-colors"
                >
                  <ChevronLeftIcon className="w-6 h-6 text-gray-900" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 hover:bg-white shadow-lg transition-colors"
                >
                  <ChevronRightIcon className="w-6 h-6 text-gray-900" />
                </button>
              </>
            )}

            {/* Индикатор количества фото */}
            <div className="absolute bottom-4 right-4 px-3 py-1 rounded-full bg-black/50 text-white text-sm">
              {currentIndex + 1} / {media.length}
            </div>
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-200">
            <span className="text-gray-400">Нет фотографий</span>
          </div>
        )}
      </div>

      {/* Превью фотографий */}
      {media.length > 1 && (
        <div className="max-w-7xl mx-auto px-4 -mt-12 relative z-10">
          <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 mt-20">
            <div className="flex gap-4 overflow-x-auto p-2">
              {media.map((item, index) => (
                <button
                  key={item.id}
                  onClick={() => setCurrentIndex(index)}
                  className={`relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden ${
                    index === currentIndex ? 'ring-2 ring-green-500' : ''
                  }`}
                >
                  <Image
                    src={item.url}
                    alt=""
                    fill
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Лайтбокс */}
      {showLightbox && (
        <div className="fixed inset-0 bg-black/90 z-50">
          <div className="relative w-full h-full flex items-center justify-center">
            <Image
              src={media[currentIndex].url}
              alt=""
              fill
              className="object-contain"
              priority
            />
            
            {/* Навигация в лайтбоксе */}
            {media.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 hover:bg-white shadow-lg transition-colors"
                >
                  <ChevronLeftIcon className="w-6 h-6 text-gray-900" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 hover:bg-white shadow-lg transition-colors"
                >
                  <ChevronRightIcon className="w-6 h-6 text-gray-900" />
                </button>
              </>
            )}

            {/* Кнопка закрытия */}
            <button
              onClick={() => setShowLightbox(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/80 hover:bg-white shadow-lg transition-colors"
            >
              <XMarkIcon className="w-6 h-6 text-gray-900" />
            </button>

            {/* Индикатор */}
            <div className="absolute bottom-4 right-4 px-3 py-1 rounded-full bg-white/20 text-white text-sm">
              {currentIndex + 1} / {media.length}
            </div>
          </div>
        </div>
      )}
    </>
  )
} 