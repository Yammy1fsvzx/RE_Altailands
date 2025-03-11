import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const headers = request.headers
    const userAgent = headers.get('user-agent')
    const ip = headers.get('x-forwarded-for') || headers.get('x-real-ip') || null

    // Записываем каждое посещение страницы
    const visit = await prisma.pageVisit.create({
      data: {
        path: data.path,
        userAgent: userAgent,
        ip: ip,
        referer: headers.get('referer') || null,
      },
    })

    return NextResponse.json(visit)
  } catch (error) {
    console.error('Error recording visit:', error)
    return new NextResponse(
      JSON.stringify({ error: 'Ошибка при записи посещения' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}

export async function GET() {
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const [
      totalUnique,
      uniqueToday,
      dailyVisits,
      topPages
    ] = await Promise.all([
      // Общее количество уникальных посетителей (по userAgent)
      prisma.$queryRaw`
        SELECT COUNT(DISTINCT userAgent) as count
        FROM PageVisit
        WHERE userAgent IS NOT NULL
        AND path NOT LIKE '/admin%'
      `,

      // Уникальные посетители за сегодня
      prisma.$queryRaw`
        SELECT COUNT(DISTINCT userAgent) as count
        FROM PageVisit
        WHERE date(createdAt) = date(${today})
        AND userAgent IS NOT NULL
        AND path NOT LIKE '/admin%'
      `,

      // Уникальные посещения по дням за текущий месяц
      prisma.$queryRaw`
        WITH RECURSIVE dates(date) AS (
          SELECT date(datetime('now', 'start of month'))
          UNION ALL
          SELECT date(datetime(date, '+1 day'))
          FROM dates
          WHERE date < date(datetime('now', 'start of month', '+1 month', '-1 day'))
        )
        SELECT 
          dates.date,
          (
            SELECT COUNT(DISTINCT pv.userAgent)
            FROM PageVisit pv
            WHERE date(pv.createdAt) = dates.date
            AND pv.userAgent IS NOT NULL
            AND pv.path NOT LIKE '/admin%'
          ) as count
        FROM dates
      `,

      // Топ страниц по уникальным посещениям
      prisma.$queryRaw`
        WITH PageStats AS (
          SELECT 
            path,
            date(createdAt) as visit_date,
            COUNT(DISTINCT userAgent) as unique_visitors
          FROM PageVisit
          WHERE userAgent IS NOT NULL
          AND path NOT LIKE '/admin%'
          GROUP BY path, date(createdAt)
        )
        SELECT 
          path,
          SUM(unique_visitors) as count,
          COUNT(DISTINCT visit_date) as days_visited
        FROM PageStats
        GROUP BY path
        ORDER BY count DESC, days_visited DESC
        LIMIT 5
      `
    ])

    return NextResponse.json({
      totalVisits: Number(totalUnique[0]?.count || 0),
      visitsToday: Number(uniqueToday[0]?.count || 0),
      dailyVisits: dailyVisits.map((visit: any) => ({
        createdAt: visit.date,
        _count: Number(visit.count)
      })),
      topPages: topPages.map((page: any) => ({
        path: page.path,
        count: Number(page.count)
      }))
    })
  } catch (error) {
    console.error('Error getting visits:', error)
    return new NextResponse(
      JSON.stringify({ error: 'Ошибка при получении статистики посещений' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
} 