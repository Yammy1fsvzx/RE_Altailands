import { notFound } from 'next/navigation'
import ApplicationClient from '@/components/admin/ApplicationClient'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function ApplicationPage({ params }: PageProps) {
  const { id } = await params

  return <ApplicationClient id={id} />
} 