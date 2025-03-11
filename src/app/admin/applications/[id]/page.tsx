import { notFound } from 'next/navigation'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { ru } from 'date-fns/locale'
import prisma from '@/lib/prisma'
import ApplicationDetails from '@/components/admin/ApplicationDetails'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function ApplicationPage({ params }: PageProps) {
  const { id } = await params

  const application = await prisma.application.findUnique({
    where: { id },
    include: {
      plot: true,
      quiz: {
        include: {
          questions: {
            include: {
              answers: true,
            },
          },
        },
      },
      comments: {
        include: {
          author: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      },
    },
  })

  if (!application) {
    notFound()
  }

  return (
    <div>
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Заявка №{application.id.slice(-8)}
          </h1>
          <Link
            href="/admin/applications"
            className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white font-medium"
          >
            ← Назад к списку
          </Link>
        </div>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Создана {formatDistanceToNow(new Date(application.createdAt), {
            addSuffix: true,
            locale: ru,
          })}
        </p>
      </div>

      <ApplicationDetails application={application} />
    </div>
  )
} 