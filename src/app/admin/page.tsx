'use client'

import { useEffect, useState } from 'react'
import { Line } from 'react-chartjs-2'
import Link from 'next/link'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { format, parseISO, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns'
import { ru } from 'date-fns/locale'
import { 
  UserGroupIcon, 
  DocumentTextIcon, 
  MapIcon, 
  ClipboardDocumentIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

type Stats = {
  applications: {
    total: number
    byStatus: Array<{ status: string; _count: number }>
  }
  plots: {
    total: number
    byStatus: Array<{ status: string; _count: number }>
  }
  quizzes: {
    total: number
    active: number
  }
  visits: {
    total: number
    today: number
  }
}

type VisitsData = {
  totalVisits: number
  visitsToday: number
  dailyVisits: Array<{ createdAt: string; _count: number }>
  topPages: Array<{ path: string; count: number }>
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [visitsData, setVisitsData] = useState<VisitsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsResponse, visitsResponse] = await Promise.all([
          fetch('/api/analytics/stats'),
          fetch('/api/analytics/visits')
        ])

        if (!statsResponse.ok || !visitsResponse.ok) {
          throw new Error('Ошибка при загрузке данных')
        }

        const [statsData, visitsData] = await Promise.all([
          statsResponse.json(),
          visitsResponse.json()
        ])

        setStats(statsData)
        setVisitsData(visitsData)
      } catch (error) {
        console.error('Error fetching data:', error)
        setError('Ошибка при загрузке данных')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-500 dark:text-gray-400">Загрузка данных...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center max-w-md">
          <div className="flex justify-center mb-4">
            <svg className="w-12 h-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-red-800 dark:text-red-200 mb-2">Произошла ошибка</h3>
          <p className="text-sm text-red-600 dark:text-red-300">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Обновить страницу
          </button>
        </div>
      </div>
    )
  }

  if (!stats || !visitsData?.dailyVisits) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="mb-4">
            <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">Нет данных для отображения</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Информация о статистике сайта будет доступна позже</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Обновить данные
          </button>
        </div>
      </div>
    )
  }

  // Получаем все дни текущего месяца
  const now = new Date()
  const monthStart = startOfMonth(now)
  const monthEnd = endOfMonth(now)
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd })

  // Создаем мапу посещений по датам
  const visitsMap = new Map()
  visitsData.dailyVisits.forEach(visit => {
    if (visit.createdAt) {
      const dateKey = visit.createdAt // Дата уже в нужном формате из БД
      visitsMap.set(dateKey, visit._count)
    }
  })

  // Создаем массив данных для всех дней месяца
  const chartData = daysInMonth.map(date => {
    const dateKey = format(date, 'yyyy-MM-dd')
    return {
      date,
      count: visitsMap.get(dateKey) || 0
    }
  })

  const visitChartData = {
    labels: chartData.map(item => 
      format(item.date, 'd MMM', { locale: ru })
    ),
    datasets: [
      {
        label: 'Уникальные посетители',
        data: chartData.map(item => item.count),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.3,
        fill: true,
        pointBackgroundColor: 'rgb(59, 130, 246)',
        pointBorderColor: '#fff',
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  }

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          font: {
            size: 12,
          },
          boxWidth: 16,
          usePointStyle: true,
        }
      },
      title: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(17, 24, 39, 0.9)',
        padding: 12,
        titleFont: {
          size: 14,
          weight: 'bold' as const,
        },
        bodyFont: {
          size: 13,
        },
        cornerRadius: 6,
        callbacks: {
          label: function(context: any) {
            const value = context.raw || 0
            return `${value} уникальных посетителей`
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
          precision: 0,
        },
        grid: {
          color: 'rgba(156, 163, 175, 0.1)',
        }
      },
      x: {
        grid: {
          display: false
        },
        ticks: {
          maxRotation: 45,
          minRotation: 45,
          autoSkip: true,
          maxTicksLimit: 15
        }
      }
    },
    maintainAspectRatio: false,
    height: 400
  }

  const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      'NEW': 'Новая',
      'IN_PROGRESS': 'В работе',
      'COMPLETED': 'Завершена',
      'REJECTED': 'Отклонена',
      'AVAILABLE': 'Доступен',
      'RESERVED': 'Забронирован',
      'SOLD': 'Продан'
    }
    return statusMap[status] || status
  }

  const getStatusColor = (status: string) => {
    const colorMap: Record<string, string> = {
      'NEW': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300',
      'IN_PROGRESS': 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
      'COMPLETED': 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
      'REJECTED': 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
      'AVAILABLE': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300',
      'RESERVED': 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
      'SOLD': 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300'
    }
    return colorMap[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Панель управления
        </h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Общая статистика и аналитика вашего сайта
        </p>
      </div>

      {/* Основные показатели */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700 relative overflow-hidden">
          <div className="flex items-center">
            <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-lg mr-4">
              <UserGroupIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Посещения сегодня</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{visitsData?.visitsToday || 0}</h3>
            </div>
          </div>
          <div className="mt-4 flex justify-between items-center">
            <div className="flex items-center">
              <p className="text-xs text-gray-500 dark:text-gray-400">Всего: <span className="font-medium text-gray-700 dark:text-gray-300">{visitsData?.totalVisits || 0}</span></p>
            </div>
            <Link href="/admin/analytics" className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline">
              Подробнее
            </Link>
          </div>
          <div className="absolute bottom-0 right-0 -mb-3 opacity-10">
            <UserGroupIcon className="h-20 w-20 text-blue-600" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700 relative overflow-hidden">
          <div className="flex items-center">
            <div className="bg-indigo-100 dark:bg-indigo-900/30 p-3 rounded-lg mr-4">
              <ClipboardDocumentIcon className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Заявки</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats?.applications.total || 0}</h3>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {stats?.applications.byStatus.slice(0, 2).map(status => (
              <span 
                key={status.status} 
                className={`text-xs px-2 py-1 rounded-full ${getStatusColor(status.status)}`}
              >
                {getStatusText(status.status)}: {status._count}
              </span>
            ))}
          </div>
          <div className="mt-2 flex justify-end">
            <Link href="/admin/applications" className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline">
              Просмотр заявок
            </Link>
          </div>
          <div className="absolute bottom-0 right-0 -mb-3 opacity-10">
            <ClipboardDocumentIcon className="h-20 w-20 text-indigo-600" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700 relative overflow-hidden">
          <div className="flex items-center">
            <div className="bg-emerald-100 dark:bg-emerald-900/30 p-3 rounded-lg mr-4">
              <MapIcon className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Участки</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats?.plots.total || 0}</h3>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {stats?.plots.byStatus.slice(0, 2).map(status => (
              <span 
                key={status.status} 
                className={`text-xs px-2 py-1 rounded-full ${getStatusColor(status.status)}`}
              >
                {getStatusText(status.status)}: {status._count}
              </span>
            ))}
          </div>
          <div className="mt-2 flex justify-end">
            <Link href="/admin/plots" className="text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:underline">
              Управление участками
            </Link>
          </div>
          <div className="absolute bottom-0 right-0 -mb-3 opacity-10">
            <MapIcon className="h-20 w-20 text-emerald-600" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700 relative overflow-hidden">
          <div className="flex items-center">
            <div className="bg-amber-100 dark:bg-amber-900/30 p-3 rounded-lg mr-4">
              <DocumentTextIcon className="h-6 w-6 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Квизы</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats?.quizzes.total || 0}</h3>
            </div>
          </div>
          <div className="mt-4 flex justify-between items-center">
            <div className="flex items-center">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Активных: <span className={`font-medium ${stats?.quizzes.active ? 'text-green-600 dark:text-green-400' : 'text-gray-700 dark:text-gray-300'}`}>
                  {stats?.quizzes.active || 0}
                </span>
              </p>
            </div>
            <Link href="/admin/quizzes" className="text-xs font-medium text-amber-600 dark:text-amber-400 hover:underline">
              Управление квизами
            </Link>
          </div>
          <div className="absolute bottom-0 right-0 -mb-3 opacity-10">
            <DocumentTextIcon className="h-20 w-20 text-amber-600" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* График посещений */}
        <div className="lg:col-span-8 bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
          <div className="mb-4">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">Посещения сайта</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Уникальные посетители за текущий месяц</p>
          </div>
          <div className="h-80">
            <Line data={visitChartData} options={chartOptions} />
          </div>
        </div>

        {/* Популярные страницы и разделы */}
        <div className="lg:col-span-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
          <div className="mb-4">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">Популярные страницы</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Наиболее посещаемые разделы</p>
          </div>
          <div className="space-y-3">
            {visitsData?.topPages?.slice(0, 7).map((page, index) => (
              <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
                <div className="flex items-center">
                  <span className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-medium mr-3 
                    ${index < 3 ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-400' : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400'}`}>
                    {index + 1}
                  </span>
                  <span className="text-sm text-gray-800 dark:text-gray-300 truncate max-w-[140px] sm:max-w-[200px]">
                    {page.path === '/' ? 'Главная' : page.path}
                  </span>
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-400">
                  {page.count}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
} 