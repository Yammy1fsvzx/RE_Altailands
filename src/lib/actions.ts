'use server'

import { revalidatePath } from 'next/cache'
import prisma from '@/lib/prisma'

export async function togglePlotVisibility(id: string, newState: boolean) {
  try {
    await prisma.plot.update({
      where: { id },
      data: { isVisible: newState }
    })
    revalidatePath('/admin/plots')
  } catch (error) {
    console.error('Error toggling plot visibility:', error)
    throw new Error('Не удалось изменить видимость участка')
  }
}

export async function deletePlot(id: string) {
  try {
    await prisma.plot.delete({
      where: { id }
    })
    revalidatePath('/admin/plots')
  } catch (error) {
    console.error('Error deleting plot:', error)
    throw new Error('Не удалось удалить участок')
  }
} 