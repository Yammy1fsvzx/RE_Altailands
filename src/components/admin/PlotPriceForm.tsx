'use client'

import { useState, useEffect } from 'react'
import { Plot } from '@prisma/client'
import {
  squareMetersToSotka,
  sotkaToSquareMeters,
  pricePerMeterToPricePerSotka,
  pricePerSotkaToPricePerMeter
} from '@/utils/unitConversion'

type PlotPriceFormProps = {
  plot?: Plot | null
  onChange: (data: {
    area: number
    price: number
    pricePerMeter: number
    status: 'AVAILABLE' | 'RESERVED' | 'SOLD'
    isVisible: boolean
  }) => void
}

export default function PlotPriceForm({ plot, onChange }: PlotPriceFormProps) {
  // Площадь в сотках (1 сотка = 100 кв.м)
  const [areaSotka, setAreaSotka] = useState(
    plot?.area ? squareMetersToSotka(plot.area) : 0
  )
  
  const [price, setPrice] = useState(plot?.price || 0)
  // Цена за сотку
  const [pricePerSotka, setPricePerSotka] = useState(
    plot?.pricePerMeter ? pricePerMeterToPricePerSotka(plot.pricePerMeter) : 0
  )
  const [status, setStatus] = useState<'AVAILABLE' | 'RESERVED' | 'SOLD'>(
    plot?.status as 'AVAILABLE' | 'RESERVED' | 'SOLD' || 'AVAILABLE'
  )
  const [isVisible, setIsVisible] = useState(plot?.isVisible ?? true)
  const [errors, setErrors] = useState({
    areaSotka: '',
    price: '',
    pricePerSotka: ''
  })

  const parseNumber = (value: string) => {
    const cleanValue = value.replace(/\s+/g, '').replace(',', '.')
    const number = Number(cleanValue)
    return isNaN(number) ? 0 : number
  }

  const formatNumber = (value: number) => {
    try {
      return value.toLocaleString('ru-RU', {
        maximumFractionDigits: 2,
        useGrouping: true
      })
    } catch (e) {
      return '0'
    }
  }

  // Валидация данных
  const validateField = (field: string, value: number): string => {
    if (value < 0) return 'Значение не может быть отрицательным'
    return ''
  }

  // Вычисляет цену за сотку при изменении цены или площади
  const calculatePricePerSotka = (newPrice: number, newAreaSotka: number) => {
    if (newAreaSotka <= 0) return 0
    return newPrice / newAreaSotka
  }

  // Обработка изменений данных
  const handleChange = () => {
    // Проверяем, нет ли ошибок перед отправкой
    if (errors.areaSotka || errors.price || errors.pricePerSotka) {
      return
    }
    
    // Преобразуем значения для сохранения в базу данных
    const areaInSquareMeters = sotkaToSquareMeters(areaSotka)
    const pricePerMeter = pricePerSotkaToPricePerMeter(pricePerSotka)
    
    onChange({
      area: areaInSquareMeters,
      price,
      pricePerMeter,
      status,
      isVisible
    })
  }

  // Обработчик изменения площади
  const handleAreaChange = (newAreaSotka: number) => {
    setAreaSotka(newAreaSotka)
    const errorMsg = validateField('areaSotka', newAreaSotka)
    setErrors(prev => ({ ...prev, areaSotka: errorMsg }))
    
    if (!errorMsg) {
      // Автоматически пересчитываем цену за сотку
      const newPricePerSotka = calculatePricePerSotka(price, newAreaSotka)
      setPricePerSotka(newPricePerSotka)
    }
  }

  // Обработчик изменения цены
  const handlePriceChange = (newPrice: number) => {
    setPrice(newPrice)
    const errorMsg = validateField('price', newPrice)
    setErrors(prev => ({ ...prev, price: errorMsg }))
    
    if (!errorMsg) {
      // Автоматически пересчитываем цену за сотку
      const newPricePerSotka = calculatePricePerSotka(newPrice, areaSotka)
      setPricePerSotka(newPricePerSotka)
    }
  }

  // Обработчик изменения цены за сотку
  const handlePricePerSotkaChange = (newPricePerSotka: number) => {
    setPricePerSotka(newPricePerSotka)
    const errorMsg = validateField('pricePerSotka', newPricePerSotka)
    setErrors(prev => ({ ...prev, pricePerSotka: errorMsg }))
    
    if (!errorMsg && areaSotka > 0) {
      // Автоматически пересчитываем общую цену
      const newPrice = newPricePerSotka * areaSotka
      setPrice(newPrice)
    }
  }

  // Эффект для вызова handleChange при изменении данных
  useEffect(() => {
    if (!errors.areaSotka && !errors.price && !errors.pricePerSotka) {
      handleChange()
    }
  }, [areaSotka, price, pricePerSotka, status, isVisible])

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="col-span-1">
          <label htmlFor="areaSotka" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
            Площадь (сотки)
          </label>
          <input
            type="text"
            id="areaSotka"
            value={formatNumber(areaSotka)}
            onChange={(e) => {
              const newAreaSotka = parseNumber(e.target.value)
              handleAreaChange(newAreaSotka)
            }}
            className={`mt-1 block w-full rounded-md border ${errors.areaSotka ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white p-2`}
          />
          {errors.areaSotka && (
            <p className="mt-1 text-sm text-red-500">{errors.areaSotka}</p>
          )}
        </div>

        <div className="col-span-1">
          <label htmlFor="price" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
            Цена (₽)
          </label>
          <input
            type="text"
            id="price"
            value={formatNumber(price)}
            onChange={(e) => {
              const newPrice = parseNumber(e.target.value)
              handlePriceChange(newPrice)
            }}
            className={`mt-1 block w-full rounded-md border ${errors.price ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white p-2`}
          />
          {errors.price && (
            <p className="mt-1 text-sm text-red-500">{errors.price}</p>
          )}
        </div>

        <div className="col-span-1">
          <label htmlFor="pricePerSotka" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
            Цена за сотку (₽)
          </label>
          <input
            type="text"
            id="pricePerSotka"
            value={formatNumber(pricePerSotka)}
            onChange={(e) => {
              const newPricePerSotka = parseNumber(e.target.value)
              handlePricePerSotkaChange(newPricePerSotka)
            }}
            className={`mt-1 block w-full rounded-md border ${errors.pricePerSotka ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white p-2`}
          />
          {errors.pricePerSotka && (
            <p className="mt-1 text-sm text-red-500">{errors.pricePerSotka}</p>
          )}
        </div>

        <div className="col-span-1">
          <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
            Статус
          </label>
          <select
            id="status"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value as 'AVAILABLE' | 'RESERVED' | 'SOLD')
            }}
            className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white p-2"
          >
            <option value="AVAILABLE">Доступен</option>
            <option value="RESERVED">Забронирован</option>
            <option value="SOLD">Продан</option>
          </select>
        </div>
      </div>

      <div className="relative flex items-start">
        <div className="flex h-5 items-center">
          <input
            id="isVisible"
            type="checkbox"
            checked={isVisible}
            onChange={(e) => {
              setIsVisible(e.target.checked)
            }}
            className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-indigo-600 focus:ring-indigo-500"
          />
        </div>
        <div className="ml-3 text-sm">
          <label htmlFor="isVisible" className="font-medium text-gray-700 dark:text-gray-200">
            Показывать на сайте
          </label>
          <p className="text-gray-500 dark:text-gray-400">
            Если отключено, участок будет скрыт из общего списка
          </p>
        </div>
      </div>
    </div>
  )
} 