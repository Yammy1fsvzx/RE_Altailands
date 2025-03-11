import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const plots = await prisma.plot.findMany({
      where: {
        isVisible: true,
        status: 'AVAILABLE'
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 2,
      include: {
        media: {
          take: 1,
          orderBy: {
            order: 'asc'
          }
        }
      }
    })

    return NextResponse.json(plots)
  } catch (error) {
    console.error('Error fetching latest plots:', error)
    return NextResponse.json(
      { error: 'Не удалось загрузить участки' },
      { status: 500 }
    )
  }
} 