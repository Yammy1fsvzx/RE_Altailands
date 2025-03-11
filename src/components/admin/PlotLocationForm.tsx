'use client'

import { useState } from 'react'
import { Plot, PlotCadastral } from '@prisma/client'
import { PlusIcon, XMarkIcon } from '@heroicons/react/24/outline'

type PlotLocationFormProps = {
  plot?: Plot & {
    cadastralNumbers: PlotCadastral[]
  } | null
  onChange: (data: {
    region: string
    locality: string
    cadastralNumbers: (Omit<PlotCadastral, 'id' | 'createdAt' | 'updatedAt' | 'plotId'> | PlotCadastral)[]
  }) => void
}

export default function PlotLocationForm({ plot, onChange }: PlotLocationFormProps) {
  const [region, setRegion] = useState(plot?.region || '')
  const [locality, setLocality] = useState(plot?.locality || '')
  const [cadastralNumbers, setCadastralNumbers] = useState<(Omit<PlotCadastral, 'id' | 'createdAt' | 'updatedAt' | 'plotId'> | PlotCadastral)[]>(
    plot?.cadastralNumbers || []
  )
  const [newCadastralNumber, setNewCadastralNumber] = useState('')

  const handleChange = () => {
    onChange({
      region,
      locality,
      cadastralNumbers
    })
  }

  const addCadastralNumber = () => {
    if (newCadastralNumber.trim()) {
      const newNumbers = [...cadastralNumbers, { number: newCadastralNumber.trim() }]
      setCadastralNumbers(newNumbers)
      setNewCadastralNumber('')
      onChange({
        region,
        locality,
        cadastralNumbers: newNumbers
      })
    }
  }

  const removeCadastralNumber = (index: number) => {
    const newNumbers = cadastralNumbers.filter((_, i) => i !== index)
    setCadastralNumbers(newNumbers)
    onChange({
      region,
      locality,
      cadastralNumbers: newNumbers
    })
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="col-span-1">
          <label htmlFor="region" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
            Регион
          </label>
          <input
            type="text"
            id="region"
            value={region}
            onChange={(e) => {
              setRegion(e.target.value)
              handleChange()
            }}
            className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white p-2"
          />
        </div>

        <div className="col-span-1">
          <label htmlFor="locality" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
            Населенный пункт
          </label>
          <input
            type="text"
            id="locality"
            value={locality}
            onChange={(e) => {
              setLocality(e.target.value)
              handleChange()
            }}
            className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white p-2"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-4">
          Кадастровые номера
        </label>

        <div className="flex gap-4">
          <input
            type="text"
            value={newCadastralNumber}
            onChange={(e) => setNewCadastralNumber(e.target.value)}
            placeholder="Кадастровый номер"
            className="flex-1 rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white sm:text-sm p-2"
          />
          <button
            type="button"
            onClick={addCadastralNumber}
            disabled={!newCadastralNumber.trim()}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Добавить
          </button>
        </div>

        {cadastralNumbers.length > 0 && (
          <ul className="mt-4 divide-y divide-gray-200 dark:divide-gray-700">
            {cadastralNumbers.map((cadastral, index) => (
              <li key={index} className="py-3 flex justify-between items-center">
                <span className="text-sm text-gray-900 dark:text-gray-100 ">
                  {cadastral.number}
                </span>
                <button
                  type="button"
                  onClick={() => removeCadastralNumber(index)}
                  className="ml-4 p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:bg-gray-100 dark:focus:bg-gray-800"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
} 