'use client'

import { useEffect, useState } from 'react'
import { Line } from 'react-chartjs-2'
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
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Загрузка...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-red-600">{error}</div>
      </div>
    )
  }

  if (!visitsData?.dailyVisits) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Нет данных для отображения</div>
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
      format(item.date, 'd MMMM', { locale: ru })
    ),
    datasets: [
      {
        label: 'Уникальные посетители',
        data: chartData.map(item => item.count),
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.1)',
        tension: 0.1,
        fill: true,
      },
    ],
  }

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Уникальные посетители за текущий месяц',
      },
      tooltip: {
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
          precision: 0
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
          maxTicksLimit: 31
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

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold text-white">Панель управления</h1>

      {/* Основные показатели */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-white">Посещения</h3>
          <div className="mt-2">
            <p className="text-3xl font-semibold text-gray-300">{visitsData?.visitsToday || 0}</p>
            <p className="text-sm text-gray-500">Сегодня</p>
          </div>
          <div className="mt-2">
            <p className="text-xl font-medium text-gray-300">{visitsData?.totalVisits || 0}</p>
            <p className="text-sm text-gray-500">Всего</p>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-white">Заявки</h3>
          <div className="mt-2">
            <p className="text-3xl font-semibold text-gray-300">{stats?.applications.total || 0}</p>
            <p className="text-sm text-gray-500">Всего заявок</p>
          </div>
          <div className="mt-2 space-y-1">
            {stats?.applications.byStatus.map(status => (
              <div key={status.status} className="flex justify-between">
                <span className="text-sm text-gray-300">{getStatusText(status.status)}</span>
                <span className="text-sm font-medium text-gray-300">{status._count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-white">Участки</h3>
          <div className="mt-2">
            <p className="text-3xl font-semibold text-gray-300">{stats?.plots.total || 0}</p>
            <p className="text-sm text-gray-500">Всего участков</p>
          </div>
          <div className="mt-2 space-y-1">
            {stats?.plots.byStatus.map(status => (
              <div key={status.status} className="flex justify-between">
                <span className="text-sm text-gray-300">{getStatusText(status.status)}</span>
                <span className="text-sm font-medium text-gray-300">{status._count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-white">Квизы</h3>
          <div className="mt-2">
            <p className="text-3xl font-semibold text-gray-300">{stats?.quizzes.total || 0}</p>
            <p className="text-sm text-gray-500">Всего квизов</p>
          </div>
          <div className="mt-2">
            <p className="text-xl font-medium text-gray-300">{stats?.quizzes.active || 0}</p>
            <p className="text-sm text-gray-500">Активных</p>
          </div>
        </div>
      </div>

      {/* График посещений */}
      <div className="bg-gray-800 rounded-lg shadow p-6">
        <div style={{ height: '400px' }}>
          <Line data={visitChartData} options={chartOptions} />
        </div>
      </div>

      {/* Популярные страницы */}
      <div className="bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-white mb-4">Популярные страницы</h3>
        <div className="space-y-2">
          {visitsData?.topPages.map((page, index) => (
            <div key={page.path} className="flex justify-between items-center">
              <span className="text-sm text-gray-300 truncate flex-1">{page.path}</span>
              <span className="text-sm font-medium ml-4 text-white">{page.count} просмотров</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
} 