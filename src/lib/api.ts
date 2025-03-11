import prisma from '@/lib/prisma'

interface Plot {
  id: string
  title: string
  slug: string
  area: number
  price: number
  pricePerMeter: number
  region: string
  locality: string
  media: {
    url: string
  }[]
}

export async function getLatestPlots(): Promise<Plot[]> {
  const response = await fetch('/api/plots/latest')
  
  if (!response.ok) {
    throw new Error('Не удалось загрузить участки')
  }
  
  return response.json()
} 