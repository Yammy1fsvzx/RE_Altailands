'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plot, PlotMedia, PlotDocument, PlotCadastral, PlotCommunication, PlotFeature, PlotStatus } from '@prisma/client'
import { useRouter } from 'next/navigation'
import PlotMediaUpload from './PlotMediaUpload'
import PlotDescriptionForm from './PlotDescriptionForm'
import PlotLocationForm from './PlotLocationForm'
import PlotFeaturesForm from './PlotFeaturesForm'
import PlotPriceForm from './PlotPriceForm'
import { useNotification } from '@/contexts/NotificationContext'
import { PlotFormData } from '@/types/plot'
import { useDropzone } from 'react-dropzone'
import { DndProvider, useDrag, useDrop } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { DragSourceMonitor } from 'react-dnd'
import Image from 'next/image'
import {
  XMarkIcon,
  ArrowsUpDownIcon,
  PhotoIcon,
  DocumentTextIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  TagIcon,
  EyeIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline'

type PlotFormProps = {
  plot?: Plot & {
    media: PlotMedia[]
    documents: PlotDocument[]
    cadastralNumbers: PlotCadastral[]
    communications: PlotCommunication[]
    features: PlotFeature[]
  } | null
  onSubmit: (data: PlotFormData) => Promise<void>
}

type SimpleCommunication = {
  name: string
}

type SimpleFeature = {
  name: string
}

const defaultFormData: PlotFormData = {
  title: '',
  slug: '',
  description: '',
  media: [],
  documents: [],
  region: '',
  locality: '',
  cadastralNumbers: [],
  landUseType: '',
  landCategory: '',
  communications: [],
  features: [],
  area: 0,
  price: 0,
  pricePerMeter: 0,
  status: 'AVAILABLE',
  isVisible: true
}

// Добавляем функцию для генерации уникального ID
const generateUniqueId = () => `new_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

// Компонент для перетаскиваемого изображения
const DraggableImage = ({ 
  media, 
  index, 
  moveImage, 
  onRemove 
}: { 
  media: PlotMedia | File, 
  index: number, 
  moveImage: (dragIndex: number, hoverIndex: number) => void,
  onRemove: () => void 
}) => {
  const [{ isDragging }, dragRef] = useDrag({
    type: 'IMAGE',
    item: { index },
    collect: (monitor: DragSourceMonitor) => ({
      isDragging: monitor.isDragging(),
    }),
  })

  const [, dropRef] = useDrop({
    accept: 'IMAGE',
    hover(item: { index: number }) {
      if (item.index === index) {
        return
      }
      moveImage(item.index, index)
      item.index = index
    },
  })

  const [showControls, setShowControls] = useState(false)
  const url = media instanceof File 
    ? URL.createObjectURL(media) 
    : media.url

  // Обработчики для мобильных устройств
  const handleTouchStart = () => {
    setShowControls(true)
  }

  const handleMoveUp = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (index > 0) {
      moveImage(index, index - 1)
    }
  }

  const handleMoveDown = (e: React.MouseEvent) => {
    e.stopPropagation()
    moveImage(index, index + 1)
  }

  return (
    <div
      ref={(node) => {
        dragRef(node)
        dropRef(node)
      }}
      onTouchStart={handleTouchStart}
      className={`relative group border rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 transition-all ${
        isDragging ? 'opacity-50 scale-95' : ''
      }`}
    >
      <div className="relative aspect-[4/3]">
        <Image
          src={url}
          alt={media instanceof File ? media.name : media.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform group-hover:scale-105"
        />
        
        {/* Оверлей с контролами */}
        <div 
          className={`absolute inset-0 bg-black/60 flex items-center justify-center gap-2
            ${showControls || isDragging ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}
            transition-opacity duration-200`}
        >
          {/* Контролы для мобильных устройств */}
          <div className="flex flex-col items-center gap-2 sm:hidden">
            <button
              type="button"
              onClick={handleMoveUp}
              disabled={index === 0}
              className="p-2 bg-white/20 rounded-full hover:bg-white/30 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
            </button>
            <button
              type="button"
              onClick={onRemove}
              className="p-2 bg-red-500/80 rounded-full hover:bg-red-500"
            >
              <XMarkIcon className="w-6 h-6 text-white" />
            </button>
            <button
              type="button"
              onClick={handleMoveDown}
              className="p-2 bg-white/20 rounded-full hover:bg-white/30"
            >
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>

          {/* Контролы для десктопа */}
          <div className="hidden sm:flex items-center gap-2">
            <button
              type="button"
              onClick={onRemove}
              className="p-2 bg-red-500/80 rounded-full hover:bg-red-500 transition-colors"
            >
              <XMarkIcon className="w-5 h-5 text-white" />
            </button>
            <div className="p-2 bg-white/20 rounded-full">
              <ArrowsUpDownIcon className="w-5 h-5 text-white cursor-move" />
            </div>
          </div>
        </div>

        {/* Индикатор порядка */}
        <div className="absolute top-2 left-2 bg-black/60 text-white text-sm px-2 py-1 rounded-full">
          {index + 1}
        </div>
      </div>
    </div>
  )
}

export default function PlotForm({ plot, onSubmit }: PlotFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [media, setMedia] = useState<(File | PlotMedia)[]>([])
  const [formData, setFormData] = useState<PlotFormData>(defaultFormData)
  const [isClient, setIsClient] = useState(false)
  const { showNotification } = useNotification()

  // Устанавливаем флаг, что мы на клиенте
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Инициализация данных из пропсов
  useEffect(() => {
    if (plot) {
      const initialMedia = plot.media.map(m => ({
        ...m,
        type: m.type || 'image/jpeg' // Добавляем тип по умолчанию для существующих файлов
      }))
      setFormData({
        title: plot.title,
        slug: plot.slug,
        description: plot.description || '',
        media: initialMedia,
        documents: plot.documents,
        region: plot.region,
        locality: plot.locality,
        cadastralNumbers: plot.cadastralNumbers,
        landUseType: plot.landUseType,
        landCategory: plot.landCategory,
        communications: plot.communications,
        features: plot.features,
        area: plot.area,
        price: plot.price,
        pricePerMeter: plot.pricePerMeter,
        status: plot.status,
        isVisible: plot.isVisible
      })
      setMedia(initialMedia)
    }
  }, [plot])

  const handleMediaChange = (newMedia: (File | PlotMedia)[]) => {
    setMedia(newMedia)
    setFormData(prev => ({ ...prev, media: newMedia }))
  }

  const handleDescriptionChange = (data: Pick<PlotFormData, 'title' | 'slug' | 'description' | 'documents'>) => {
    setFormData(prev => ({
      ...prev,
      ...data,
      description: (data.description?.trim() || '') === '' ? '' : data.description
    }))
  }

  const handleLocationChange = (data: Pick<PlotFormData, 'region' | 'locality' | 'cadastralNumbers'>) => {
    setFormData(prev => ({
      ...prev,
      ...data
    }))
  }

  const handleFeaturesChange = (data: {
    landUseType: string
    landCategory: string
    communications: SimpleCommunication[]
    features: SimpleFeature[]
  }) => {
    setFormData(prev => ({
      ...prev,
      landUseType: data.landUseType,
      landCategory: data.landCategory,
      communications: data.communications,
      features: data.features
    }))
  }

  const handlePriceChange = (data: Pick<PlotFormData, 'area' | 'price' | 'pricePerMeter' | 'status' | 'isVisible'>) => {
    setFormData(prev => ({
      ...prev,
      ...data
    }))
  }

  // Функция для перемещения изображений
  const moveImage = useCallback((dragIndex: number, hoverIndex: number) => {
    setFormData((prev) => {
      const newMedia = [...prev.media]
      const dragItem = newMedia[dragIndex]
      newMedia.splice(dragIndex, 1)
      newMedia.splice(hoverIndex, 0, dragItem)
      return { ...prev, media: newMedia }
    })
  }, [])

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFormData(prev => ({
      ...prev,
      media: [...prev.media, ...acceptedFiles]
    }))
  }, [])

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp'],
      'video/*': ['.mp4', '.webm']
    }
  })

  const removeMedia = (index: number) => {
    setFormData(prev => ({
      ...prev,
      media: prev.media.filter((_, i) => i !== index)
    }))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    try {
      setIsSubmitting(true)
      await onSubmit(formData)
      showNotification(
        plot ? 'Участок успешно обновлен' : 'Участок успешно создан',
        'success'
      )
      router.push('/admin/plots')
      router.refresh()
    } catch (error) {
      console.error('Error details:', error)
      showNotification(
        error instanceof Error ? error.message : 'Произошла ошибка при сохранении участка',
        'error'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    if (window.confirm('Вы уверены, что хотите отменить? Все несохраненные изменения будут потеряны.')) {
      router.push('/admin/plots')
    }
  }

  const handleDelete = async () => {
    if (!plot || !confirm('Вы уверены, что хотите удалить этот участок?')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/plots/${plot.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Ошибка при удалении участка')
      }

      showNotification('Участок успешно удален', 'success')
      router.push('/admin/plots')
      router.refresh()
    } catch (error) {
      console.error('Error deleting plot:', error)
      showNotification('Ошибка при удалении участка', 'error')
    }
  }

  if (!isClient) {
    return null
  }

  const now = new Date()
  const baseData = {
    ...formData,
    id: generateUniqueId(),
    createdAt: now,
    updatedAt: now,
  } as Plot & {
    media: PlotMedia[]
    documents: PlotDocument[]
    cadastralNumbers: PlotCadastral[]
    communications: PlotCommunication[]
    features: PlotFeature[]
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <form onSubmit={handleSubmit} className="pb-24 sm:pb-28">
        {/* Основное содержимое */}
        <div className="max-w-[1920px] mx-auto py-6">
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Левая колонка */}
            <div className="xl:col-span-2 space-y-6">
              {/* Медиафайлы */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
                <div className="p-6 border-b dark:border-gray-700">
                  <div className="flex items-center gap-2">
                    <PhotoIcon className="w-6 h-6 text-gray-400" />
                    <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                      Медиафайлы
                    </h2>
                  </div>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {formData.media.map((media, index) => (
                      <DraggableImage
                        key={media instanceof File ? media.name : media.id}
                        media={media}
                        index={index}
                        moveImage={moveImage}
                        onRemove={() => removeMedia(index)}
                      />
                    ))}
                    <div
                      {...getRootProps()}
                      className="border-2 border-dashed dark:border-gray-600 rounded-xl aspect-[4/3] flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 dark:hover:border-blue-400 transition-colors"
                    >
                      <input {...getInputProps()} />
                      <div className="text-center p-4">
                        <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                          Перетащите файлы сюда или кликните для выбора
                        </p>
                        <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                          PNG, JPG, WEBP до 10MB
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Основная информация */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
                <div className="p-6 border-b dark:border-gray-700">
                  <div className="flex items-center gap-2">
                    <DocumentTextIcon className="w-6 h-6 text-gray-400" />
                    <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                      Основная информация
                    </h2>
                  </div>
                </div>
                <div className="p-6">
                  <PlotDescriptionForm
                    plot={baseData}
                    onChange={handleDescriptionChange}
                  />
                </div>
              </div>
            </div>

            {/* Правая колонка */}
            <div className="space-y-6">
              {/* Расположение */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
                <div className="p-6 border-b dark:border-gray-700">
                  <div className="flex items-center gap-2">
                    <MapPinIcon className="w-6 h-6 text-gray-400" />
                    <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                      Расположение
                    </h2>
                  </div>
                </div>
                <div className="p-6">
                  <PlotLocationForm
                    plot={baseData}
                    onChange={handleLocationChange}
                  />
                </div>
              </div>

              {/* Характеристики */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
                <div className="p-6 border-b dark:border-gray-700">
                  <div className="flex items-center gap-2">
                    <TagIcon className="w-6 h-6 text-gray-400" />
                    <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                      Характеристики
                    </h2>
                  </div>
                </div>
                <div className="p-6">
                  <PlotFeaturesForm
                    plot={baseData}
                    onChange={handleFeaturesChange}
                  />
                </div>
              </div>

              {/* Цена и статус */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
                <div className="p-6 border-b dark:border-gray-700">
                  <div className="flex items-center gap-2">
                    <CurrencyDollarIcon className="w-6 h-6 text-gray-400" />
                    <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                      Цена и статус
                    </h2>
                  </div>
                </div>
                <div className="p-6">
                  <PlotPriceForm
                    plot={baseData}
                    onChange={handlePriceChange}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Плавающая панель навигации снизу */}
        <div className="fixed bottom-0 left-0 right-0 lg:left-64 z-50">
          {/* Градиентная тень сверху панели */}
          <div className="absolute inset-x-0 -top-6 h-6 bg-gradient-to-t from-gray-900/10 to-transparent" />

          {/* Основная панель с размытием */}
          <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-t dark:border-gray-800">
            <div className="max-w-[1920px] mx-auto">
              <div className="p-4 flex flex-col sm:flex-row items-center gap-4">
                {/* Левая часть */}
                <div className="flex items-center gap-3 w-full sm:w-auto order-2 sm:order-1">
                  <button
                    type="button"
                    onClick={() => router.push('/admin/plots')}
                    className="inline-flex items-center justify-center w-full sm:w-auto gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    <span className="hidden sm:inline">Назад к списку</span>
                  </button>
                  <h1 className="hidden sm:block text-lg font-semibold text-gray-900 dark:text-white">
                    {plot ? 'Редактирование участка' : 'Новый участок'}
                  </h1>
                </div>

                {/* Правая часть */}
                <div className="flex items-center gap-3 w-full sm:w-auto order-1 sm:order-2 sm:ml-auto">
                  {plot && (
                    <button
                      type="button"
                      onClick={handleDelete}
                      className="inline-flex items-center justify-center w-full sm:w-auto gap-2 px-4 py-2.5 text-sm font-medium text-red-600 hover:text-red-700 dark:text-red-500 dark:hover:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                    >
                      <XMarkIcon className="w-5 h-5" />
                      <span>Удалить</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="inline-flex items-center justify-center w-full sm:w-auto gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  >
                    Отмена
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex items-center justify-center w-full sm:w-auto gap-2 px-6 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        <span className="hidden sm:inline">Сохранение...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>{plot ? 'Сохранить' : 'Создать'}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </DndProvider>
  )
} 