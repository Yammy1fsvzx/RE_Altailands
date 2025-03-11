import { notFound } from 'next/navigation'
import prisma from '@/lib/prisma'
import QuizForm from '@/components/admin/QuizForm'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditQuizPage({ params }: PageProps) {
  const { id } = await params
  
  const quiz = await prisma.quiz.findUnique({
    where: { id },
    include: {
      questions: {
        include: {
          answers: true,
        },
        orderBy: {
          order: 'asc',
        },
      },
    },
  })

  if (!quiz) {
    notFound()
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Редактирование квиза
        </h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Измените параметры квиза и его вопросы
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <QuizForm initialData={quiz} />
        </div>
      </div>
    </div>
  )
} 