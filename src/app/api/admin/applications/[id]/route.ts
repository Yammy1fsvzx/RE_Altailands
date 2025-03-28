import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import prisma from '@/lib/prisma'
import { options } from '../../../auth/[...nextauth]/options'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(options)
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const { id } = await params;

    const application = await prisma.application.findUnique({
      where: { id },
      include: {
        quiz: {
          include: {
            questions: {
              include: {
                answers: true,
              },
              orderBy: {
                order: 'asc',
              },
            },
          },
        },
        plot: true,
        comments: {
          include: {
            author: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    })

    if (!application) {
      return new NextResponse('Application not found', { status: 404 })
    }

    // Если тип заявки QUIZ и есть ответы на квиз
    if (application.type === 'QUIZ' && application.quizAnswers && application.quiz) {
      // Преобразуем ответы в более удобный формат с текстовыми значениями
      const formattedQuizAnswers: Record<string, string | string[]> = {};
      
      // Проходим по всем ответам
      for (const [questionId, answerId] of Object.entries(application.quizAnswers as Record<string, any>)) {
        // Находим вопрос по его ID
        const question = application.quiz.questions.find(q => q.id === questionId);
        
        if (question) {
          if (Array.isArray(answerId)) {
            // Массив ответов для вопросов с множественным выбором
            formattedQuizAnswers[questionId] = answerId.map(id => {
              const answer = question.answers.find(a => a.id === id);
              return answer ? answer.text : id;
            });
          } else {
            // Одиночный ответ
            const answer = question.answers.find(a => a.id === answerId);
            formattedQuizAnswers[questionId] = answer ? answer.text : answerId;
          }
        }
      }
      
      // Заменяем оригинальные ответы на форматированные
      application.quizAnswers = formattedQuizAnswers;
    }

    return NextResponse.json(application)
  } catch (error) {
    console.error('Error fetching application:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(options)
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const { id } = await params
    const data = await request.json()

    const application = await prisma.application.update({
      where: { id },
      data: {
        status: data.status,
      },
    })

    return NextResponse.json(application)
  } catch (error) {
    console.error('Error updating application:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 