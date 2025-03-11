'use client'

import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'

interface SearchAndFiltersProps {
  defaultSortBy?: string
  defaultSortOrder?: 'asc' | 'desc'
}

export default function SearchAndFilters({
  defaultSortBy = 'createdAt',
  defaultSortOrder = 'desc',
}: SearchAndFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [search, setSearch] = useState(searchParams.get('search') || '')
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || defaultSortBy)
  const [sortOrder, setSortOrder] = useState(
    (searchParams.get('sortOrder') as 'asc' | 'desc') || defaultSortOrder
  )
  const [status, setStatus] = useState(searchParams.get('status') || '')

  const createQueryString = useCallback(
    (params: Record<string, string>) => {
      const newSearchParams = new URLSearchParams(searchParams.toString())
      Object.entries(params).forEach(([key, value]) => {
        if (value) {
          newSearchParams.set(key, value)
        } else {
          newSearchParams.delete(key)
        }
      })
      return newSearchParams.toString()
    },
    [searchParams]
  )

  useEffect(() => {
    const handler = setTimeout(() => {
      const query = createQueryString({ search, sortBy, sortOrder, status })
      router.push(`?${query}`)
    }, 300)

    return () => clearTimeout(handler)
  }, [search, sortBy, sortOrder, status, createQueryString, router])

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
      <div className="relative flex-1 min-w-[240px]">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Поиск по названию, кадастровому номеру..."
          className="w-full sm:w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
        />
        <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
        >
          <option value="">Все статусы</option>
          <option value="AVAILABLE">Доступен</option>
          <option value="RESERVED">Забронирован</option>
          <option value="SOLD">Продан</option>
        </select>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
        >
          <option value="createdAt">По дате создания</option>
          <option value="price">По цене</option>
          <option value="area">По площади</option>
          <option value="title">По названию</option>
        </select>

        <select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
        >
          <option value="desc">По убыванию</option>
          <option value="asc">По возрастанию</option>
        </select>
      </div>
    </div>
  )
} 