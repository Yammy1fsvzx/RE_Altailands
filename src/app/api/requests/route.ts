import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { ApplicationType } from '@prisma/client'

interface RequestBody {
  name: string
  phone: string
  email: string
  message: string
}

export async function POST(req: Request) {
  try {
    const body = await req.json() as RequestBody
    const { name, phone, email, message } = body

    // Валидация данных
    if (!name || !phone || !email || !message) {
      return NextResponse.json(
        { error: 'Все поля обязательны для заполнения' },
        { status: 400 }
      )
    }

    // Создание заявки в базе данных
    const newApplication = await prisma.application.create({
      data: {
        name,
        phone,
        email,
        message,
        type: ApplicationType.CONTACT,
        status: 'NEW'
      }
    })

    return NextResponse.json(newApplication)
  } catch (error) {
    console.error('Error creating application:', error)
    return NextResponse.json(
      { error: 'Произошла ошибка при создании заявки' },
      { status: 500 }
    )
  }
} 