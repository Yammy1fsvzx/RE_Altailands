import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const activeQuiz = await prisma.quiz.findFirst({
      where: {
        isActive: true,
      },
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
    })

    return NextResponse.json(activeQuiz)
  } catch (error) {
    console.error('Error fetching active quiz:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 