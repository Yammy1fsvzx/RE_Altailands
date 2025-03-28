import prisma from '@/lib/prisma'
import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Prisma } from '@prisma/client'
import { formatArea } from '@/lib/format'
import AdminPlotGrid from '@/components/admin/AdminPlotGrid'
import SearchAndFilters from '@/components/admin/SearchAndFilters'
import { PlotTableItem } from '@/types/plot'
import { MapIcon, ArrowsPointingOutIcon, PlusIcon, ArrowLeftIcon, CloudArrowDownIcon } from '@heroicons/react/24/outline'

export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'
export const revalidate = 0

export const metadata: Metadata = {
  title: 'Управление участками | Админ-панель',
}

type SearchParamsProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

// Определяем тип PlotStatus
type PlotStatus = 'AVAILABLE' | 'RESERVED' | 'SOLD'

async function getPlots(searchParams: { [key: string]: string | string[] | undefined }) {
  const searchParamsObj = {
    search: searchParams.search,
    status: searchParams.status,
    sortBy: searchParams.sortBy || 'createdAt',
    sortOrder: searchParams.sortOrder || 'desc',
    page: searchParams.page || '1'
  }

  const search = typeof searchParamsObj.search === 'string' ? searchParamsObj.search.toLowerCase() : undefined
  const status = typeof searchParamsObj.status === 'string' ? searchParamsObj.status as PlotStatus : undefined
  const sortBy = typeof searchParamsObj.sortBy === 'string' ? searchParamsObj.sortBy : 'createdAt'
  const sortOrder = typeof searchParamsObj.sortOrder === 'string' ? searchParamsObj.sortOrder as 'asc' | 'desc' : 'desc'
  const page = typeof searchParamsObj.page === 'string' ? searchParamsObj.page : '1'
  
  const pageSize = 10
  const skip = (parseInt(page) - 1) * pageSize

  const conditions: Prisma.PlotWhereInput[] = []

  if (status) {
    conditions.push({ status })
  }

  if (search) {
    conditions.push({
      OR: [
        { title: { contains: search } },
        { cadastralNumbers: { some: { number: { contains: search } } } }
      ]
    })
  }

  const where: Prisma.PlotWhereInput = conditions.length > 0
    ? { AND: conditions }
    : {}

  const [plots, totalItems] = await Promise.all([
    prisma.plot.findMany({
      where,
      select: {
        id: true,
        title: true,
        price: true,
        pricePerMeter: true,
        area: true,
        status: true,
        isVisible: true,
        media: {
          select: {
            id: true,
            url: true,
            name: true,
            type: true,
            order: true,
            plotId: true,
            createdAt: true,
            updatedAt: true
          },
          orderBy: {
            order: 'asc'
          }
        },
        cadastralNumbers: {
          select: {
            number: true
          },
          take: 1
        }
      },
      orderBy: { [sortBy]: sortOrder },
      skip,
      take: pageSize,
    }),
    prisma.plot.count({ where }),
  ])

  const totalPages = Math.ceil(totalItems / pageSize)
  const currentPage = parseInt(page)

  if (currentPage > totalPages && totalPages > 0) {
    notFound()
  }

  type PlotWithRelations = Prisma.PlotGetPayload<{
    select: {
      id: true
      title: true
      price: true
      pricePerMeter: true
      area: true
      status: true
      isVisible: true
      media: {
        select: {
          id: true
          url: true
          name: true
          type: true
          order: true
          plotId: true
          createdAt: true
          updatedAt: true
        }
      }
      cadastralNumbers: {
        select: {
          number: true
        }
      }
    }
  }>

  const plotItems: PlotTableItem[] = (plots as PlotWithRelations[]).map((plot) => ({
    id: plot.id,
    title: plot.title,
    cadastralNumber: plot.cadastralNumbers[0]?.number,
    price: plot.price,
    pricePerMeter: plot.pricePerMeter,
    area: plot.area,
    status: plot.status,
    isVisible: plot.isVisible,
    media: plot.media
  }))

  return {
    plots: plotItems,
    totalItems,
    totalPages,
    currentPage,
  }
}

