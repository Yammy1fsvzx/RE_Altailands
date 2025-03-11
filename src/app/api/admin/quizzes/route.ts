import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import prisma from '@/lib/prisma'
import { options } from '../../auth/[...nextauth]/options'

export async function POST(request: Request) {
  const session = await getServerSession(options)
  
  if (!session?.user || session.user.role !== 'ADMIN') {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  const data = await request.json()

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
}

export async function PUT(request: Request) {
  const session = await getServerSession(options)
  
  if (!session?.user || session.user.role !== 'ADMIN') {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  const data = await request.json()

  // Обновляем основную информацию квиза
  const quiz = await prisma.quiz.update({
    where: { id: data.id },
    data: {
      title: data.title,
      description: data.description,
      isActive: data.isActive,
    },
  })

  // Удаляем все существующие вопросы и ответы
  await prisma.quizQuestion.deleteMany({
    where: { quizId: data.id },
  })

  // Создаем новые вопросы и ответы
  const updatedQuiz = await prisma.quiz.update({
    where: { id: data.id },
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
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return new NextResponse('ID is required', { status: 400 })
    }

    await prisma.quiz.delete({
      where: { id },
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('Error deleting quiz:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 