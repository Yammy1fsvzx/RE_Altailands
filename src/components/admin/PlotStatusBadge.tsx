import { PlotStatus } from '@/types/plot'

const statusConfig: Record<PlotStatus, { label: string; className: string }> = {
  AVAILABLE: {
    label: 'Доступен',
    className: 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200',
  },
  RESERVED: {
    label: 'Забронирован',
    className: 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-200',
  },
  SOLD: {
    label: 'Продан',
    className: 'bg-gray-100 dark:bg-gray-900/50 text-gray-800 dark:text-gray-200',
  },
}

export default function PlotStatusBadge({ status }: { status: PlotStatus }) {
  const config = statusConfig[status]

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.className}`}>
      {config.label}
    </span>
  )
} 