import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { Prisma, Plot, PlotCadastral } from '@prisma/client'

interface PlotWithRelations extends Plot {
  media: {
    url: string
  }[]
  cadastralNumbers: PlotCadastral[]
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Получаем все параметры фильтрации
    const search = searchParams.get('search')
    const priceMin = searchParams.get('priceMin')
    const priceMax = searchParams.get('priceMax')
    const areaMin = searchParams.get('areaMin')
    const areaMax = searchParams.get('areaMax')
    const region = searchParams.get('region')
    const landUseType = searchParams.get('landUseType')
    const landCategory = searchParams.get('landCategory')
    const sortBy = searchParams.get('sortBy') || 'newest'

    // Формируем условия фильтрации
    const where: Prisma.PlotWhereInput = {
      isVisible: true,
      status: 'AVAILABLE',
      ...(search && {
        OR: [
          { title: { contains: search } },
          { description: { contains: search } },
          {
            cadastralNumbers: {
              some: {
                number: { contains: search }
              }
            }
          }
        ]
      }),
      ...(priceMin && { price: { gte: parseFloat(priceMin) } }),
      ...(priceMax && { price: { lte: parseFloat(priceMax) } }),
      ...(areaMin && { area: { gte: parseFloat(areaMin) } }),
      ...(areaMax && { area: { lte: parseFloat(areaMax) } }),
      ...(region && { region }),
      ...(landUseType && { landUseType }),
      ...(landCategory && { landCategory })
    }

    // Определяем сортировку
    const orderBy = {
      ...(sortBy === 'newest' && { createdAt: 'desc' }),
      ...(sortBy === 'price_asc' && { price: 'asc' }),
      ...(sortBy === 'price_desc' && { price: 'desc' }),
      ...(sortBy === 'area_asc' && { area: 'asc' }),
      ...(sortBy === 'area_desc' && { area: 'desc' })
    }

    // Получаем участки с учетом фильтров
    const plots = await prisma.plot.findMany({
      where,
      orderBy,
      include: {
        media: {
          take: 1,
          orderBy: {
            order: 'asc'
          }
        },
        cadastralNumbers: true
      }
    }) as PlotWithRelations[]

    // Форматируем данные для ответа
    const formattedPlots = plots.map(plot => ({
      ...plot,
      cadastralNumbers: plot.cadastralNumbers.map(c => c.number)
    }))

    return NextResponse.json(formattedPlots)
  } catch (error) {
    console.error('Error fetching plots:', error)
    return NextResponse.json(
      { error: 'Произошла ошибка при получении списка участков' },
      { status: 500 }
    )
  }
} 