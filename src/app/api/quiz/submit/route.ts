import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { generatePromoCode } from '@/utils/promoCode'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { quizId, name, phone, email, answers } = body

    // Проверяем, существует ли заявка с таким телефоном
    const existingApplication = await prisma.application.findFirst({
      where: {
        phone,
        quizId,
        type: 'QUIZ'
      }
    })

    if (existingApplication) {
      return NextResponse.json({
        alreadyExists: true,
        message: 'Вы уже отправляли заявку'
      })
    }

    // Генерируем промокод
    const promoCode = generatePromoCode()

    // Создаем заявку
    const application = await prisma.application.create({
      data: {
        type: 'QUIZ',
        name,
        phone,
        email,
        quizId,
        quizAnswers: answers,
        status: 'NEW'
      }
    })

    return NextResponse.json({
      success: true,
      promoCode
    })

  } catch (error) {
    console.error('Error submitting quiz:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
} 