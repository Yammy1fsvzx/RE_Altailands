import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import prisma from '@/lib/prisma'
import { options } from '../../auth/[...nextauth]/options'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(options)
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const data = await request.json()

    // Проверяем наличие обязательных полей
    if (!data.title) {
      return new NextResponse('Title is required', { status: 400 })
    }

    // Если создаваемый квиз должен быть активным, деактивируем все остальные
    if (data.isActive) {
      await prisma.quiz.updateMany({
        where: {
          isActive: true
        },
        data: {
          isActive: false
        }
      })
    }

    const quiz = await prisma.quiz.create({
      data: {
        title: data.title,
        description: data.description,
        isActive: data.isActive,
        questions: {
          create: data.questions.map((q: any) => ({
            title: q.title,
            description: q.description,
            imageUrl: q.imageUrl,
            order: q.order,
            type: q.type,
            isRequired: q.isRequired,
            answers: {
              create: q.answers.map((a: any) => ({
                text: a.text,
                imageUrl: a.imageUrl,
                order: a.order,
              })),
            },
          })),
        },
      },
      include: {
        questions: {
          include: {
            answers: true,
          },
        },
      },
    })

    return NextResponse.json(quiz)
  } catch (error) {
    console.error('Error creating quiz:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(options)
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return new NextResponse('ID is required', { status: 400 })
    }

    const data = await request.json()
    data.id = id // Убедимся, что ID в данных соответствует ID в URL

    // Если обновляемый квиз должен быть активным, деактивируем все остальные
    if (data.isActive) {
      await prisma.quiz.updateMany({
        where: {
          id: { not: id },
          isActive: true
        },
        data: {
          isActive: false
        }
      })
    }

    // Обновляем основную информацию квиза
    const quiz = await prisma.quiz.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description,
        isActive: data.isActive,
      },
    })

    // Удаляем все существующие вопросы и ответы
    await prisma.quizQuestion.deleteMany({
      where: { quizId: id },
    })

    // Создаем новые вопросы и ответы
    const updatedQuiz = await prisma.quiz.update({
      where: { id },
      data: {
        questions: {
          create: data.questions.map((q: any) => ({
            title: q.title,
            description: q.description,
            imageUrl: q.imageUrl,
            order: q.order,
            type: q.type,
            isRequired: q.isRequired,
            answers: {
              create: q.answers.map((a: any) => ({
                text: a.text,
                imageUrl: a.imageUrl,
                order: a.order,
              })),
            },
          })),
        },
      },
      include: {
        questions: {
          include: {
            answers: true,
          },
        },
      },
    })

    return NextResponse.json(updatedQuiz)
  } catch (error) {
    console.error('Error updating quiz:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return new NextResponse('ID is required', { status: 400 })
    }

    // Проверяем, активен ли квиз, который мы собираемся удалить
    const quizToDelete = await prisma.quiz.findUnique({
      where: { id }
    });

    await prisma.quiz.delete({
      where: { id },
    })

    // Если удалили активный квиз, активируем следующий доступный (если есть)
    if (quizToDelete?.isActive) {
      const nextQuiz = await prisma.quiz.findFirst({
        orderBy: { updatedAt: 'desc' }
      });

      if (nextQuiz) {
        await prisma.quiz.update({
          where: { id: nextQuiz.id },
          data: { isActive: true }
        });
      }
    }

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('Error deleting quiz:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 