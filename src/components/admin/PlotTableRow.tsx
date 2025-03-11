'use client'

import {
  EyeIcon,
  EyeSlashIcon,
  PencilSquareIcon,
  TrashIcon,
} from '@heroicons/react/24/outline'
import Link from 'next/link'
import { PlotTableItem } from '@/types/plot'
import { formatPrice, formatArea } from '@/lib/format'

interface PlotTableRowProps {
  plot: PlotTableItem
  onToggleVisibility: (id: string) => void
  onDelete: (id: string) => void
}

export default function PlotTableRow({
  plot,
  onToggleVisibility,
  onDelete,
}: PlotTableRowProps) {
  const statusMap = {
    AVAILABLE: { text: 'Доступен', class: 'text-green-600' },
    RESERVED: { text: 'Забронирован', class: 'text-yellow-600' },
    SOLD: { text: 'Продан', class: 'text-red-600' },
  }
  const status = statusMap[plot.status]

  return (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap">
        <div>
          <Link
            href={`/admin/plots/${plot.id}`}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            {plot.title}
          </Link>
          <div className="text-sm text-gray-500">
            {plot.cadastralNumber || 'Нет кадастрового номера'}
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div>
          <div className="font-medium">{formatPrice(plot.price)}</div>
          <div className="text-sm text-gray-500">
            {formatPrice(plot.pricePerMeter)}/сот.
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">{formatArea(plot.area)}</td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`font-medium ${status.class}`}>{status.text}</span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center gap-2">
          <Link
            href={`/admin/plots/${plot.id}/edit`}
            className="p-2 text-gray-600 hover:text-blue-600 rounded-lg hover:bg-gray-100"
          >
            <PencilSquareIcon className="w-5 h-5" />
          </Link>
          <button
            type="button"
            onClick={() => onToggleVisibility(plot.id)}
            className="p-2 text-gray-600 hover:text-blue-600 rounded-lg hover:bg-gray-100"
          >
            {plot.isVisible ? (
              <EyeIcon className="w-5 h-5" />
            ) : (
              <EyeSlashIcon className="w-5 h-5" />
            )}
          </button>
          <button
            type="button"
            onClick={() => onDelete(plot.id)}
            className="p-2 text-gray-600 hover:text-red-600 rounded-lg hover:bg-gray-100"
          >
            <TrashIcon className="w-5 h-5" />
          </button>
        </div>
      </td>
    </tr>
  )
} 