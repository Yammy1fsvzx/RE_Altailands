import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { generatePromoCode } from '@/utils/promoCode'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { quizId, name, phone, email, answers } = body

    // Проверяем наличие обязательных полей
    if (!quizId || !name || !phone) {
      return NextResponse.json({
        success: false,
        error: 'Необходимо заполнить обязательные поля',
        message: 'Пожалуйста, заполните имя и номер телефона'
      }, { status: 400 })
    }

    // Проверяем, существует ли активный квиз с указанным ID
    const quiz = await prisma.quiz.findFirst({
      where: {
        id: quizId,
        isActive: true
      }
    })

    if (!quiz) {
      return NextResponse.json({
        success: false,
        error: 'Квиз не найден или неактивен',
        message: 'Опрос, который вы пытаетесь заполнить, недоступен'
      }, { status: 404 })
    }

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
        success: false,
        alreadyExists: true,
        message: 'Вы уже отправляли заявку с этим номером телефона'
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
      promoCode,
      message: 'Спасибо за участие в опросе!'
    })

  } catch (error) {
    console.error('Error submitting quiz:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Внутренняя ошибка сервера',
        message: 'Произошла ошибка при отправке ответов. Пожалуйста, попробуйте позже.'
      },
      { status: 500 }
    )
  }
} 