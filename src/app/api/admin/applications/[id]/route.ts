import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import prisma from '@/lib/prisma'
import { options } from '../../../auth/[...nextauth]/options'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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
} 