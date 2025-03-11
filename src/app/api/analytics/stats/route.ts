import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import prisma from '@/lib/prisma'
import { options } from '../../auth/[...nextauth]/options'

export async function GET() {
  try {
    const session = await getServerSession(options)
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return new NextResponse(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const [
      totalApplications,
      applicationsByStatus,
      totalPlots,
      plotsByStatus,
      totalQuizzes,
      activeQuizzes,
      totalVisits,
      visitsToday
    ] = await Promise.all([
      // Общее количество заявок
      prisma.application.count(),

      // Количество заявок по статусам
      prisma.application.groupBy({
        by: ['status'],
        _count: true
      }),

      // Общее количество участков
      prisma.plot.count(),

      // Количество участков по статусам
      prisma.plot.groupBy({
        by: ['status'],
        _count: true
      }),

      // Общее количество квизов
      prisma.quiz.count(),

      // Количество активных квизов
      prisma.quiz.count({
        where: { isActive: true }
      }),

      // Общее количество посещений
      prisma.pageVisit.count(),

      // Посещения за сегодня
      prisma.pageVisit.count({
        where: {
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0))
          }
        }
      })
    ])

    return NextResponse.json({
      applications: {
        total: totalApplications,
        byStatus: applicationsByStatus
      },
      plots: {
        total: totalPlots,
        byStatus: plotsByStatus
      },
      quizzes: {
        total: totalQuizzes,
        active: activeQuizzes
      },
      visits: {
        total: totalVisits,
        today: visitsToday
      }
    })
  } catch (error) {
    console.error('Error getting stats:', error)
    return new NextResponse(
      JSON.stringify({ error: 'Ошибка при получении статистики' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
} 