'use client'

import { useState, useEffect } from 'react'
import Head from 'next/head'
import ScrollAnimation from '@/components/ScrollAnimation'
import { 
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  ClockIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'
import { formatPhoneNumber } from '@/utils/formatters'
import Script from 'next/script'
import { useContacts } from '@/utils/useContacts'

interface WorkingHours {
  dayOfWeek: 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY'
  openTime: string
  closeTime: string
  isWorkingDay: boolean
}

interface SocialMedia {
  whatsapp?: string
  telegram?: string
  instagram?: string
}

interface ContactInfo {
  id: string
  phone: string
  email: string
  address: string
  workingHours: WorkingHours[]
  socialMedia?: SocialMedia
  updatedAt: string
}

// Функция для кодирования адреса для URL
const encodeAddress = (address: string) => {
  return encodeURIComponent(address)
}

const initialContactInfo: ContactInfo = {
  id: '',
  phone: '',
  email: '',
  address: '',
  workingHours: [],
  socialMedia: {},
  updatedAt: new Date().toISOString()
}

export default function ContactsPage() {
  const { contactInfo, isLoading: loading, error } = useContacts()
  const [mapLoaded, setMapLoaded] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  // Функция для форматирования рабочих часов
  const formatWorkingHours = (hours: WorkingHours[]) => {
    const weekdays = hours.filter(h => 
      ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'].includes(h.dayOfWeek)
    )
    const weekends = hours.filter(h => 
      ['SATURDAY', 'SUNDAY'].includes(h.dayOfWeek)
    )

    const formatHours = (hours: WorkingHours[]) => {
      if (!hours.length || !hours[0].isWorkingDay) return 'Выходной'
      return `${hours[0].openTime} - ${hours[0].closeTime}`
    }

    return {
      monday_friday: formatHours(weekdays),
      saturday_sunday: formatHours(weekends)
    }
  }

  // Эффект для инициализации карты после загрузки API и получения данных
  useEffect(() => {
    if (mapLoaded && contactInfo?.address) {
      // @ts-ignore
      const ymaps = window.ymaps
      ymaps.ready(() => {
        const geocoder = ymaps.geocode(contactInfo.address)
        geocoder.then((res: any) => {
          const coordinates = res.geoObjects.get(0).geometry.getCoordinates()
          
          const map = new ymaps.Map('map', {
            center: coordinates,
            zoom: 17
          })
          
          const placemark = new ymaps.Placemark(coordinates, {
            balloonContent: contactInfo.address
          }, {
            preset: 'islands#greenDotIconWithCaption'
          })
          
          map.geoObjects.add(placemark)
          map.controls.remove('trafficControl')
          map.controls.remove('searchControl')
          map.controls.remove('typeSelector')
          map.controls.remove('fullscreenControl')
          map.controls.remove('rulerControl')
          map.behaviors.disable(['scrollZoom'])
        })
      })
    }
  }, [mapLoaded, contactInfo?.address])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Ошибка при отправке формы')
      }

      setShowSuccess(true)
      setFormData({
        name: '',
        phone: '',
        email: '',
        message: ''
      })
      
      setTimeout(() => {
        setShowSuccess(false)
      }, 5000)
    } catch (error) {
      console.error('Error submitting form:', error)
      alert('Произошла ошибка при отправке формы. Пожалуйста, попробуйте позже.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <>
        <main className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
        </main>
      </>
    )
  }

  return (
    <>
      <Script 
        src="https://api-maps.yandex.ru/2.1/?apikey=0d548291-a59d-48f7-9490-ce8a53b23151&lang=ru_RU" 
        onLoad={() => setMapLoaded(true)}
      />
      <main className="min-h-screen pt-16 md:pt-20">
        {/* Hero Section */}
        <section className="min-h-[60vh] bg-gradient-to-b from-white to-gray-100 flex items-center">
          <div className="max-w-7xl mx-auto px-4 py-32">
            <ScrollAnimation>
              <div className="max-w-3xl mx-auto text-center">
                <h1 className="text-4xl md:text-5xl font-bold mb-6 text-primary">
                  Свяжитесь с нами
                </h1>
                <p className="text-xl text-gray-600">
                  Мы всегда готовы ответить на ваши вопросы и помочь с выбором уникального участка
                </p>
              </div>
            </ScrollAnimation>
          </div>
        </section>

        {/* Основная информация */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              {/* Контактная информация */}
              <ScrollAnimation>
                <div className="space-y-12">
                  <div>
                    <h2 className="text-2xl font-bold mb-6 text-gray-900">
                      Контактная информация
                    </h2>
                    <div className="space-y-6">
                      {contactInfo?.phone && (
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center flex-shrink-0">
                            <PhoneIcon className="w-6 h-6 text-green-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900 mb-1">Телефон</h3>
                            <div className="flex items-center gap-4">
                              <a 
                                href={`tel:${contactInfo.phone}`}
                                className="text-xl text-green-600 hover:text-green-700 transition-colors"
                              >
                                {formatPhoneNumber(contactInfo.phone)}
                              </a>
                            </div>
                            <p className="text-gray-600 mt-1">
                              Звоните нам по любым вопросам
                            </p>
                            
                            {contactInfo?.socialMedia?.whatsapp && (
                              <>
                                <div className="w-full h-px bg-gray-200 my-3"></div>
                                <div className="flex items-center gap-2">
                                  <svg className="w-5 h-5 text-green-600" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                                  </svg>
                                  <a 
                                    href={`https://wa.me/${contactInfo.socialMedia.whatsapp}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-lg text-green-600 hover:text-green-700 transition-colors"
                                  >
                                    WhatsApp
                                  </a>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      )}

                      {contactInfo?.email && (
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center flex-shrink-0">
                            <EnvelopeIcon className="w-6 h-6 text-green-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900 mb-1">Email</h3>
                            <a 
                              href={`mailto:${contactInfo.email}`}
                              className="text-xl text-green-600 hover:text-green-700 transition-colors"
                            >
                              {contactInfo.email}
                            </a>
                            <p className="text-gray-600 mt-1">
                              Ответим в течение 24 часов
                            </p>
                          </div>
                        </div>
                      )}

                      {contactInfo?.address && (
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center flex-shrink-0">
                            <MapPinIcon className="w-6 h-6 text-green-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900 mb-1">Адрес офиса</h3>
                            <p className="text-xl text-gray-900">
                              {contactInfo.address}
                            </p>
                            <p className="text-gray-600 mt-1">
                              Удобная парковка для клиентов
                            </p>
                          </div>
                        </div>
                      )}

                      {contactInfo?.workingHours && (
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center flex-shrink-0">
                            <ClockIcon className="w-6 h-6 text-green-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900 mb-1">Режим работы</h3>
                            <div className="space-y-1">
                              <p className="text-gray-900">
                                Пн-Пт: {formatWorkingHours(contactInfo.workingHours).monday_friday}
                              </p>
                              <p className="text-gray-900">
                                Сб-Вс: {formatWorkingHours(contactInfo.workingHours).saturday_sunday}
                              </p>
                            </div>
                            <p className="text-gray-600 mt-1">
                              Работаем без перерыва
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </ScrollAnimation>

              {/* Форма обратной связи */}
              <ScrollAnimation>
                <div className="bg-white p-8 rounded-xl shadow-lg border border-green-100">
                  <h2 className="text-2xl font-bold mb-6 text-gray-900">
                    Отправить заявку
                  </h2>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                          Ваше имя
                        </label>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                          placeholder="Иван Иванов"
                        />
                      </div>
                      <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                          Телефон
                        </label>
                        <input
                          type="tel"
                          id="phone"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                          placeholder="+7 (XXX) XXX-XX-XX"
                        />
                      </div>
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                        placeholder="example@mail.com"
                      />
                    </div>
                    <div>
                      <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                        Сообщение
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleInputChange}
                        required
                        rows={4}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                        placeholder="Ваше сообщение..."
                      ></textarea>
                    </div>

                    {showSuccess && (
                      <div className="flex items-center gap-2 text-green-600 bg-green-50 p-4 rounded-lg">
                        <CheckCircleIcon className="w-5 h-5" />
                        <span>Ваше сообщение успешно отправлено! Мы свяжемся с вами в ближайшее время.</span>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className={`w-full btn-primary py-3 px-6 text-white bg-green-500 hover:bg-green-600 rounded-lg transition-colors duration-200 flex items-center justify-center ${isSubmitting ? 'opacity-75 cursor-not-allowed' : ''}`}
                    >
                      {isSubmitting ? (
                        <span className="flex items-center gap-2">
                          <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                          Отправка...
                        </span>
                      ) : (
                        'Отправить сообщение'
                      )}
                    </button>
                  </form>
                </div>
              </ScrollAnimation>
            </div>
          </div>
        </section>

        {/* Карта */}
        {/* <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4">
            <ScrollAnimation>
              <div className="max-w-3xl mx-auto text-center mb-12">
                <h2 className="text-2xl font-bold mb-4 text-gray-900">
                  Как нас найти
                </h2>
              </div>
            </ScrollAnimation>
            <ScrollAnimation>
              <div className="relative h-[400px] rounded-xl overflow-hidden shadow-lg border border-green-100">
                <div id="map" className="w-full h-full"></div>
              </div>
            </ScrollAnimation>
          </div>
        </section> */}
      </main>
    </>
  )
} 