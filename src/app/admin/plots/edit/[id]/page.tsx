import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import prisma from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth'
import PlotFormWrapper from './PlotFormWrapper'
import { Plot } from '@prisma/client'

interface PageProps {
  params: Promise<{
    id: string
  }>
}

export const metadata: Metadata = {
  title: 'Редактирование участка | Админ-панель',
}

export default async function EditPlotPage({ params }: PageProps) {
  await requireAdmin()

  // Дожидаемся получения параметров
  const { id } = await params

  const plot = await prisma.plot.findUnique({
    where: { id },
    include: {
      media: {
        orderBy: { order: 'asc' }
      },
      documents: true,
      cadastralNumbers: true,
      communications: true,
      features: true
    }
  })

  if (!plot) {
    notFound()
  }

  return (
    <div className="container mx-auto py-8">
      <PlotFormWrapper plot={plot} />
    </div>
  )
} 