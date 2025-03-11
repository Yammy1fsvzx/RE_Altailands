'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import { useCallback, useState } from 'react'
import debounce from 'lodash/debounce'

type SearchInputProps = {
  defaultValue?: string
}

export default function SearchInput({ defaultValue = '' }: SearchInputProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [value, setValue] = useState(defaultValue)

  const debouncedSearch = useCallback(
    debounce((searchValue: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (searchValue) {
        params.set('search', searchValue)
      } else {
        params.delete('search')
      }
      router.push(`/admin/plots?${params.toString()}`)
    }, 300),
    [searchParams, router]
  )

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setValue(newValue)
    debouncedSearch(newValue)
  }

  return (
    <div className="relative">
      <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
      <input
        type="text"
        name="search"
        value={value}
        placeholder="Поиск по названию, описанию или местоположению..."
        onChange={handleSearch}
        className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-800 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
      />
    </div>
  )
} 