async function getStats() {
  const [total, available, reserved, sold, totalArea] = await Promise.all([
    prisma.plot.count(),
    prisma.plot.count({ where: { status: 'AVAILABLE' } }),
    prisma.plot.count({ where: { status: 'RESERVED' } }),
    prisma.plot.count({ where: { status: 'SOLD' } }),
    prisma.plot.aggregate({
      _sum: { area: true },
      where: { status: 'AVAILABLE' },
    }),
  ])

  return {
    total,
    available,
    reserved,
    sold,
    totalArea: totalArea._sum.area || 0,
  }
}

export default async function PlotsPage({ searchParams }: SearchParamsProps) {
  const searchParamsObj = await searchParams
  const { plots, totalItems, totalPages, currentPage } = await getPlots(searchParamsObj)
  const stats = await getStats()

  // Преобразуем общую площадь в сотки
  const totalAreaInSotka = Math.round(stats.totalArea / 100); // 100 кв.м = 1 сотка

  async function toggleVisibility(id: string) {
    'use server'
    const plot = await prisma.plot.findUnique({ where: { id } })
    if (plot) {
      await prisma.plot.update({
        where: { id },
        data: { isVisible: !plot.isVisible },
      })
    }
  }

  async function deletePlot(id: string) {
    'use server'
    await prisma.plot.delete({ where: { id } })
  }

  const defaultSortBy = searchParamsObj.sortBy as string | undefined
  const defaultSortOrder = searchParamsObj.sortOrder as 'asc' | 'desc' | undefined

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 sm:pb-0">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold text-gray-900 dark:text-white">
            Управление участками
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Управление земельными участками и их статусами
          </p>
        </div>
        
        {/* Кнопки управления для десктопа */}
        <div className="hidden sm:flex gap-4">
          <Link
            href="/admin/plots/export"
            className="px-5 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white font-medium text-sm transition duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 inline-flex items-center"
          >
            <CloudArrowDownIcon className="h-4 w-4 mr-2" />
            Экспорт
          </Link>
          <Link
            href="/admin/plots/new"
            className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm transition duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 inline-flex items-center"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Добавить участок
          </Link>
        </div>
      </div>
      
      {/* Статистика участков - изменяем отображение общей площади */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-5 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 sm:p-6 border border-gray-100 dark:border-gray-700 relative overflow-hidden">
          <div className="flex items-center">
            <div className="bg-blue-100 dark:bg-blue-900/30 p-2 sm:p-3 rounded-lg mr-3 sm:mr-4">
              <MapIcon className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">Всего участков</p>
              <h3 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats.total}</h3>
            </div>
          </div>
          <div className="absolute bottom-0 right-0 -mb-3 opacity-10">
            <MapIcon className="h-16 sm:h-20 w-16 sm:w-20 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 sm:p-6 border border-gray-100 dark:border-gray-700 relative overflow-hidden">
          <div className="flex items-center">
            <div className="bg-green-100 dark:bg-green-900/30 p-2 sm:p-3 rounded-lg mr-3 sm:mr-4">
              <MapIcon className="h-5 w-5 sm:h-6 sm:w-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">Доступно</p>
              <h3 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats.available}</h3>
            </div>
          </div>
          <div className="absolute bottom-0 right-0 -mb-3 opacity-10">
            <MapIcon className="h-16 sm:h-20 w-16 sm:w-20 text-green-600" />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 sm:p-6 border border-gray-100 dark:border-gray-700 relative overflow-hidden">
          <div className="flex items-center">
            <div className="bg-yellow-100 dark:bg-yellow-900/30 p-2 sm:p-3 rounded-lg mr-3 sm:mr-4">
              <MapIcon className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">Забронировано</p>
              <h3 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats.reserved}</h3>
            </div>
          </div>
          <div className="absolute bottom-0 right-0 -mb-3 opacity-10">
            <MapIcon className="h-16 sm:h-20 w-16 sm:w-20 text-yellow-600" />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 sm:p-6 border border-gray-100 dark:border-gray-700 relative overflow-hidden">
          <div className="flex items-center">
            <div className="bg-red-100 dark:bg-red-900/30 p-2 sm:p-3 rounded-lg mr-3 sm:mr-4">
              <MapIcon className="h-5 w-5 sm:h-6 sm:w-6 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">Продано</p>
              <h3 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats.sold}</h3>
            </div>
          </div>
          <div className="absolute bottom-0 right-0 -mb-3 opacity-10">
            <MapIcon className="h-16 sm:h-20 w-16 sm:w-20 text-red-600" />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 sm:p-6 border border-gray-100 dark:border-gray-700 relative overflow-hidden">
          <div className="flex items-center">
            <div className="bg-purple-100 dark:bg-purple-900/30 p-2 sm:p-3 rounded-lg mr-3 sm:mr-4">
              <ArrowsPointingOutIcon className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">Общая площадь</p>
              <h3 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {totalAreaInSotka.toLocaleString()} соток
              </h3>
            </div>
          </div>
          <div className="absolute bottom-0 right-0 -mb-3 opacity-10">
            <ArrowsPointingOutIcon className="h-16 sm:h-20 w-16 sm:w-20 text-purple-600" />
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-6 border border-gray-100 dark:border-gray-700">
        <div className="space-y-4">
          <SearchAndFilters
            defaultSortBy={defaultSortBy}
            defaultSortOrder={defaultSortOrder}
          />

          <AdminPlotGrid plots={plots} />

          {/* Пагинация */}
          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between">
              <div className="flex-1 flex justify-between sm:hidden">
                {currentPage > 1 && (
                  <Link
                    href={{
                      pathname: '/admin/plots',
                      query: {
                        ...searchParamsObj,
                        page: currentPage - 1,
                      },
                    }}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    Назад
                  </Link>
                )}
                {currentPage < totalPages && (
                  <Link
                    href={{
                      pathname: '/admin/plots',
                      query: {
                        ...searchParamsObj,
                        page: currentPage + 1,
                      },
                    }}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    Вперед
                  </Link>
                )}
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    Показано <span className="font-medium">{Math.min((currentPage - 1) * 10 + 1, totalItems)}</span> - <span className="font-medium">{Math.min(currentPage * 10, totalItems)}</span> из <span className="font-medium">{totalItems}</span> участков
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    {currentPage > 1 && (
                      <Link
                        href={{
                          pathname: '/admin/plots',
                          query: {
                            ...searchParamsObj,
                            page: currentPage - 1,
                          },
                        }}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        <span className="sr-only">Предыдущая</span>
                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </Link>
                    )}
                    
                    {/* Генерируем страницы с лимитом отображения */}
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const pageNum = currentPage <= 3
                        ? i + 1 
                        : currentPage + i - 2
                      
                      if (pageNum <= 0 || pageNum > totalPages) return null
                      
                      return (
                        <Link
                          key={pageNum}
                          href={{
                            pathname: '/admin/plots',
                            query: {
                              ...searchParamsObj,
                              page: pageNum,
                            },
                          }}
                          aria-current={pageNum === currentPage ? 'page' : undefined}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium
                            ${pageNum === currentPage 
                              ? 'z-10 bg-blue-50 dark:bg-blue-900/30 border-blue-500 dark:border-blue-600 text-blue-600 dark:text-blue-400' 
                              : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                            }`}
                        >
                          {pageNum}
                        </Link>
                      )
                    })}
                    
                    {currentPage < totalPages && (
                      <Link
                        href={{
                          pathname: '/admin/plots',
                          query: {
                            ...searchParamsObj,
                            page: currentPage + 1,
                          },
                        }}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        <span className="sr-only">Следующая</span>
                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                      </Link>
                    )}
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Фиксированная панель с кнопками навигации */}
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4 z-10 flex justify-between items-center shadow-lg sm:hidden">
        <div className="flex items-center">
          <Link
            href="/admin"
            className="px-6 py-2.5 rounded-lg bg-gray-500 hover:bg-gray-600 text-white font-medium text-sm transition duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 inline-flex items-center"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Назад в админку
          </Link>
        </div>
        <div className="flex gap-4">
          <Link
            href="/admin/plots/export"
            className="px-6 py-2.5 rounded-lg bg-green-600 hover:bg-green-700 text-white font-medium text-sm transition duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 inline-flex items-center"
          >
            <CloudArrowDownIcon className="h-4 w-4 mr-2" />
            Экспорт
          </Link>
          <Link
            href="/admin/plots/new"
            className="px-6 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm transition duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 inline-flex items-center"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Добавить участок
          </Link>
        </div>
      </div>
    </div>
  )
} 