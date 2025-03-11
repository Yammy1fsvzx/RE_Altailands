'use client'

import { useState } from 'react'
import { PlotCommunication, PlotFeature } from '@prisma/client'
import { PlusIcon, XMarkIcon } from '@heroicons/react/24/outline'

type PlotCommunicationType = {
  name: string
}

type PlotFeatureType = {
  name: string
}

interface FormData {
  landUseType: string
  landCategory: string
  communications: PlotCommunicationType[]
  features: PlotFeatureType[]
}

interface Props {
  plot?: {
    landUseType: string
    landCategory: string
    communications: PlotCommunicationType[]
    features: PlotFeatureType[]
  }
  onChange: (data: FormData) => void
}

const LAND_USE_TYPES = ['ИЖС', 'ЛПХ', 'СНТ']
const LAND_CATEGORIES = [
  'Земли населенных пунктов',
  'Земли сельскохозяйственного назначения'
]

export default function PlotFeaturesForm({ plot, onChange }: Props) {
  const [landUseType, setLandUseType] = useState(plot?.landUseType || '')
  const [landCategory, setLandCategory] = useState(plot?.landCategory || '')
  const [isCustomLandUseType, setIsCustomLandUseType] = useState(!LAND_USE_TYPES.includes(plot?.landUseType || ''))
  const [isCustomLandCategory, setIsCustomLandCategory] = useState(!LAND_CATEGORIES.includes(plot?.landCategory || ''))
  const [customLandUseType, setCustomLandUseType] = useState(isCustomLandUseType ? plot?.landUseType || '' : '')
  const [customLandCategory, setCustomLandCategory] = useState(isCustomLandCategory ? plot?.landCategory || '' : '')
  const [communications, setCommunications] = useState<PlotCommunicationType[]>(
    plot?.communications || []
  )
  const [features, setFeatures] = useState<PlotFeatureType[]>(
    plot?.features || []
  )
  const [newCommunicationName, setNewCommunicationName] = useState('')
  const [newFeatureName, setNewFeatureName] = useState('')

  const handleRemoveCommunication = (index: number) => {
    const newCommunications = [...communications]
    newCommunications.splice(index, 1)
    setCommunications(newCommunications)
    onChange({
      landUseType,
      landCategory,
      communications: newCommunications,
      features
    })
  }

  const handleRemoveFeature = (index: number) => {
    const newFeatures = [...features]
    newFeatures.splice(index, 1)
    setFeatures(newFeatures)
    onChange({
      landUseType,
      landCategory,
      communications,
      features: newFeatures
    })
  }

  const handleAddCommunication = () => {
    if (!newCommunicationName.trim()) return

    const newCommunication: PlotCommunicationType = {
      name: newCommunicationName
    }

    const newCommunications = [...communications, newCommunication]
    setCommunications(newCommunications)
    setNewCommunicationName('')
    onChange({
      landUseType,
      landCategory,
      communications: newCommunications,
      features
    })
  }

  const handleAddFeature = () => {
    if (!newFeatureName.trim()) return

    const newFeature: PlotFeatureType = {
      name: newFeatureName
    }

    const newFeatures = [...features, newFeature]
    setFeatures(newFeatures)
    setNewFeatureName('')
    onChange({
      landUseType,
      landCategory,
      communications,
      features: newFeatures
    })
  }

  const handleLandUseTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value
    if (value === 'custom') {
      setIsCustomLandUseType(true)
      setCustomLandUseType('')
    } else {
      setIsCustomLandUseType(false)
      setLandUseType(value)
      onChange({
        landUseType: value,
        landCategory,
        communications,
        features
      })
    }
  }

  const handleCustomLandUseTypeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setCustomLandUseType(value)
    setLandUseType(value)
    onChange({
      landUseType: value,
      landCategory,
      communications,
      features
    })
  }

  const handleLandCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value
    if (value === 'custom') {
      setIsCustomLandCategory(true)
      setCustomLandCategory('')
    } else {
      setIsCustomLandCategory(false)
      setLandCategory(value)
      onChange({
        landUseType,
        landCategory: value,
        communications,
        features
      })
    }
  }

  const handleCustomLandCategoryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setCustomLandCategory(value)
    setLandCategory(value)
    onChange({
      landUseType,
      landCategory: value,
      communications,
      features
    })
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col justify-between">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Вид разрешенного использования
          </label>
          {isCustomLandUseType ? (
            <div className="mt-1">
              <input
                type="text"
                value={customLandUseType}
                onChange={handleCustomLandUseTypeChange}
                className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white p-2"
                placeholder="Введите значение"
              />
            </div>
          ) : (
            <select
              value={landUseType}
              onChange={handleLandUseTypeChange}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white p-2"
            >
              <option value="">Выберите значение</option>
              {LAND_USE_TYPES.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
              <option value="custom">Другое...</option>
            </select>
          )}
        </div>

        <div className="flex flex-col justify-between">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Категория земель
          </label>
          {isCustomLandCategory ? (
            <div className="mt-1">
              <input
                type="text"
                value={customLandCategory}
                onChange={handleCustomLandCategoryChange}
                className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white p-2"
                placeholder="Введите значение"
              />
            </div>
          ) : (
            <select
              value={landCategory}
              onChange={handleLandCategoryChange}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white p-2"
            >
              <option value="">Выберите значение</option>
              {LAND_CATEGORIES.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
              <option value="custom">Другое...</option>
            </select>
          )}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Коммуникации
        </h3>
        <div className="space-y-4">
          {communications.map((comm, index) => (
            <div key={index} className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg items-center">
              <div className="flex-1">
                <input
                  type="text"
                  value={comm.name}
                  readOnly
                  className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white p-2"
                />
              </div>
              <button
                type="button"
                onClick={() => handleRemoveCommunication(index)}
                className="inline-flex items-center rounded-full border border-transparent p-1 text-gray-600 dark:text-gray-400 shadow-sm hover:bg-gray-100 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
          ))}

          <div className="flex gap-2">
            <input
              type="text"
              value={newCommunicationName}
              onChange={(e) => setNewCommunicationName(e.target.value)}
              placeholder="Название коммуникации"
              className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white p-2"
            />
            <button
              type="button"
              onClick={handleAddCommunication}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <PlusIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Особенности
        </h3>
        <div className="space-y-4">
          {features.map((feature, index) => (
            <div key={index} className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex-1">
                <input
                  type="text"
                  value={feature.name}
                  readOnly
                  className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white p-2"
                />
              </div>
              <button
                type="button"
                onClick={() => handleRemoveFeature(index)}
                className="inline-flex items-center rounded-full border border-transparent p-1 text-gray-600 dark:text-gray-400 shadow-sm hover:bg-gray-100 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
          ))}

          <div className="flex gap-2">
            <input
              type="text"
              value={newFeatureName}
              onChange={(e) => setNewFeatureName(e.target.value)}
              placeholder="Название особенности"
              className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white p-2"
            />
            <button
              type="button"
              onClick={handleAddFeature}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <PlusIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
} 