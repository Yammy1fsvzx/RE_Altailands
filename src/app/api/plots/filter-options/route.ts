import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

interface RegionResult {
  region: string
}

interface LandUseTypeResult {
  landUseType: string
}

interface LandCategoryResult {
  landCategory: string
}

export async function GET() {
  try {
    // Получаем уникальные значения для фильтров из базы данных
    const [regions, landUseTypes, landCategories] = await Promise.all([
      prisma.plot.findMany({
        where: {
          isVisible: true,
          status: 'AVAILABLE'
        },
        select: {
          region: true
        },
        distinct: ['region']
      }),
      prisma.plot.findMany({
        where: {
          isVisible: true,
          status: 'AVAILABLE'
        },
        select: {
          landUseType: true
        },
        distinct: ['landUseType']
      }),
      prisma.plot.findMany({
        where: {
          isVisible: true,
          status: 'AVAILABLE'
        },
        select: {
          landCategory: true
        },
        distinct: ['landCategory']
      })
    ]) as [RegionResult[], LandUseTypeResult[], LandCategoryResult[]]

    return NextResponse.json({
      regions: regions.map(r => r.region),
      landUseTypes: landUseTypes.map(t => t.landUseType),
      landCategories: landCategories.map(c => c.landCategory)
    })
  } catch (error) {
    console.error('Error fetching filter options:', error)
    return NextResponse.json(
      { error: 'Произошла ошибка при получении опций фильтров' },
      { status: 500 }
    )
  }
} 