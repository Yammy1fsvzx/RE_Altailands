'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { PlotStatus } from '@/types/plot'
import { FunnelIcon } from '@heroicons/react/24/outline'

type PlotFiltersProps = {
  regions: string[]
  currentStatus?: PlotStatus
  currentRegion?: string
  currentMinPrice?: number
  currentMaxPrice?: number
}

export default function PlotFilters({
  regions,
  currentStatus,
  currentRegion,
  currentMinPrice,
  currentMaxPrice,
}: PlotFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isOpen, setIsOpen] = useState(false)
  const filterRef = useRef<HTMLDivElement>(null)

  // Закрываем фильтры при клике вне компонента
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    
    const params = new URLSearchParams(searchParams.toString())
    const status = formData.get('status')
    const region = formData.get('region')
    const minPrice = formData.get('minPrice')
    const maxPrice = formData.get('maxPrice')

    if (status) {
      params.set('status', status.toString())
    } else {
      params.delete('status')
    }
    
    if (region) {
      params.set('region', region.toString())
    } else {
      params.delete('region')
    }
    
    if (minPrice) {
      params.set('minPrice', minPrice.toString())
    } else {
      params.delete('minPrice')
    }
    
    if (maxPrice) {
      params.set('maxPrice', maxPrice.toString())
    } else {
      params.delete('maxPrice')
    }

    router.push(`/admin/plots?${params.toString()}`)
    setIsOpen(false)
  }

  const handleReset = () => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete('status')
    params.delete('region')
    params.delete('minPrice')
    params.delete('maxPrice')
    router.push(`/admin/plots?${params.toString()}`)
    setIsOpen(false)
  }

  const hasActiveFilters = currentStatus || currentRegion || currentMinPrice || currentMaxPrice

  return (
    <div className="relative" ref={filterRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`
          inline-flex items-center px-4 py-2 border rounded-md shadow-sm text-sm font-medium
          transition-colors duration-200
          ${hasActiveFilters 
            ? 'border-indigo-500 text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-900/20' 
            : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800'
          }
          hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500
          w-full sm:w-auto justify-center
        `}
      >
        <FunnelIcon className={`h-5 w-5 mr-2 ${hasActiveFilters ? 'text-indigo-500' : 'text-gray-400'}`} />
        Фильтры
        {hasActiveFilters && (
          <span className="ml-2.5 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200">
            Активны
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-screen max-w-sm rounded-lg bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 z-50">
          <form onSubmit={handleSubmit} className="p-4 space-y-4">
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Статус
              </label>
              <select
                id="status"
                name="status"
                defaultValue={currentStatus}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">Все статусы</option>
                <option value="AVAILABLE">Доступен</option>
                <option value="RESERVED">Забронирован</option>
                <option value="SOLD">Продан</option>
              </select>
            </div>

            <div>
              <label htmlFor="region" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Регион
              </label>
              <select
                id="region"
                name="region"
                defaultValue={currentRegion}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">Все регионы</option>
                {regions.map((region) => (
                  <option key={region} value={region}>
                    {region}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="minPrice" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Цена от
                </label>
                <input
                  type="number"
                  id="minPrice"
                  name="minPrice"
                  defaultValue={currentMinPrice}
                  placeholder="0"
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label htmlFor="maxPrice" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Цена до
                </label>
                <input
                  type="number"
                  id="maxPrice"
                  name="maxPrice"
                  defaultValue={currentMaxPrice}
                  placeholder="999999999"
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={handleReset}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md"
              >
                Сбросить
              </button>
              <button
                type="submit"
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Применить
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
} 