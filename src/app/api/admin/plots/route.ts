import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import prisma from '@/lib/prisma'
import { uploadFile } from '@/lib/upload'
import { requireAdmin } from '@/lib/auth'
import { options } from '../../auth/[...nextauth]/options'

export async function POST(request: Request) {
  try {
    // Получаем сессию напрямую для отладки
    const session = await getServerSession(options)
    
    // Проверяем авторизацию
    try {
      await requireAdmin()
    } catch (authError) {
      console.error('Auth error:', authError)
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const formData = await request.formData()
    const data = JSON.parse(formData.get('data') as string)

    // Проверяем обязательные поля
    const requiredFields = ['title', 'slug', 'area', 'price'];
    for (const field of requiredFields) {
      if (!data[field] && data[field] !== 0) {
        return new NextResponse(
          JSON.stringify({ 
            error: `Поле ${field} обязательно для заполнения`,
            field
          }), 
          { 
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          }
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
      if (data[field.name] < field.min) {
        return new NextResponse(
          JSON.stringify({ 
            error: field.message,
            field: field.name
          }), 
          { 
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          }
        )
      }
    }

    // Проверяем уникальность slug
    const existingPlot = await prisma.plot.findUnique({
      where: { slug: data.slug }
    })

    if (existingPlot) {
      return new NextResponse(
        JSON.stringify({ 
          error: 'Участок с таким URL уже существует',
          field: 'slug'
        }), 
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    // Создаем участок с основными данными
    const plot = await prisma.plot.create({
      data: {
        title: data.title,
        slug: data.slug,
        description: data.description,
        region: data.region,
        locality: data.locality,
        landUseType: data.landUseType,
        landCategory: data.landCategory,
        area: data.area,
        price: data.price,
        pricePerMeter: data.pricePerMeter,
        status: data.status,
        isVisible: data.isVisible
      }
    })

    // Загружаем и создаем медиафайлы
    const mediaFiles = Array.from(formData.entries())
      .filter(([key]) => key.startsWith('media_'))
      .map(([key, file]) => ({ 
        file: file as File, 
        order: parseInt(key.split('_')[1])
      }))

    for (const { file, order } of mediaFiles) {
      const url = await uploadFile(file)
      await prisma.plotMedia.create({
        data: {
          url,
          order,
          name: file.name,
          type: file.type || 'image/jpeg',
          plotId: plot.id
        }
      })
    }

    // Загружаем и создаем документы
    const documentFiles = Array.from(formData.entries())
      .filter(([key]) => key.startsWith('document_'))
      .map(([_, file]) => file as File)

    for (const file of documentFiles) {
      const url = await uploadFile(file)
      await prisma.plotDocument.create({
        data: {
          name: file.name,
          title: file.name.split('.')[0],
          url,
          plotId: plot.id
        }
      })
    }

    // Создаем кадастровые номера
    if (data.cadastralNumbers?.length) {
      await prisma.plotCadastral.createMany({
        data: data.cadastralNumbers.map((cadastral: { number: string }) => ({
          number: cadastral.number,
          plotId: plot.id
        }))
      })
    }

    // Создаем коммуникации
    if (data.communications?.length) {
      await prisma.plotCommunication.createMany({
        data: data.communications.map((comm: { name: string; type: string; description: string }) => ({
          name: comm.name,
          type: comm.type || 'default',
          description: comm.description || '',
          plotId: plot.id
        }))
      })
    }

    // Создаем особенности
    if (data.features?.length) {
      await prisma.plotFeature.createMany({
        data: data.features.map((feature: { name: string }) => ({
          name: feature.name,
          title: feature.name,
          description: '',
          plotId: plot.id
        }))
      })
    }

    // Получаем созданный участок со всеми связями
    const createdPlot = await prisma.plot.findUnique({
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

    return NextResponse.json(createdPlot)
  } catch (error) {
    console.error('Error creating plot:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 