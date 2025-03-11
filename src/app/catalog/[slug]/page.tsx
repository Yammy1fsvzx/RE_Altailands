import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import prisma from '@/lib/prisma'
import PlotPageContent from '@/components/plots/PlotPageContent'

export const runtime = 'nodejs'
export const preferredRegion = 'auto'
export const dynamic = 'force-dynamic'
export const revalidate = 0

type Props = {
  params: {
    slug: string
  }
}

async function getPlotData(slug: string) {
  try {
    const plot = await prisma.plot.findUnique({
      where: { slug },
      include: {
        media: {
          orderBy: { order: 'asc' }
        },
        documents: true,
        cadastralNumbers: true,
        communications: true,
        features: true,
      }
    })

    if (!plot) notFound()
    return plot
  } catch (error) {
    console.error('Error fetching plot:', error)
    throw error
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const plot = await prisma.plot.findUnique({
      where: { slug: params.slug },
      select: { title: true, description: true }
    })

    if (!plot) {
      return {
        title: 'Участок не найден',
        description: 'Запрашиваемый земельный участок не найден'
      }
    }

    return {
      title: `${plot.title} | Земельный участок`,
      description: plot.description?.slice(0, 160) || plot.title
    }
  } catch (error) {
    console.error('Error generating metadata:', error)
    return {
      title: 'Ошибка загрузки',
      description: 'Произошла ошибка при загрузке данных участка'
    }
  }
}

export default async function PlotPage({ params }: Props) {
  const plot = await getPlotData(params.slug)
  return <PlotPageContent plot={plot} />
} 