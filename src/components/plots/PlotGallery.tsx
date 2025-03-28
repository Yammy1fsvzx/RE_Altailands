'use client'

import { useState, useCallback } from 'react'
import Image from 'next/image'
import { ChevronLeftIcon, ChevronRightIcon, XMarkIcon } from '@heroicons/react/24/outline'

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
  const [touchStart, setTouchStart] = useState(0)
  
  // Создаем массив фото, даже если их нет
  const safeMedia = media.length > 0 ? media : [{ id: 'placeholder', url: '/images/plot-placeholder.jpg', type: 'image' }]

  // Функция для перехода к следующему слайду
  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % safeMedia.length)
  }, [safeMedia.length])

  // Функция для перехода к предыдущему слайду
  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + safeMedia.length) % safeMedia.length)
  }, [safeMedia.length])

  // Обработчики для свайпа на мобильных устройствах
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStart) return
    
    const touchEnd = e.touches[0].clientX
    const diff = touchStart - touchEnd
    
    if (diff > 50) {
      nextSlide()
      setTouchStart(0)
    } else if (diff < -50) {
      prevSlide()
      setTouchStart(0)
    }
  }

  return (
    <div className="relative mb-6">
      {/* Основная галерея */}
      <div 
        className="relative w-full h-[520px] sm:h-[600px] md:h-[700px] overflow-hidden rounded-none rounded-b-2xl" 
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
      >
        {/* Текущее изображение */}
        <div 
          className="absolute inset-0 w-full h-full"
          onClick={() => setShowLightbox(true)}
        >
          <Image
            src={safeMedia[currentIndex].url}
            alt=""
            fill
            sizes="100vw"
            priority
            className="object-cover cursor-pointer"
          />
        </div>

        {/* Навигационные кнопки */}
        {safeMedia.length > 1 && (
          <div className="absolute bottom-8 sm:bottom-10 left-0 right-0 flex justify-between mx-8">
            <button
              onClick={prevSlide}
              className="w-12 h-12 flex items-center justify-center bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/40 transition-all duration-300 border border-white/30"
              aria-label="Предыдущее изображение"
            >
              <ChevronLeftIcon className="w-6 h-6 text-white" />
            </button>
            
            {/* Индикаторы */}
            <div className="flex items-center gap-2">
              {safeMedia.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                    idx === currentIndex 
                      ? 'bg-white scale-125' 
                      : 'bg-white/50 hover:bg-white/70'
                  }`}
                  aria-label={`Перейти к изображению ${idx + 1}`}
                />
              ))}
            </div>
            
            <button
              onClick={nextSlide}
              className="w-12 h-12 flex items-center justify-center bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/40 transition-all duration-300 border border-white/30"
              aria-label="Следующее изображение"
            >
              <ChevronRightIcon className="w-6 h-6 text-white" />
            </button>
          </div>
        )}
      </div>

      {/* Лайтбокс */}
      {showLightbox && (
        <div className="fixed inset-0 bg-black/95 z-50 backdrop-blur-sm">
          <div className="relative w-full h-full flex items-center justify-center">
            <Image
              src={safeMedia[currentIndex].url}
              alt=""
              fill
              className="object-contain"
              sizes="100vw"
              priority
            />
            
            {/* Навигация в лайтбоксе */}
            {safeMedia.length > 1 && (
              <>
                <button
                  onClick={prevSlide}
                  className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/30 backdrop-blur-sm hover:bg-black/50 transition-all border border-white/20"
                >
                  <ChevronLeftIcon className="w-6 h-6 text-white" />
                </button>
                <button
                  onClick={nextSlide}
                  className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/30 backdrop-blur-sm hover:bg-black/50 transition-all border border-white/20"
                >
                  <ChevronRightIcon className="w-6 h-6 text-white" />
                </button>
              </>
            )}

            {/* Кнопка закрытия */}
            <button
              onClick={() => setShowLightbox(false)}
              className="absolute top-4 right-4 sm:top-8 sm:right-8 p-3 rounded-full bg-black/30 backdrop-blur-sm hover:bg-black/50 transition-all border border-white/20"
            >
              <XMarkIcon className="w-6 h-6 text-white" />
            </button>

            {/* Индикатор */}
            <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-3">
              {safeMedia.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    idx === currentIndex ? 'bg-white scale-125' : 'bg-white/40 hover:bg-white/60'
                  }`}
                  aria-label={`Перейти к изображению ${idx + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 