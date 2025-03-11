import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { Quiz, QuizQuestion, QuizAnswer } from '@prisma/client'

interface QuestionWithAnswers extends QuizQuestion {
  answers: QuizAnswer[]
}

interface QuizWithQuestions extends Quiz {
  questions: QuestionWithAnswers[]
}

export async function GET() {
  try {
    // Получаем первый активный квиз с вопросами и ответами
    const quiz = await prisma.quiz.findFirst({
      where: {
        isActive: true
      },
      include: {
        questions: {
          orderBy: {
            order: 'asc'
          },
          include: {
            answers: {
              orderBy: {
                order: 'asc'
              }
            }
          }
        }
      }
    }) as QuizWithQuestions | null

    if (!quiz) {
      return NextResponse.json(
        { error: 'Quiz not found' },
        { status: 404 }
      )
    }

    // Форматируем данные для фронтенда
    const formattedQuestions = quiz.questions.map((question: QuestionWithAnswers) => ({
      id: question.id,
      question: question.title,
      description: question.description,
      type: question.type,
      isRequired: question.isRequired,
      imageUrl: question.imageUrl,
      options: question.answers.map((answer: QuizAnswer) => ({
        id: answer.id,
        text: answer.text,
        imageUrl: answer.imageUrl
      }))
    }))

    return NextResponse.json({
      quizId: quiz.id,
      title: quiz.title,
      description: quiz.description,
      questions: formattedQuestions
    })

  } catch (error) {
    console.error('Error fetching quiz questions:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
} 