'use client'

import { useTransition } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { EyeIcon, EyeSlashIcon, PencilSquareIcon, TrashIcon, PhotoIcon } from '@heroicons/react/24/outline'
import { PlotStatus } from '@/types'
import { PlotTableItem } from '@/types/plot'
import { togglePlotVisibility, deletePlot } from '@/lib/actions'
import { squareMetersToSotka, pricePerMeterToPricePerSotka, formatSotka } from '@/utils/unitConversion'

const statusColors: Record<string, string> = {
  AVAILABLE: 'bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-400 border border-green-200 dark:border-green-800',
  RESERVED: 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800',
  SOLD: 'bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-400 border border-red-200 dark:border-red-800',
} as const

const statusLabels: Record<string, string> = {
  AVAILABLE: 'Доступен',
  RESERVED: 'Бронь',
  SOLD: 'Продан',
} as const

interface AdminPlotGridProps {
  plots: PlotTableItem[]
}

export default function AdminPlotGrid({ plots }: AdminPlotGridProps) {
  const [isPending, startTransition] = useTransition()

  const handleToggleVisibility = (id: string, currentState: boolean) => {
    startTransition(() => togglePlotVisibility(id, !currentState))
  }

  const handleDelete = (id: string) => {
    if (window.confirm('Вы уверены, что хотите удалить этот участок?')) {
      startTransition(() => deletePlot(id))
    }
  }

  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 transition-opacity duration-200 ${isPending ? 'opacity-50' : 'opacity-100'}`}>
      {plots.map((plot) => (
        <div key={plot.id} className="group flex flex-col h-full bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden border border-gray-100 dark:border-gray-700 transform hover:-translate-y-1">
          <div className="relative aspect-[4/3] bg-gray-200 dark:bg-gray-700 w-full">
            {plot.media && plot.media.length > 0 ? (
              <Image
                src={plot.media.sort((a, b) => a.order - b.order)[0].url}
                alt={plot.title}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <PhotoIcon className="w-10 h-10 text-gray-400 dark:text-gray-600" />
              </div>
            )}
            <div className="absolute top-2 right-2">
              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[plot.status]}`}>
                {statusLabels[plot.status]}
              </span>
            </div>
          </div>
          
          <div className="flex flex-col flex-grow p-4">
            <div className="flex items-start justify-between gap-2 mb-3">
              <h3 className="font-medium text-base line-clamp-1 text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {plot.title}
              </h3>
            </div>
            
            {plot.cadastralNumber && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                Кад. номер: {plot.cadastralNumber}
              </p>
            )}

            <div className="grid grid-cols-2 gap-2 mb-2">
              <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-2 h-full flex flex-col">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Площадь</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white mt-1">
                  {formatSotka(squareMetersToSotka(plot.area))} соток
                </p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-2 h-full flex flex-col">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Цена</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white mt-1">
                  {plot.price.toLocaleString()} ₽
                </p>
              </div>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-2 mb-3">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400">За сотку</p>
              <p className="text-sm font-semibold text-gray-900 dark:text-white mt-1">
                {pricePerMeterToPricePerSotka(plot.pricePerMeter).toLocaleString()} ₽
              </p>
            </div>

            <div className="mt-auto flex items-center justify-end gap-2 border-t border-gray-100 dark:border-gray-700 pt-3">
              <button
                onClick={() => handleToggleVisibility(plot.id, plot.isVisible)}
                disabled={isPending}
                className="p-2 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                title={plot.isVisible ? 'Скрыть' : 'Показать'}
              >
                {plot.isVisible ? (
                  <EyeIcon className="w-5 h-5" />
                ) : (
                  <EyeSlashIcon className="w-5 h-5" />
                )}
              </button>
              <Link
                href={`/admin/plots/edit/${plot.id}`}
                className="p-2 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                title="Редактировать"
              >
                <PencilSquareIcon className="w-5 h-5" />
              </Link>
              <button
                onClick={() => handleDelete(plot.id)}
                disabled={isPending}
                className="p-2 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                title="Удалить"
              >
                <TrashIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      ))}
      
      {plots.length === 0 && (
        <div className="col-span-full flex flex-col items-center justify-center py-12 px-4 bg-gray-50 dark:bg-gray-900/20 rounded-xl border border-gray-100 dark:border-gray-700">
          <PhotoIcon className="w-16 h-16 text-gray-400 dark:text-gray-600 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Нет участков</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 text-center">
            Участки не найдены. Попробуйте изменить параметры поиска или добавьте новый участок.
          </p>
          <Link
            href="/admin/plots/new"
            className="mt-4 px-4 py-2 bg-blue-600 text-white text-center rounded-lg hover:bg-blue-700 transition-colors"
          >
            + Добавить участок
          </Link>
        </div>
      )}
    </div>
  )
} 