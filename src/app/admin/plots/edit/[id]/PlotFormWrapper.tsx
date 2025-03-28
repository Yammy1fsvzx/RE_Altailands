'use client'

import { useRouter } from 'next/navigation'
import PlotForm from '@/components/admin/PlotForm'
import { PlotFormData } from '@/types/plot'
import { Plot, PlotCadastral, PlotCommunication, PlotDocument, PlotFeature, PlotMedia } from '@prisma/client'

type PlotWithRelations = Plot & {
  media: PlotMedia[]
  documents: PlotDocument[]
  cadastralNumbers: PlotCadastral[]
  communications: PlotCommunication[]
  features: PlotFeature[]
}

interface PlotFormWrapperProps {
  plot: PlotWithRelations
}

export default function PlotFormWrapper({ plot }: PlotFormWrapperProps) {
  const router = useRouter()

  async function handleSubmit(formData: PlotFormData) {
    try {
      // Создаем FormData для отправки файлов
      const form = new FormData()

      // Добавляем все основные данные как JSON
      form.append('data', JSON.stringify({
        ...formData,
        plotId: plot.id,
        media: formData.media.map((file, index) => {
          if ('id' in file) {
            return {
              ...file,
              order: index  // Явно добавляем порядок для каждого файла
            }
          }
          return null
        }).filter(Boolean),
        documents: formData.documents.map(file => {
          if ('id' in file) {
            return file
          }
          return null
        }).filter(Boolean)
      }))

      // Добавляем новые медиафайлы
      formData.media.forEach((file, index) => {
        if (file instanceof File) {
          form.append(`media_${index}`, file)
        }
      })

      // Добавляем новые документы
      formData.documents.forEach((file, index) => {
        if (file instanceof File) {
          form.append(`document_${index}`, file)
        }
      })

      const response = await fetch('/api/admin/plots/' + plot.id, {
        method: 'PUT',
        body: form
      })

      if (!response.ok) {
        throw new Error('Ошибка при обновлении участка')
      }

      // Возвращаем успешный результат
      return { success: true, id: plot.id };
    } catch (error) {
      console.error('Ошибка:', error)
      if (error instanceof Error) {
        throw new Error(error.message)
      }
      throw new Error('Произошла ошибка при сохранении участка')
    }
  }

  return <PlotForm plot={plot} onSubmit={handleSubmit} />
} 