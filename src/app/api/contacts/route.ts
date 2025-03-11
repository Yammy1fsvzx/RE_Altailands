import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const contact = await prisma.contact.findFirst({
      include: {
        workingHours: true,
        socialMedia: true,
      },
    })

    if (!contact) {
      return NextResponse.json(
        { error: 'Контактные данные не найдены' },
        { status: 404 }
      )
    }

    return NextResponse.json(contact)
  } catch (error) {
    console.error('Ошибка при получении контактных данных:', error)
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
} 