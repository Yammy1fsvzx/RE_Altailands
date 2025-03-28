'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { formatPhoneNumber } from '@/utils/formatters'
import { PhoneIcon, EnvelopeIcon, ClockIcon } from '@heroicons/react/24/outline'
import { useContacts } from '@/utils/useContacts'

export default function Footer() {
  const { contactInfo } = useContacts()

  // Форматируем рабочие часы для отображения
  const formatWorkingHours = () => {
    if (!contactInfo?.workingHours) return null

    const weekdays = contactInfo.workingHours.filter(h => 
      ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'].includes(h.dayOfWeek) && 
      h.isWorkingDay
    )
    const weekends = contactInfo.workingHours.filter(h => 
      ['SATURDAY', 'SUNDAY'].includes(h.dayOfWeek) && 
      h.isWorkingDay
    )

    const formatTime = (hours: typeof weekdays) => {
      if (hours.length === 0) return 'Выходной'
      const time = hours[0]
      return `${time.openTime} - ${time.closeTime}`
    }

    return {
      weekdays: formatTime(weekdays),
      weekends: formatTime(weekends)
    }
  }

  const workingHours = formatWorkingHours()

  return (
    <footer className="bg-gray-900 text-white py-8 md:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 mb-6 md:mb-8">
          {/* Логотип и описание */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center space-x-2 mb-4 md:mb-6">
              <div className="relative w-8 h-8 md:w-10 md:h-10">
                <div className="absolute inset-0 bg-white rounded-full"></div>
                <div className="relative w-full h-full flex items-center justify-center">
                  <Image
                    src="/images/logo.png"
                    alt="ЗемлиАлтая"
                    fill
                    className="object-contain p-1"
                  />
                </div>
              </div>
              <span className="font-bold text-base md:text-xl">
                ЗемлиАлтая
              </span>
            </Link>
            <p className="text-gray-400 text-sm md:text-base max-w-md">
              Мы помогаем приобрести нашим партнерам земельные участки для строительства турбаз, отелей и частных домов в живописных местах Горного Алтая.
            </p>
            
            
          </div>
          
          {/* Навигация */}
          <div>
            <h3 className="text-lg md:text-xl font-bold mb-3 md:mb-4">Навигация</h3>
            <ul className="space-y-1 md:space-y-2">
              <li>
                <Link href="/" className="text-sm md:text-base text-gray-400 hover:text-white transition-colors">
                  Главная
                </Link>
              </li>
              <li>
                <Link href="/catalog" className="text-sm md:text-base text-gray-400 hover:text-white transition-colors">
                  Каталог участков
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-sm md:text-base text-gray-400 hover:text-white transition-colors">
                  О компании
                </Link>
              </li>
              <li>
                <Link href="/contacts" className="text-sm md:text-base text-gray-400 hover:text-white transition-colors">
                  Контакты
                </Link>
              </li>
            </ul>
          </div>

          {/* Контакты */}
          <div>
            <h3 className="text-lg md:text-xl font-bold mb-3 md:mb-4">Контакты</h3>
            <ul className="space-y-2 md:space-y-3">
              {contactInfo?.phone && (
                <li className="flex items-center">
                  <PhoneIcon className="w-4 h-4 md:w-5 md:h-5 text-primary mr-2 flex-shrink-0" />
                  <a href={`tel:${contactInfo.phone}`} className="text-sm md:text-base text-gray-400 hover:text-white transition-colors">
                    {formatPhoneNumber(contactInfo.phone)}
                  </a>
                </li>
              )}
              {contactInfo?.email && (
                <li className="flex items-center">
                  <EnvelopeIcon className="w-4 h-4 md:w-5 md:h-5 text-primary mr-2 flex-shrink-0" />
                  <a href={`mailto:${contactInfo.email}`} className="text-sm md:text-base text-gray-400 hover:text-white transition-colors">
                    {contactInfo.email}
                  </a>
                </li>
              )}
              {workingHours && (
                <li className="flex items-start">
                  <ClockIcon className="w-4 h-4 md:w-5 md:h-5 text-primary mr-2 flex-shrink-0 mt-0.5" />
                  <div className="text-sm md:text-base text-gray-400">
                    Режим работы:<br />
                    Пн-Пт: {workingHours.weekdays}<br />
                    Сб-Вс: {workingHours.weekends}
                  </div>
                </li>
              )}
            </ul>
            
            
          </div>
        </div>
        
        {/* Копирайт */}
        <div className="pt-6 md:pt-8 border-t border-gray-800 text-center sm:text-left">
          <div className="flex flex-col sm:flex-row justify-between items-center">
            <p className="text-xs md:text-sm text-gray-500">
              © {new Date().getFullYear()} ЗемлиАлтая. Все права защищены.
            </p>
            <div className="mt-2 sm:mt-0">
              <Link href="/privacy" className="text-xs md:text-sm text-gray-500 hover:text-gray-400 transition-colors">
                Политика конфиденциальности
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
} 