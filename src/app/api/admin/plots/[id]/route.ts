import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import prisma from '@/lib/prisma'
import { uploadFile } from '@/lib/upload'
import { requireAdmin } from '@/lib/auth'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

interface PlotUpdateData {
  title: string
  description: string
  price: number
  area: number
  status: string
  region: string
  locality: string
  address: string
  cadastralNumber: string
  landUseType: string
  landCategory: string
  latitude: number
  longitude: number
  isVisible: boolean
  slug: string
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    await requireAdmin()

    const formData = await request.formData()
    const data = JSON.parse(formData.get('data') as string)
    
    // Базовые данные участка
    const plotData: PlotUpdateData = {
      title: data.title,
      description: data.description,
      price: data.price,
      area: data.area,
      status: data.status,
      region: data.region,
      locality: data.locality,
      address: data.address,
      cadastralNumber: data.cadastralNumber,
      landUseType: data.landUseType,
      landCategory: data.landCategory,
      latitude: data.latitude,
      longitude: data.longitude,
      isVisible: data.isVisible,
      slug: data.slug
    }

    // Проверяем обязательные поля
    const requiredFields = ['title', 'slug', 'area', 'price'];
    for (const field of requiredFields) {
      if (!plotData[field as keyof PlotUpdateData] && plotData[field as keyof PlotUpdateData] !== 0) {
        return NextResponse.json(
          { 
            error: `Поле ${field} обязательно для заполнения`,
            field
          },
          { status: 400 }
        )
      }
    }

    // Валидация числовых полей
    const numericFields = [
      { name: 'area', min: 0, message: 'Площадь участка не может быть отрицательной' },
      { name: 'price', min: 0, message: 'Цена участка не может быть отрицательной' },
      { name: 'pricePerMeter', min: 0, message: 'Цена за сотку не может быть отрицательной' }
    ];

    for (const field of numericFields) {
      const value = data[field.name];
      if (value !== undefined && value < field.min) {
        return NextResponse.json(
          { 
            error: field.message,
            field: field.name
          },
          { status: 400 }
        )
      }
    }

    // Проверяем изменения в данных перед сохранением
    const existingPlot = await prisma.plot.findUnique({
      where: { id }
    });
    
    if (!existingPlot) {
      return NextResponse.json(
        { error: 'Участок не найден' },
        { status: 404 }
      )
    }

    // Проверяем, изменилась ли цена и логируем это
    if (existingPlot.price !== plotData.price) {
      console.log(`Цена участка ${existingPlot.title} изменена с ${existingPlot.price} на ${plotData.price}`);
      // Здесь можно добавить дополнительную логику, например, логирование в БД
    }

    // Проверяем уникальность slug только если он указан
    if (plotData.slug) {
      const existingPlot = await prisma.plot.findFirst({
        where: { 
          AND: [
            { slug: plotData.slug },
            { id: { not: id } }
          ]
        }
      })

      if (existingPlot) {
        return NextResponse.json(
          { error: 'Участок с таким URL уже существует' },
          { status: 400 }
        )
      }
    }

    // Обновляем основные данные участка
    const plot = await prisma.plot.update({
      where: { id },
      data: plotData
    })

    // Обработка медиафайлов
    const mediaFiles = []
    const mediaToDelete = data.mediaToDelete || []
    const mediaOrder = data.media || []

    // Удаляем отмеченные файлы
    if (mediaToDelete.length > 0) {
      await prisma.plotMedia.deleteMany({
        where: {
          id: {
            in: mediaToDelete
          }
        }
      })
    }

    // Обновляем порядок существующих файлов
    for (const [index, item] of mediaOrder.entries()) {
      if (item.id) {
        await prisma.plotMedia.update({
          where: { id: item.id },
          data: { order: index }  // Используем индекс массива для порядка
        })
        
        // Дополнительно логируем обновление порядка для отладки
        console.log(`Обновляем медиафайл ${item.id}, новый порядок: ${index}`)
      }
    }

    // Обрабатываем новые файлы
    for (const [key, value] of formData.entries()) {
      if (key.startsWith('media_') && value instanceof File) {
        const order = parseInt(key.split('_')[1])
        const file = value as File
        
        // Создаем директорию, если её нет
        const uploadDir = join(process.cwd(), 'public', 'uploads')
        if (!existsSync(uploadDir)) {
          await mkdir(uploadDir, { recursive: true })
        }

        // Сохраняем файл
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)
        const fileName = `${Date.now()}-${file.name}`
        const filePath = join(uploadDir, fileName)
        await writeFile(filePath, buffer)

        // Создаем запись в БД
        const media = await prisma.plotMedia.create({
          data: {
            plotId: plot.id,
            name: file.name,
            type: file.type,
            url: `/uploads/${fileName}`,
            order: order
          }
        })
        mediaFiles.push(media)
      }
    }

    // Обработка документов
    const documentFiles = []
    const documentsToKeep = (data.documents || []).filter((doc: any) => doc.id)
    const documentIds = documentsToKeep.map((doc: any) => doc.id)

    // Удаляем документы, которых нет в списке
    await prisma.plotDocument.deleteMany({
      where: {
        AND: [
          { plotId: plot.id },
          { id: { notIn: documentIds } }
        ]
      }
    })

    // Обрабатываем новые документы
    for (const [key, value] of formData.entries()) {
      if (key.startsWith('document_') && value instanceof File) {
        const file = value as File
        
        // Создаем директорию, если её нет
        const uploadDir = join(process.cwd(), 'public', 'uploads')
        if (!existsSync(uploadDir)) {
          await mkdir(uploadDir, { recursive: true })
        }

        // Сохраняем файл
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)
        const fileName = `${Date.now()}-${file.name}`
        const filePath = join(uploadDir, fileName)
        await writeFile(filePath, buffer)

        // Создаем запись в БД
        const document = await prisma.plotDocument.create({
          data: {
            plotId: plot.id,
            name: file.name,
            title: file.name.split('.').slice(0, -1).join('.'),
            url: `/uploads/${fileName}`
          }
        })
        documentFiles.push(document)
      }
    }

    // Обновляем коммуникации
    if (data.communications) {
      // Удаляем старые коммуникации
      await prisma.plotCommunication.deleteMany({
        where: { plotId: plot.id }
      })

      // Добавляем новые
      if (data.communications.length > 0) {
        await prisma.plotCommunication.createMany({
          data: data.communications.map((comm: any) => ({
            ...comm,
            plotId: plot.id
          }))
        })
      }
    }

    // Обновляем особенности
    if (data.features) {
      // Удаляем старые особенности
      await prisma.plotFeature.deleteMany({
        where: { plotId: plot.id }
      })

      // Добавляем новые
      if (data.features.length > 0) {
        await prisma.plotFeature.createMany({
          data: data.features.map((feat: any) => ({
            ...feat,
            plotId: plot.id
          }))
        })
      }
    }

    // Получаем обновленный участок со всеми связями
    const updatedPlot = await prisma.plot.findUnique({
      where: { id: plot.id },
      include: {
        media: {
          orderBy: { order: 'asc' }
        },
        documents: true,
        cadastralNumbers: true,
        communications: true,
        features: true
      }
    })

    return NextResponse.json({ success: true, plot: updatedPlot })
  } catch (error) {
    console.error('Error updating plot:', error)
    return NextResponse.json(
      { error: 'Failed to update plot' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    await requireAdmin()
    await prisma.plot.delete({
      where: { id }
    })
    return new NextResponse(null, { status: 204 })
  } catch (error) {
    return new NextResponse('Error deleting plot', { status: 500 })
  }
} 