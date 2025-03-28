import prisma from '@/lib/prisma'
import ContactForm from '@/components/admin/ContactForm'
import Link from 'next/link'
import { ArrowLeftIcon, DevicePhoneMobileIcon, EnvelopeIcon, MapPinIcon } from '@heroicons/react/24/outline'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Управление контактами | Админ-панель',
}

export default async function ContactsPage() {
  const contact = await prisma.contact.findFirst({
    include: {
      workingHours: true,
      socialMedia: true,
    },
  })

  // Безопасное получение данных для отображения в карточках
  const phone = contact?.phone || ''
  const email = contact?.email || ''
  const address = contact?.address || ''

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 sm:pb-0">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold text-gray-900 dark:text-white">
            Контактная информация
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Управление контактными данными для отображения на сайте
          </p>
        </div>
        
        {/* Кнопка возврата для десктопа */}
        <div className="hidden sm:block">
          <Link
            href="/admin"
            className="px-5 py-2 rounded-lg bg-gray-500 hover:bg-gray-600 text-white font-medium text-sm transition duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 inline-flex items-center"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Назад в админку
          </Link>
        </div>
      </div>

      {/* Краткая информация о контактах */}
      {contact && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-5 mb-6 sm:mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 sm:p-6 border border-gray-100 dark:border-gray-700 relative overflow-hidden">
            <div className="flex items-center">
              <div className="bg-blue-100 dark:bg-blue-900/30 p-2 sm:p-3 rounded-lg mr-3 sm:mr-4">
                <DevicePhoneMobileIcon className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">Телефон</p>
                <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white mt-1">{phone}</h3>
              </div>
            </div>
            <div className="absolute bottom-0 right-0 -mb-3 opacity-10">
              <DevicePhoneMobileIcon className="h-16 sm:h-20 w-16 sm:w-20 text-blue-600" />
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 sm:p-6 border border-gray-100 dark:border-gray-700 relative overflow-hidden">
            <div className="flex items-center">
              <div className="bg-purple-100 dark:bg-purple-900/30 p-2 sm:p-3 rounded-lg mr-3 sm:mr-4">
                <EnvelopeIcon className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">Email</p>
                <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white mt-1 break-all">{email}</h3>
              </div>
            </div>
            <div className="absolute bottom-0 right-0 -mb-3 opacity-10">
              <EnvelopeIcon className="h-16 sm:h-20 w-16 sm:w-20 text-purple-600" />
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 sm:p-6 border border-gray-100 dark:border-gray-700 relative overflow-hidden">
            <div className="flex items-center">
              <div className="bg-amber-100 dark:bg-amber-900/30 p-2 sm:p-3 rounded-lg mr-3 sm:mr-4">
                <MapPinIcon className="h-5 w-5 sm:h-6 sm:w-6 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">Адрес</p>
                <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white mt-1 line-clamp-2">{address}</h3>
              </div>
            </div>
            <div className="absolute bottom-0 right-0 -mb-3 opacity-10">
              <MapPinIcon className="h-16 sm:h-20 w-16 sm:w-20 text-amber-600" />
            </div>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg border border-gray-100 dark:border-gray-700">
        <div className="p-4 sm:p-6">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4 sm:mb-6">
            {contact ? 'Редактирование контактных данных' : 'Добавление контактных данных'}
          </h2>
          <ContactForm initialData={contact as any} />
        </div>
      </div>
      
      {/* Фиксированная панель с кнопками навигации - только для мобильных */}
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4 z-10 flex justify-between items-center shadow-lg sm:hidden">
        <div className="flex items-center">
          <Link
            href="/admin"
            className="px-6 py-2.5 rounded-lg bg-gray-500 hover:bg-gray-600 text-white font-medium text-sm transition duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 inline-flex items-center"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Назад
          </Link>
        </div>
      </div>
    </div>
  )
} 