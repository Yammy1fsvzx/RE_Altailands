import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { type, name, phone, email, message, plotId } = body

    // Валидация
    if (!type || !name || !phone || !email) {
      return NextResponse.json(
        { error: 'Не все обязательные поля заполнены' },
        { status: 400 }
      )
    }

    // Создание заявки
    const application = await prisma.application.create({
      data: {
        type,
        name,
        phone,
        email,
        message: message || '',
        status: 'NEW',
        ...(plotId && { plotId })
      }
    })

    return NextResponse.json(application)
  } catch (error) {
    console.error('Error creating application:', error)
    return NextResponse.json(
      { error: 'Не удалось создать заявку' },
      { status: 500 }
    )
  }
} 