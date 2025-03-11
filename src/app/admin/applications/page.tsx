import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { ru } from 'date-fns/locale'
import prisma from '@/lib/prisma'

interface Application {
  id: string
  type: 'QUIZ' | 'PLOT' | 'CONTACT'
  name: string
  email: string
  phone: string
  status: string
  createdAt: Date
  plot?: { id: string; title: string } | null
  quiz?: { id: string; title: string } | null
}

export default async function ApplicationsPage() {
  const applications = await prisma.application.findMany({
    include: {
      plot: true,
      quiz: true,
      comments: {
        include: {
          author: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  const getStatusBadgeClasses = (status: string) => {
    const baseClasses = 'px-2 inline-flex text-xs leading-5 font-semibold rounded-full'
    switch (status) {
      case 'NEW':
        return `${baseClasses} bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200`
      case 'IN_PROGRESS':
        return `${baseClasses} bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200`
      case 'COMPLETED':
        return `${baseClasses} bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200`
      case 'REJECTED':
        return `${baseClasses} bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200`
      default:
        return baseClasses
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'NEW':
        return 'Новая'
      case 'IN_PROGRESS':
        return 'В работе'
      case 'COMPLETED':
        return 'Завершена'
      case 'REJECTED':
        return 'Отклонена'
      default:
        return status
    }
  }

  const getTypeText = (type: string) => {
    switch (type) {
      case 'QUIZ':
        return 'Квиз'
      case 'PLOT':
        return 'Участок'
      case 'CONTACT':
        return 'Контакты'
      default:
        return type
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-xl md:text-2xl font-semibold text-gray-900 dark:text-white">
          Заявки
        </h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Управление заявками от пользователей
        </p>
      </div>

      {/* Мобильная версия - карточки */}
      <div className="block md:hidden space-y-4">
        {applications.map((application: Application) => (
          <div
            key={application.id}
            className="bg-white dark:bg-gray-800 shadow rounded-lg p-4 space-y-3"
          >
            <div className="flex justify-between items-start">
              <span className={getStatusBadgeClasses(application.status)}>
                {getStatusText(application.status)}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {formatDistanceToNow(new Date(application.createdAt), {
                  addSuffix: true,
                  locale: ru,
                })}
              </span>
            </div>
            
            <div>
              <div className="text-sm font-medium text-gray-900 dark:text-white">
                {application.name}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {getTypeText(application.type)}
              </div>
            </div>

            <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
              <div>{application.phone}</div>
              <div>{application.email}</div>
            </div>

            <div className="pt-2">
              <Link
                href={`/admin/applications/${application.id}`}
                className="text-sm text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
              >
                Просмотреть →
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Десктопная версия - таблица */}
      <div className="hidden md:block">
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Тип
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Имя
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Контакты
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Статус
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Дата
                </th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Действия</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {applications.map((application: Application) => (
                <tr key={application.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {getTypeText(application.type)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {application.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    <div>{application.phone}</div>
                    <div>{application.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={getStatusBadgeClasses(application.status)}>
                      {getStatusText(application.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {formatDistanceToNow(new Date(application.createdAt), {
                      addSuffix: true,
                      locale: ru,
                    })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link
                      href={`/admin/applications/${application.id}`}
                      className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                    >
                      Просмотр
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
} 