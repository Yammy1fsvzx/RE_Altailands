'use client'

import { useTransition } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { EyeIcon, EyeSlashIcon, PencilSquareIcon, TrashIcon, PhotoIcon } from '@heroicons/react/24/outline'
import { PlotStatus } from '@prisma/client'
import { PlotTableItem } from '@/types/plot'
import { togglePlotVisibility, deletePlot } from '@/lib/actions'

const statusColors: Record<PlotStatus, string> = {
  AVAILABLE: 'bg-green-100 text-green-800',
  RESERVED: 'bg-yellow-100 text-yellow-800',
  SOLD: 'bg-red-100 text-red-800',
} as const

const statusLabels: Record<PlotStatus, string> = {
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
    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4 transition-opacity duration-200 ${isPending ? 'opacity-50' : 'opacity-100'}`}>
      {plots.map((plot) => (
        <div key={plot.id} className="group bg-white dark:bg-gray-900 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden">
          <div className="relative aspect-[4/3] bg-gray-700">
            {plot.media && plot.media[0] ? (
              <Image
                src={plot.media[0].url}
                alt={plot.title}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <PhotoIcon className="w-12 h-12 text-gray-400 dark:text-gray-600" />
              </div>
            )}
          </div>
          
          <div className="p-3 sm:p-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-medium text-sm sm:text-base line-clamp-1 text-gray-900 dark:text-white">{plot.title}</h3>
                {plot.cadastralNumber && (
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                    Кад. номер: {plot.cadastralNumber}
                  </p>
                )}
              </div>
              <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${statusColors[plot.status]}`}>
                {statusLabels[plot.status]}
              </span>
            </div>

            <div className="mt-2 space-y-1">
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                Площадь: {plot.area} м²
              </p>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                Цена: {plot.price.toLocaleString()} ₽
              </p>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                За м²: {plot.pricePerMeter.toLocaleString()} ₽
              </p>
            </div>

            <div className="mt-3 flex items-center justify-end gap-2">
              <button
                onClick={() => handleToggleVisibility(plot.id, plot.isVisible)}
                disabled={isPending}
                className="p-1 text-gray-500 hover:text-gray-700 transition-colors"
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
                className="p-1 text-gray-500 hover:text-gray-700 transition-colors"
                title="Редактировать"
              >
                <PencilSquareIcon className="w-5 h-5" />
              </Link>
              <button
                onClick={() => handleDelete(plot.id)}
                disabled={isPending}
                className="p-1 text-gray-500 hover:text-red-600 transition-colors"
                title="Удалить"
              >
                <TrashIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
} 