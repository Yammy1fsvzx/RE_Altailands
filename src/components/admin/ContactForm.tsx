'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useNotification } from '@/contexts/NotificationContext'

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
    <form onSubmit={handleSubmit} className="space-y-8 bg-dark p-6 rounded-xl shadow-sm">
      <div className="space-y-8">
        {/* Основная информация */}
        <div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
            Основная информация
          </h3>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-6">
            <div className="sm:col-span-3">
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Телефон
              </label>
              <input
                type="tel"
                name="phone"
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="block w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 
                          shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20
                          bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                          placeholder-gray-400 dark:placeholder-gray-500
                          transition duration-200 ease-in-out"
                placeholder="+7 (999) 999-99-99"
              />
            </div>

            <div className="sm:col-span-3">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email
              </label>
              <input
                type="email"
                name="email"
                id="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="block w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 
                          shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20
                          bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                          placeholder-gray-400 dark:placeholder-gray-500
                          transition duration-200 ease-in-out"
              />
            </div>

            <div className="sm:col-span-6">
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Адрес офиса
              </label>
              <input
                type="text"
                name="address"
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="block w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 
                          shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20
                          bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                          placeholder-gray-400 dark:placeholder-gray-500
                          transition duration-200 ease-in-out"
              />
            </div>
          </div>
        </div>

        {/* Режим работы */}
        <div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
            Режим работы
          </h3>
          <div className="space-y-4">
            {formData.workingHours.map((hours, index) => (
              <div key={hours.dayOfWeek} className="grid grid-cols-1 gap-4 sm:grid-cols-8 items-center">
                <div className="sm:col-span-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {daysOfWeek[hours.dayOfWeek]}
                  </span>
                </div>
                <div className="sm:col-span-1">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hours.isWorkingDay}
                      onChange={(e) => handleWorkingHoursChange(index, 'isWorkingDay', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 
                                  peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full 
                                  peer dark:bg-gray-700 peer-checked:after:translate-x-full 
                                  peer-checked:after:border-white after:content-[''] after:absolute 
                                  after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 
                                  after:border after:rounded-full after:h-5 after:w-5 after:transition-all 
                                  dark:border-gray-600 peer-checked:bg-blue-600">
                    </div>
                  </label>
                </div>
                <div className="sm:col-span-2">
                  <input
                    type="time"
                    value={hours.openTime}
                    onChange={(e) => handleWorkingHoursChange(index, 'openTime', e.target.value)}
                    className={`block w-full px-4 py-2 rounded-lg border shadow-sm
                              focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20
                              transition duration-200 ease-in-out
                              ${hours.isWorkingDay 
                                ? 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100' 
                                : 'border-gray-200 bg-gray-50 dark:bg-gray-700 text-gray-400 dark:text-gray-500'
                              }`}
                    disabled={!hours.isWorkingDay}
                  />
                </div>
                <div className="sm:col-span-2">
                  <input
                    type="time"
                    value={hours.closeTime}
                    onChange={(e) => handleWorkingHoursChange(index, 'closeTime', e.target.value)}
                    className={`block w-full px-4 py-2 rounded-lg border shadow-sm
                              focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20
                              transition duration-200 ease-in-out
                              ${hours.isWorkingDay 
                                ? 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100' 
                                : 'border-gray-200 bg-gray-50 dark:bg-gray-700 text-gray-400 dark:text-gray-500'
                              }`}
                    disabled={!hours.isWorkingDay}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Социальные сети */}
        <div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
            Социальные сети
          </h3>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-6">
            {['whatsapp', 'telegram', 'instagram'].map((social) => (
              <div key={social} className="sm:col-span-2">
                <label 
                  htmlFor={social} 
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 capitalize"
                >
                  {social}
                </label>
                <input
                  type={social === 'whatsapp' ? 'tel' : 'text'}
                  name={social}
                  id={social}
                  value={formData.socialMedia?.[social as keyof SocialMedia] || ''}
                  onChange={(e) => handleSocialMediaChange(social as keyof SocialMedia, e.target.value)}
                  className="block w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 
                            shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20
                            bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                            placeholder-gray-400 dark:placeholder-gray-500
                            transition duration-200 ease-in-out"
                  placeholder={social === 'whatsapp' ? '+7 (999) 999-99-99' : '@username'}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Кнопки */}
      <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
        <div className="flex justify-end gap-4">
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 
                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                     text-white font-medium text-sm
                     transition duration-200 ease-in-out
                     disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Сохранение...' : 'Сохранить'}
          </button>
        </div>
      </div>
    </form>
  )
} 