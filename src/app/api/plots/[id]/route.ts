import { NextResponse } from 'next/server'
import { mkdir, writeFile } from 'fs/promises'
import { join } from 'path'
import prisma from '@/lib/prisma'
import { slugify } from '@/lib/utils'
import { PlotFormData } from '@/types/plot'
import { PlotDocument, PlotMedia } from '@prisma/client'

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const formData = await request.formData()
    
    // Получаем JSON данные
    const jsonData = JSON.parse(formData.get('data') as string) as PlotFormData & { plotId: string }
    
    // Получаем файлы
    const mediaFiles: File[] = []
    const documentFiles: File[] = []
    
    for (const [key, value] of formData.entries()) {
      if (key.startsWith('media_') && value instanceof File) {
        mediaFiles.push(value)
      }
      if (key.startsWith('document_') && value instanceof File) {
        documentFiles.push(value)
      }
    }

    // Получаем актуальные данные участка
    const currentPlot = await prisma.plot.findUnique({
      where: { id },
      include: {
        media: {
          orderBy: { order: 'asc' }
        },
        documents: true
      }
    })

    if (!currentPlot) {
      return NextResponse.json(
        { error: 'Участок не найден' },
        { status: 404 }
      )
    }

    // Создаем slug из заголовка
    const slug = slugify(jsonData.title)
    
    // Обновляем основные данные участка
    await prisma.plot.update({
      where: { id: currentPlot.id },
      data: {
        title: jsonData.title,
        slug: slug,
        description: jsonData.description || '',
        area: jsonData.area,
        price: jsonData.price,
        pricePerMeter: jsonData.pricePerMeter,
        region: jsonData.region,
        locality: jsonData.locality,
        landUseType: jsonData.landUseType,
        landCategory: jsonData.landCategory,
        status: jsonData.status,
        isVisible: jsonData.isVisible
      }
    })

    // Обновляем кадастровые номера
    await prisma.plotCadastral.deleteMany({
      where: { plotId: currentPlot.id }
    })
    await prisma.plotCadastral.createMany({
      data: jsonData.cadastralNumbers.map((num) => ({
        number: 'number' in num ? num.number : num,
        plotId: currentPlot.id
      }))
    })

    // Обновляем коммуникации
    await prisma.plotCommunication.deleteMany({
      where: { plotId: currentPlot.id }
    })
    await prisma.plotCommunication.createMany({
      data: jsonData.communications.map((comm) => ({
        name: comm.name,
        type: 'default',
        description: '',
        plotId: currentPlot.id
      }))
    })

    // Обновляем особенности
    await prisma.plotFeature.deleteMany({
      where: { plotId: currentPlot.id }
    })
    await prisma.plotFeature.createMany({
      data: jsonData.features.map((feat) => ({
        name: feat.name,
        title: feat.name,
        description: '',
        plotId: currentPlot.id
      }))
    })

    // Обрабатываем медиафайлы
    const existingMedia = jsonData.media.filter((file): file is PlotMedia => file !== null)

    // Находим ID медиафайлов, которые нужно удалить
    const existingMediaIds = existingMedia.map(m => m.id)
    const mediaToDelete = currentPlot.media.filter((m: PlotMedia) => !existingMediaIds.includes(m.id))

    // Удаляем неиспользуемые медиафайлы
    if (mediaToDelete.length > 0) {
      await prisma.plotMedia.deleteMany({
        where: {
          id: { in: mediaToDelete.map((m: PlotMedia) => m.id) }
        }
      })
    }

    // Обновляем порядок и данные существующих медиафайлов
    const mediaUpdates = existingMedia.map((media, index) => 
      prisma.plotMedia.update({
        where: { id: media.id },
        data: {
          order: index,
          name: media.name,
          type: media.type,
          url: media.url
        }
      })
    )
    await Promise.all(mediaUpdates)

    // Загружаем новые медиафайлы
    const newMediaUploads = mediaFiles.map(async (file, i) => {
      // Создаем директорию для файлов, если её нет
      const uploadDir = './public/uploads/plots'
      await mkdir(uploadDir, { recursive: true })
      
      // Генерируем уникальное имя файла
      const fileName = `${Date.now()}-${file.name}`
      const filePath = join(uploadDir, fileName)
      
      // Сохраняем файл
      const buffer = Buffer.from(await file.arrayBuffer())
      await writeFile(filePath, buffer)
      
      // Создаем запись в базе данных с правильным порядком
      // Новые файлы добавляются после существующих
      return prisma.plotMedia.create({
        data: {
          name: file.name,
          url: `/uploads/plots/${fileName}`,
          type: file.type,
          order: existingMedia.length + i, // Порядок после существующих файлов
          plotId: currentPlot.id
        }
      })
    })
    await Promise.all(newMediaUploads)

    // Обрабатываем документы
    const existingDocs = jsonData.documents.filter((file): file is PlotDocument => file !== null)

    // Находим ID документов, которые нужно удалить
    const existingDocIds = existingDocs.map(d => d.id)
    const docsToDelete = currentPlot.documents.filter((d: PlotDocument) => !existingDocIds.includes(d.id))

    // Удаляем неиспользуемые документы
    if (docsToDelete.length > 0) {
      await prisma.plotDocument.deleteMany({
        where: {
          id: { in: docsToDelete.map((d: PlotDocument) => d.id) }
        }
      })
    }

    // Обновляем существующие документы
    const docUpdates = existingDocs.map(doc => 
      prisma.plotDocument.update({
        where: { id: doc.id },
        data: {
          name: doc.name,
          title: doc.title,
          url: doc.url
        }
      })
    )
    await Promise.all(docUpdates)

    // Загружаем новые документы
    const newDocUploads = documentFiles.map(async (file) => {
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
      return prisma.plotDocument.create({
        data: {
          name: file.name,
          title: file.name,
          url: `/uploads/documents/${fileName}`,
          plotId: currentPlot.id
        }
      })
    })
    await Promise.all(newDocUploads)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating plot:', error)
    return NextResponse.json(
      { error: 'Ошибка при обновлении участка' },
      { status: 500 }
    )
  }
} 