import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const data = await request.json()

    const result = await prisma.quizResult.create({
      data: {
        quizId: data.quizId,
        name: data.name,
        email: data.email,
        phone: data.phone,
        answers: JSON.stringify(data.answers),
      },
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error saving quiz result:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 