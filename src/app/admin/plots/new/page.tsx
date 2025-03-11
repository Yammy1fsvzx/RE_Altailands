import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { mkdir, writeFile } from 'fs/promises'
import { join } from 'path'
import prisma from '@/lib/prisma'
import PlotForm from '@/components/admin/PlotForm'
import { requireAdmin } from '@/lib/auth'
import { PlotFormData } from '@/types/plot'
import { slugify } from '@/lib/utils'

export const metadata: Metadata = {
  title: 'Создание участка | Админ-панель',
}

export default async function NewPlotPage() {
  await requireAdmin()

  async function createPlot(formData: PlotFormData) {
    'use server'
    
    try {
      // Создаем базовый slug из заголовка
      const slug = slugify(formData.title)
      
      // Проверяем существование участка с таким slug
      const existing = await prisma.plot.findUnique({
        where: { slug }
      })
      
      if (existing) {
        throw new Error(`Участок с названием "${formData.title}" уже существует. Пожалуйста, измените название.`)
      }

      // Создаем участок
      const plot = await prisma.plot.create({
        data: {
          title: formData.title,
          slug: slug,
          description: formData.description || '',
          area: formData.area,
          price: formData.price,
          pricePerMeter: formData.pricePerMeter,
          region: formData.region,
          locality: formData.locality,
          landUseType: formData.landUseType,
          landCategory: formData.landCategory,
          status: formData.status,
          isVisible: formData.isVisible,
          cadastralNumbers: {
            create: formData.cadastralNumbers.map((num) => ({
              number: 'number' in num ? num.number : num
            }))
          },
          communications: {
            create: formData.communications.map((comm) => ({
              name: comm.name,
              type: 'default',
              description: ''
            }))
          },
          features: {
            create: formData.features.map((feat) => ({
              name: feat.name,
              title: feat.name,
              description: ''
            }))
          }
        }
      })

      // Обрабатываем медиафайлы
      const mediaFiles = formData.media.filter((file): file is File => file instanceof File)

      // Загружаем медиафайлы
      for (let i = 0; i < mediaFiles.length; i++) {
        const file = mediaFiles[i]
        
        // Создаем директорию для файлов, если её нет
        const uploadDir = './public/uploads/plots'
        await mkdir(uploadDir, { recursive: true })
        
        // Генерируем уникальное имя файла
        const fileName = `${Date.now()}-${file.name}`
        const filePath = join(uploadDir, fileName)
        
        // Сохраняем файл
        const buffer = Buffer.from(await file.arrayBuffer())
        await writeFile(filePath, buffer)
        
        // Создаем запись в базе данных
        await prisma.plotMedia.create({
          data: {
            name: file.name,
            url: `/uploads/plots/${fileName}`,
            type: file.type,
            order: i,
            plotId: plot.id
          }
        })
      }

      // Обрабатываем документы
      const documentFiles = formData.documents.filter((file): file is File => file instanceof File)

      // Загружаем документы
      for (const file of documentFiles) {
        // Создаем директорию для документов, если её нет
        const uploadDir = './public/uploads/documents'
        await mkdir(uploadDir, { recursive: true })
        
        // Генерируем уникальное имя файла
        const fileName = `${Date.now()}-${file.name}`
        const filePath = join(uploadDir, fileName)
        
        // Сохраняем файл
        const buffer = Buffer.from(await file.arrayBuffer())
        await writeFile(filePath, buffer)
        
        // Создаем запись в базе данных
        await prisma.plotDocument.create({
          data: {
            name: file.name,
            url: `/uploads/documents/${fileName}`,
            plotId: plot.id
          }
        })
      }

      redirect('/admin/plots')
    } catch (error) {
      // Перехватываем ошибку и возвращаем понятное сообщение
      if (error instanceof Error) {
        throw new Error(error.message)
      }
      throw new Error('Произошла ошибка при создании участка')
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <PlotForm onSubmit={createPlot} />
    </div>
  )
} 