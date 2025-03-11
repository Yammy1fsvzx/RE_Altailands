'use client'

import { useState } from 'react'
import { Plot, PlotMedia, PlotDocument, PlotCadastral, PlotCommunication, PlotFeature } from '@prisma/client'
import { useRouter } from 'next/navigation'
import PlotMediaUpload from './PlotMediaUpload'
import PlotDescriptionForm from './PlotDescriptionForm'
import PlotLocationForm from './PlotLocationForm'
import PlotFeaturesForm from './PlotFeaturesForm'
import PlotPriceForm from './PlotPriceForm'

type PlotEditFormProps = {
  plot: Plot & {
    media: PlotMedia[]
    documents: PlotDocument[]
    cadastralNumbers: PlotCadastral[]
    communications: PlotCommunication[]
    features: PlotFeature[]
  }
}

type SimpleCommunication = {
  name: string
}

type SimpleFeature = {
  name: string
}

type FormData = Plot & {
  documents: (File | PlotDocument)[]
  cadastralNumbers: (Omit<PlotCadastral, 'id' | 'createdAt' | 'updatedAt' | 'plotId'> | PlotCadastral)[]
  communications: SimpleCommunication[]
  features: SimpleFeature[]
}

export default function PlotEditForm({ plot }: PlotEditFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [media, setMedia] = useState<(File | PlotMedia)[]>(plot.media)
  const [formData, setFormData] = useState<FormData>({
    ...plot,
    documents: plot.documents,
    cadastralNumbers: plot.cadastralNumbers,
    communications: plot.communications.map(comm => ({ name: comm.name })),
    features: plot.features.map(feat => ({ name: feat.name }))
  })

  const handleMediaChange = (newMedia: (File | PlotMedia)[]) => {
    setMedia(newMedia)
  }

  const handleDescriptionChange = (data: {
    title: string
    slug: string
    description: string
    documents: (File | PlotDocument)[]
  }) => {
    setFormData(prev => ({
      ...prev,
      title: data.title,
      slug: data.slug,
      description: data.description,
      documents: data.documents
    }))
  }

  const handleLocationChange = (data: {
    region: string
    locality: string
    cadastralNumbers: (Omit<PlotCadastral, 'id' | 'createdAt' | 'updatedAt' | 'plotId'> | PlotCadastral)[]
  }) => {
    setFormData(prev => ({
      ...prev,
      region: data.region,
      locality: data.locality,
      cadastralNumbers: data.cadastralNumbers
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

  const handlePriceChange = (data: {
    area: number
    price: number
    pricePerMeter: number
    status: 'AVAILABLE' | 'RESERVED' | 'SOLD'
    isVisible: boolean
  }) => {
    setFormData(prev => ({
      ...prev,
      area: data.area,
      price: data.price,
      pricePerMeter: data.pricePerMeter,
      status: data.status,
      isVisible: data.isVisible
    }))
  }

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true)

      const formDataToSend = new FormData()
      
      // Добавляем основные данные
      const dataToSend = {
        ...formData,
        communications: formData.communications.map(comm => ({
          ...comm,
          type: 'default',
          description: ''
        })),
        features: formData.features.map(feat => ({
          ...feat,
          title: feat.name,
          description: ''
        })),
        media: media.map((file, index) => {
          if (file instanceof File) {
            return { order: index }
          }
          return { ...file, order: index }
        }).filter(file => !(file instanceof File))
      }
      
      formDataToSend.append('data', JSON.stringify(dataToSend))

      // Добавляем новые медиафайлы
      media.forEach((file, index) => {
        if (file instanceof File) {
          formDataToSend.append(`media_${index}`, file)
        }
      })

      // Добавляем новые документы
      formData.documents.forEach((doc, index) => {
        if (doc instanceof File) {
          formDataToSend.append(`document_${index}`, doc)
        }
      })

      const response = await fetch(`/api/admin/plots/${plot.id}`, {
        method: 'PUT',
        body: formDataToSend
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Ошибка при сохранении участка: ${errorText}`)
      }

      router.push('/admin/plots')
      router.refresh()
    } catch (error) {
      console.error('Error details:', error)
      alert('Произошла ошибка при сохранении участка')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Вы уверены, что хотите удалить этот участок?')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/plots/${plot.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Ошибка при удалении участка')
      }

      router.push('/admin/plots')
      router.refresh()
    } catch (error) {
      console.error('Error deleting plot:', error)
      alert('Ошибка при удалении участка')
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => router.push('/admin/plots')}
            className="btn-secondary"
          >
            Назад к списку
          </button>
          <h1 className="text-2xl font-semibold">
            Редактирование участка
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={handleDelete}
            className="btn-danger"
          >
            Удалить участок
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="btn-primary"
          >
            {isSubmitting ? 'Сохранение...' : 'Сохранить'}
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg">
        <div className="p-6 space-y-8">
          {/* Медиафайлы */}
          <section>
            <h2 className="text-xl font-semibold mb-4">Медиафайлы</h2>
            <PlotMediaUpload
              initialMedia={media as PlotMedia[]}
              onMediaChange={handleMediaChange}
            />
          </section>

          <hr className="border-gray-200 dark:border-gray-700" />

          {/* Описание */}
          <section>
            <h2 className="text-xl font-semibold mb-4">Описание</h2>
            <PlotDescriptionForm
              plot={{
                ...formData,
                documents: formData.documents.filter((doc): doc is PlotDocument => !(doc instanceof File))
              }}
              onChange={handleDescriptionChange}
            />
          </section>

          <hr className="border-gray-200 dark:border-gray-700" />

          {/* Расположение */}
          <section>
            <h2 className="text-xl font-semibold mb-4">Расположение</h2>
            <PlotLocationForm
              plot={{
                ...formData,
                cadastralNumbers: formData.cadastralNumbers.filter((num): num is PlotCadastral => 'id' in num)
              }}
              onChange={handleLocationChange}
            />
          </section>

          <hr className="border-gray-200 dark:border-gray-700" />

          {/* Характеристики */}
          <section>
            <h2 className="text-xl font-semibold mb-4">Характеристики</h2>
            <PlotFeaturesForm
              plot={{
                landUseType: formData.landUseType,
                landCategory: formData.landCategory,
                communications: formData.communications,
                features: formData.features
              }}
              onChange={handleFeaturesChange}
            />
          </section>

          <hr className="border-gray-200 dark:border-gray-700" />

          {/* Цена */}
          <section>
            <h2 className="text-xl font-semibold mb-4">Цена и статус</h2>
            <PlotPriceForm
              plot={formData}
              onChange={handlePriceChange}
            />
          </section>
        </div>
      </div>
    </div>
  )
} 