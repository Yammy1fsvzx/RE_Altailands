'use client'

import { useState } from 'react'
import { Plot } from '@prisma/client'

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
  const [area, setArea] = useState(plot?.area || 0)
  const [price, setPrice] = useState(plot?.price || 0)
  const [pricePerMeter, setPricePerMeter] = useState(plot?.pricePerMeter || 0)
  const [status, setStatus] = useState<'AVAILABLE' | 'RESERVED' | 'SOLD'>(plot?.status || 'AVAILABLE')
  const [isVisible, setIsVisible] = useState(plot?.isVisible ?? true)

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

  const handleChange = () => {
    // Вычисляем цену за квадратный метр
    const calculatedPricePerMeter = area > 0 ? price / area : 0;
    setPricePerMeter(calculatedPricePerMeter);
    
    onChange({
      area,
      price,
      pricePerMeter: calculatedPricePerMeter,
      status,
      isVisible
    })
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="col-span-1">
          <label htmlFor="area" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
            Площадь (м²)
          </label>
          <input
            type="text"
            id="area"
            value={formatNumber(area)}
            onChange={(e) => {
              const newArea = parseNumber(e.target.value)
              setArea(newArea)
              handleChange()
            }}
            className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white p-2"
          />
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
              setPrice(newPrice)
              handleChange()
            }}
            className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white p-2"
          />
        </div>

        <div className="col-span-1">
          <label htmlFor="pricePerMeter" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
            Цена за м² (₽)
          </label>
          <input
            type="text"
            id="pricePerMeter"
            value={formatNumber(pricePerMeter)}
            onChange={(e) => {
              const newPricePerMeter = parseNumber(e.target.value)
              setPricePerMeter(newPricePerMeter)
              handleChange()
            }}
            className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white p-2"
          />
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
              handleChange()
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
              handleChange()
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