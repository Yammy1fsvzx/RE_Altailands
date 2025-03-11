import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import prisma from '@/lib/prisma'
import { options } from '../../../../auth/[...nextauth]/options'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const session = await getServerSession(options)
  
  if (!session?.user || session.user.role !== 'ADMIN') {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  const data = await request.json()

  // Находим пользователя по email из сессии
  const user = await prisma.user.findUnique({
    where: { email: session.user.email }
  })

  if (!user) {
    return new NextResponse('User not found', { status: 404 })
  }

  const comment = await prisma.comment.create({
    data: {
      text: data.text,
      applicationId: id,
      authorId: user.id,
    },
    include: {
      author: true,
    },
  })

  return NextResponse.json(comment)
} 