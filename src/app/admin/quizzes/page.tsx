import prisma from '@/lib/prisma'
import Link from 'next/link'
import { PlusIcon } from '@heroicons/react/24/outline'

interface QuizWithCounts {
  id: string
  title: string
  description: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  _count: {
    questions: number
    results: number
  }
}

export default async function QuizzesPage() {
  const quizzes = await prisma.quiz.findMany({
    include: {
      _count: {
        select: {
          questions: true,
          results: true,
        },
      },
    },
    orderBy: {
      updatedAt: 'desc',
    },
  })

  return (
    <div>
      <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Квизы
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Управление опросами и тестами
          </p>
        </div>
        <Link
          href="/admin/quizzes/new"
          className="btn-primary inline-flex items-center w-full sm:w-auto justify-center"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Создать квиз
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {quizzes.map((quiz: QuizWithCounts) => (
          <Link
            key={quiz.id}
            href={`/admin/quizzes/${quiz.id}`}
            className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 hover:shadow-md transition-shadow duration-200"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white truncate">
                {quiz.title}
              </h3>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  quiz.isActive
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                }`}
              >
                {quiz.isActive ? 'Активен' : 'Неактивен'}
              </span>
            </div>
            
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
              {quiz.description}
            </p>

            <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-4">
                <span>{quiz._count.questions} вопросов</span>
                <span>{quiz._count.results} ответов</span>
              </div>
              <span>
                {new Date(quiz.updatedAt).toLocaleDateString('ru', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                })}
              </span>
            </div>
          </Link>
        ))}

        {quizzes.length === 0 && (
          <div className="col-span-full text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Нет созданных квизов
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Создайте свой первый квиз, нажав кнопку "Создать квиз"
            </p>
          </div>
        )}
      </div>
    </div>
  )
} 