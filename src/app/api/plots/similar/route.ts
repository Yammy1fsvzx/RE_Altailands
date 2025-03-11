import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    
    const region = searchParams.get('region')
    const priceMin = parseFloat(searchParams.get('priceMin') || '0')
    const priceMax = parseFloat(searchParams.get('priceMax') || '0')
    const areaMin = parseFloat(searchParams.get('areaMin') || '0')
    const areaMax = parseFloat(searchParams.get('areaMax') || '0')
    const exclude = searchParams.get('exclude')

    // Получаем похожие участки
    const plots = await prisma.plot.findMany({
      where: {
        isVisible: true,
        status: 'AVAILABLE',
        id: { not: exclude },
        region: region,
        price: {
          gte: priceMin,
          lte: priceMax
        },
        area: {
          gte: areaMin,
          lte: areaMax
        }
      },
      include: {
        media: {
          take: 1,
          orderBy: {
            order: 'asc'
          }
        }
      },
      take: 3, // Ограничиваем количество похожих участков
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(plots)
  } catch (error) {
    console.error('Error fetching similar plots:', error)
    return NextResponse.json(
      { error: 'Failed to fetch similar plots' },
      { status: 500 }
    )
  }
} 