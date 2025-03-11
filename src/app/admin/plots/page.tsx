import prisma from '@/lib/prisma'
import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { PlotStatus, Prisma } from '@prisma/client'
import { formatArea } from '@/lib/format'
import AdminPlotGrid from '@/components/admin/AdminPlotGrid'
import SearchAndFilters from '@/components/admin/SearchAndFilters'
import { PlotTableItem } from '@/types/plot'

export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'
export const revalidate = 0

export const metadata: Metadata = {
  title: 'Управление участками | Админ-панель',
}

type SearchParamsProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

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
    <div className="space-y-4 sm:space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-2 sm:gap-4">
        <div className="dark:bg-gray-800 shadow rounded-lg rounded-lg shadow-sm p-3 sm:p-6">
          <div className="text-xs sm:text-sm font-medium text-white">Всего участков</div>
          <div className="text-lg sm:text-2xl font-semibold mt-1 sm:mt-2 text-white">{stats.total}</div>
        </div>
        <div className="dark:bg-gray-800 shadow rounded-lg shadow-sm p-3 sm:p-6">
          <div className="text-xs sm:text-sm font-medium text-white">Доступно</div>
          <div className="text-lg sm:text-2xl font-semibold mt-1 sm:mt-2 text-green-600">
            {stats.available}
          </div>
        </div>
        <div className="dark:bg-gray-800 shadow rounded-lg shadow-sm p-3 sm:p-6">
          <div className="text-xs sm:text-sm font-medium text-white">Забронировано</div>
          <div className="text-lg sm:text-2xl font-semibold mt-1 sm:mt-2 text-yellow-600">
            {stats.reserved}
          </div>
        </div>
        <div className="dark:bg-gray-800 shadow rounded-lg shadow-sm p-3 sm:p-6">
          <div className="text-xs sm:text-sm font-medium text-white">Продано</div>
          <div className="text-lg sm:text-2xl font-semibold mt-1 sm:mt-2 text-red-600">
            {stats.sold}
          </div>
        </div>
        <div className="col-span-2 sm:col-span-2 lg:col-span-1 dark:bg-gray-800 shadow rounded-lg shadow-sm p-3 sm:p-6">
          <div className="text-xs sm:text-sm font-medium text-white">
            Общая площадь (доступно)
          </div>
          <div className="text-lg sm:text-2xl font-semibold mt-1 sm:mt-2 text-white">
            {formatArea(stats.totalArea)}
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow rounded-lg rounded-lg shadow-sm p-3 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-0 mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-2xl font-semibold text-white">Управление участками</h1>
          <Link
            href="/admin/plots/new"
            className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white text-center rounded-lg hover:bg-blue-700 transition-colors"
          >
            + Добавить участок
          </Link>
        </div>

        <div className="space-y-4">
          <SearchAndFilters
            defaultSortBy={defaultSortBy}
            defaultSortOrder={defaultSortOrder}
          />

          <AdminPlotGrid plots={plots} />

          {totalPages > 1 && (
            <div className="mt-4 flex justify-center">
              {/* Здесь можно добавить пагинацию */}
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 