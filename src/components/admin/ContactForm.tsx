'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useNotification } from '@/contexts/NotificationContext'
import Link from 'next/link'

type DayOfWeek = 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY'

type WorkingHours = {
  id?: string
  dayOfWeek: DayOfWeek
  openTime: string
  closeTime: string
  isWorkingDay: boolean
}

type SocialMedia = {
  id?: string
  whatsapp?: string
  telegram?: string
  instagram?: string
}

type ContactData = {
  id?: string
  phone: string
  email: string
  address: string
  workingHours: WorkingHours[]
  socialMedia?: SocialMedia
}

export default function ContactForm({ initialData }: { initialData: ContactData | null }) {
  const router = useRouter()
  const { showNotification } = useNotification()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState<ContactData>(
    initialData || {
      phone: '',
      email: '',
      address: '',
      workingHours: [
        { dayOfWeek: 'MONDAY', openTime: '09:00', closeTime: '18:00', isWorkingDay: true },
        { dayOfWeek: 'TUESDAY', openTime: '09:00', closeTime: '18:00', isWorkingDay: true },
        { dayOfWeek: 'WEDNESDAY', openTime: '09:00', closeTime: '18:00', isWorkingDay: true },
        { dayOfWeek: 'THURSDAY', openTime: '09:00', closeTime: '18:00', isWorkingDay: true },
        { dayOfWeek: 'FRIDAY', openTime: '09:00', closeTime: '18:00', isWorkingDay: true },
        { dayOfWeek: 'SATURDAY', openTime: '10:00', closeTime: '16:00', isWorkingDay: true },
        { dayOfWeek: 'SUNDAY', openTime: '10:00', closeTime: '16:00', isWorkingDay: false }
      ],
      socialMedia: {
        whatsapp: '',
        telegram: '',
        instagram: '',
      },
    }
  )

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Проверяем обязательные поля
      if (!formData.phone || !formData.email || !formData.address) {
        throw new Error('Пожалуйста, заполните все обязательные поля')
      }

      // Очищаем пустые значения в социальных сетях
      const socialMedia = formData.socialMedia ? {
        whatsapp: formData.socialMedia.whatsapp?.trim() || '',
        telegram: formData.socialMedia.telegram?.trim() || '',
        instagram: formData.socialMedia.instagram?.trim() || '',
      } : undefined

      const validatedData = {
        ...formData,
        workingHours: formData.workingHours.map(hours => ({
          ...hours,
          dayOfWeek: hours.dayOfWeek as DayOfWeek,
          isWorkingDay: Boolean(hours.isWorkingDay)
        })),
        // Включаем socialMedia только если есть хотя бы одно непустое поле
        socialMedia: (socialMedia && (socialMedia.whatsapp || socialMedia.telegram || socialMedia.instagram)) 
          ? socialMedia 
          : undefined
      }

      const response = await fetch(`/api/admin/contacts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(validatedData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Ошибка при сохранении контакта')
      }

      showNotification(
        formData.id ? 'Контакт успешно обновлен' : 'Контакт успешно создан',
        'success'
      )
      router.push('/admin/contacts')
      router.refresh()
    } catch (error) {
      console.error('Error:', error)
      showNotification(
        error instanceof Error ? error.message : 'Ошибка при сохранении контакта',
        'error'
      )
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!formData.id || !confirm('Вы уверены, что хотите удалить этот контакт?')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/contacts/${formData.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Ошибка при удалении контакта')
      }

      showNotification('Контакт успешно удален', 'success')
      router.push('/admin/contacts')
      router.refresh()
    } catch (error) {
      console.error('Error:', error)
      showNotification('Ошибка при удалении контакта', 'error')
    }
  }

  const handleWorkingHoursChange = (index: number, field: keyof WorkingHours, value: string | boolean) => {
    const newWorkingHours = [...formData.workingHours]
    newWorkingHours[index] = { ...newWorkingHours[index], [field]: value }
    setFormData({ ...formData, workingHours: newWorkingHours })
  }

  const handleSocialMediaChange = (field: keyof SocialMedia, value: string) => {
    // Обновляем значение, удаляя пробелы в начале и конце
    const trimmedValue = value.trim()
    setFormData({
      ...formData,
      socialMedia: { 
        ...formData.socialMedia, 
        [field]: trimmedValue
      },
    })
  }

  const daysOfWeek: Record<DayOfWeek, string> = {
    MONDAY: 'Понедельник',
    TUESDAY: 'Вторник',
    WEDNESDAY: 'Среда',
    THURSDAY: 'Четверг',
    FRIDAY: 'Пятница',
    SATURDAY: 'Суббота',
    SUNDAY: 'Воскресенье',
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
      <div className="space-y-6 sm:space-y-8">
        {/* Основная информация */}
        <div>
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4 sm:mb-6">
            Основная информация
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-6">
            <div className="sm:col-span-3">
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Телефон
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                  </svg>
                </div>
                <input
                  type="tel"
                  name="phone"
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="block w-full pl-10 px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 
                          shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20
                          bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                          placeholder-gray-400 dark:placeholder-gray-500
                          transition duration-200 ease-in-out"
                  placeholder="+7 (999) 999-99-99"
                />
              </div>
            </div>

            <div className="sm:col-span-3">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                </div>
                <input
                  type="email"
                  name="email"
                  id="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="block w-full pl-10 px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 
                          shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20
                          bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                          placeholder-gray-400 dark:placeholder-gray-500
                          transition duration-200 ease-in-out"
                  placeholder="email@example.com"
                />
              </div>
            </div>

            <div className="sm:col-span-6">
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Адрес офиса
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                </div>
                <input
                  type="text"
                  name="address"
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="block w-full pl-10 px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 
                          shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20
                          bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                          placeholder-gray-400 dark:placeholder-gray-500
                          transition duration-200 ease-in-out"
                  placeholder="ул. Примерная, д. 123"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Режим работы */}
        <div>
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4 sm:mb-6">
            Режим работы
          </h3>
          <div className="bg-gray-50 dark:bg-gray-900/30 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {formData.workingHours.map((hours, index) => (
                <div key={hours.dayOfWeek} className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-100 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {daysOfWeek[hours.dayOfWeek]}
                    </span>
                    <label className="inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={hours.isWorkingDay}
                        onChange={(e) => handleWorkingHoursChange(index, 'isWorkingDay', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                      <span className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                        {hours.isWorkingDay ? 'Рабочий' : 'Выходной'}
                      </span>
                    </label>
                  </div>
                  
                  {hours.isWorkingDay && (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label htmlFor={`open-${hours.dayOfWeek}`} className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                          Открытие
                        </label>
                        <input
                          type="time"
                          id={`open-${hours.dayOfWeek}`}
                          value={hours.openTime}
                          onChange={(e) => handleWorkingHoursChange(index, 'openTime', e.target.value)}
                          className="block w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 
                                  shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20
                                  bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                                  transition duration-200 ease-in-out"
                        />
                      </div>
                      <div>
                        <label htmlFor={`close-${hours.dayOfWeek}`} className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                          Закрытие
                        </label>
                        <input
                          type="time"
                          id={`close-${hours.dayOfWeek}`}
                          value={hours.closeTime}
                          onChange={(e) => handleWorkingHoursChange(index, 'closeTime', e.target.value)}
                          className="block w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 
                                  shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20
                                  bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                                  transition duration-200 ease-in-out"
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Социальные сети */}
        <div>
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4 sm:mb-6">
            Социальные сети
          </h3>
          <div className="bg-gray-50 dark:bg-gray-900/30 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label htmlFor="whatsapp" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  WhatsApp
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <svg className="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    id="whatsapp"
                    value={formData.socialMedia?.whatsapp || ''}
                    onChange={(e) => handleSocialMediaChange('whatsapp', e.target.value)}
                    className="block w-full pl-10 px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 
                            shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20
                            bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                            placeholder-gray-400 dark:placeholder-gray-500
                            transition duration-200 ease-in-out"
                    placeholder="https://wa.me/79991234567"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="telegram" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Telegram
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <svg className="h-5 w-5 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    id="telegram"
                    value={formData.socialMedia?.telegram || ''}
                    onChange={(e) => handleSocialMediaChange('telegram', e.target.value)}
                    className="block w-full pl-10 px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 
                            shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20
                            bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                            placeholder-gray-400 dark:placeholder-gray-500
                            transition duration-200 ease-in-out"
                    placeholder="https://t.me/username"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="instagram" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Instagram
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <svg className="h-5 w-5 text-pink-500" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    id="instagram"
                    value={formData.socialMedia?.instagram || ''}
                    onChange={(e) => handleSocialMediaChange('instagram', e.target.value)}
                    className="block w-full pl-10 px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 
                            shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20
                            bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                            placeholder-gray-400 dark:placeholder-gray-500
                            transition duration-200 ease-in-out"
                    placeholder="https://instagram.com/username"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col-reverse sm:flex-row sm:justify-between sm:space-x-4">
        {formData.id && (
          <button
            type="button"
            onClick={handleDelete}
            className="mt-3 sm:mt-0 w-full sm:w-auto px-6 py-2.5 bg-red-600 text-white font-medium text-sm rounded-lg
                    hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500
                    transition duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading}
          >
            Удалить
          </button>
        )}
        
        <div className="flex flex-col sm:flex-row sm:space-x-3 space-y-3 sm:space-y-0">
          <Link
            href="/admin"
            className="w-full sm:w-auto px-6 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 
                    font-medium text-sm rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 
                    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500
                    transition duration-200 ease-in-out flex justify-center items-center"
          >
            Отмена
          </Link>
          <button
            type="submit"
            className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 text-white font-medium text-sm rounded-lg
                    hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
                    transition duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed
                    flex justify-center items-center"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Сохранение...
              </>
            ) : (
              'Сохранить'
            )}
          </button>
        </div>
      </div>
    </form>
  )
} 