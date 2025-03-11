'use client'

import { useState, useEffect } from 'react'
import { 
  MagnifyingGlassIcon,
  FunnelIcon,
  MapPinIcon,
  ArrowsUpDownIcon,
  XMarkIcon,
  AdjustmentsHorizontalIcon
} from '@heroicons/react/24/outline'
import PlotCard from '@/components/PlotCard'
import ScrollAnimation from '@/components/ScrollAnimation'
import { formatPrice } from '@/utils/formatters'

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

interface Filters {
  search: string
  priceMin: string
  priceMax: string
  areaMin: string
  areaMax: string
  region: string
  landUseType: string
  landCategory: string
}

const initialFilters: Filters = {
  search: '',
  priceMin: '',
  priceMax: '',
  areaMin: '',
  areaMax: '',
  region: '',
  landUseType: '',
  landCategory: ''
}

export default function CatalogPage() {
  const [plots, setPlots] = useState<Plot[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<Filters>(initialFilters)
  const [showFilters, setShowFilters] = useState(false)
  const [sortBy, setSortBy] = useState<string>('newest')
  const [regions, setRegions] = useState<string[]>([])
  const [landUseTypes, setLandUseTypes] = useState<string[]>([])
  const [landCategories, setLandCategories] = useState<string[]>([])

  // Загрузка участков с учетом фильтров
  useEffect(() => {
    const fetchPlots = async () => {
      try {
        setLoading(true)
        const queryParams = new URLSearchParams()
        
        // Добавляем все фильтры в параметры запроса
        Object.entries(filters).forEach(([key, value]) => {
          if (value) queryParams.append(key, value)
        })
        queryParams.append('sortBy', sortBy)

        // Добавляем задержку в 0.7 секунды
        await new Promise(resolve => setTimeout(resolve, 700))

        const response = await fetch(`/api/plots?${queryParams.toString()}`)
        if (!response.ok) throw new Error('Не удалось загрузить участки')
        
        const data = await response.json()
        setPlots(data)
      } catch (err) {
        console.error('Error fetching plots:', err)
        setError(err instanceof Error ? err.message : 'Произошла ошибка')
      } finally {
        setLoading(false)
      }
    }

    fetchPlots()
  }, [filters, sortBy])

  // Загрузка опций для фильтров
  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        const response = await fetch('/api/plots/filter-options')
        if (!response.ok) throw new Error('Не удалось загрузить опции фильтров')
        
        const data = await response.json()
        setRegions(data.regions)
        setLandUseTypes(data.landUseTypes)
        setLandCategories(data.landCategories)
      } catch (err) {
        console.error('Error fetching filter options:', err)
      }
    }

    fetchFilterOptions()
  }, [])

  const handleFilterChange = (key: keyof Filters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const clearFilters = () => {
    setFilters(initialFilters)
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero секция */}
      <section className="bg-white border-b border-gray-200 pt-16 md:pt-20">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:py-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 sm:mb-3">
            Каталог земельных участков
          </h1>
          <p className="text-base sm:text-lg text-gray-600">
            Найдите идеальный участок для вашего будущего дома
          </p>
        </div>
      </section>

      {/* Основной контент */}
      <section className="py-6 sm:py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-6 sm:gap-8">
            {/* Сайдбар с фильтрами */}
            <aside className={`lg:w-80 flex-shrink-0 transition-all duration-300 ease-in-out ${showFilters ? 'block' : 'hidden lg:block'}`}>
              <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 sticky top-24">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Фильтры
                  </h2>
                  <button
                    onClick={clearFilters}
                    className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    Сбросить
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Поиск */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Поиск по названию
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={filters.search}
                        onChange={(e) => handleFilterChange('search', e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        placeholder="Введите название..."
                      />
                      <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    </div>
                  </div>

                  {/* Цена */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Цена (₽)
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      <input
                        type="number"
                        value={filters.priceMin}
                        onChange={(e) => handleFilterChange('priceMin', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        placeholder="От"
                      />
                      <input
                        type="number"
                        value={filters.priceMax}
                        onChange={(e) => handleFilterChange('priceMax', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        placeholder="До"
                      />
                    </div>
                  </div>

                  {/* Площадь */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Площадь (м²)
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      <input
                        type="number"
                        value={filters.areaMin}
                        onChange={(e) => handleFilterChange('areaMin', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        placeholder="От"
                      />
                      <input
                        type="number"
                        value={filters.areaMax}
                        onChange={(e) => handleFilterChange('areaMax', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        placeholder="До"
                      />
                    </div>
                  </div>

                  {/* Регион */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Регион
                    </label>
                    <select
                      value={filters.region}
                      onChange={(e) => handleFilterChange('region', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    >
                      <option value="">Все регионы</option>
                      {regions.map(region => (
                        <option key={region} value={region}>
                          {region}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Вид разрешенного использования */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Вид разрешенного использования
                    </label>
                    <select
                      value={filters.landUseType}
                      onChange={(e) => handleFilterChange('landUseType', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    >
                      <option value="">Все виды</option>
                      {landUseTypes.map(type => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Категория земель */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Категория земель
                    </label>
                    <select
                      value={filters.landCategory}
                      onChange={(e) => handleFilterChange('landCategory', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    >
                      <option value="">Все категории</option>
                      {landCategories.map(category => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </aside>

            {/* Основной контент */}
            <div className="flex-1 min-h-[500px]">
              {/* Панель управления */}
              <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => setShowFilters(!showFilters)}
                      className="lg:hidden inline-flex items-center gap-2 text-gray-700 hover:text-gray-900 transition-colors"
                    >
                      {showFilters ? (
                        <XMarkIcon className="w-5 h-5" />
                      ) : (
                        <FunnelIcon className="w-5 h-5" />
                      )}
                      <span>Фильтры</span>
                    </button>
                    <div className="text-sm text-gray-600">
                      Найдено: {plots.length} участков
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <label className="text-sm text-gray-700 whitespace-nowrap">Сортировать:</label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="flex-1 sm:flex-none text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white"
                    >
                      <option value="newest">Сначала новые</option>
                      <option value="price_asc">По цене (сначала дешевле)</option>
                      <option value="price_desc">По цене (сначала дороже)</option>
                      <option value="area_asc">По площади (по возрастанию)</option>
                      <option value="area_desc">По площади (по убыванию)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Список участков */}
              <div className="min-h-[500px]">
                {loading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    {[...Array(6)].map((_, i) => (
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
                ) : error ? (
                  <div className="bg-white rounded-xl shadow-sm p-6 text-center">
                    <p className="text-red-500">{error}</p>
                  </div>
                ) : plots.length === 0 ? (
                  <div className="bg-white rounded-xl shadow-sm p-6 text-center">
                    <p className="text-gray-500">По вашему запросу ничего не найдено</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    {plots.map(plot => (
                      <PlotCard key={plot.id} plot={plot} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
} 