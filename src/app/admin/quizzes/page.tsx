import prisma from '@/lib/prisma'
import Link from 'next/link'
import { PlusIcon, InformationCircleIcon, ChartBarIcon, DocumentTextIcon, ClockIcon } from '@heroicons/react/24/outline'

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

  // Найдем активный квиз (если есть)
  const activeQuiz = quizzes.find(quiz => quiz.isActive)

  return (
    <div className="max-w-7xl mx-auto pb-20">
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Квизы
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Управление опросами для посетителей сайта
          </p>
        </div>
      </div>

      {/* Информационный блок об ограничении */}
      <div className="mb-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-100 dark:border-blue-800">
        <div className="flex items-start gap-3">
          <InformationCircleIcon className="w-6 h-6 text-blue-500 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-base font-medium text-blue-800 dark:text-blue-300">
              Важная информация
            </h3>
            <p className="mt-1 text-sm text-blue-700 dark:text-blue-400">
              В системе может быть только один активный квиз. При активации нового квиза, 
              предыдущий активный квиз будет автоматически деактивирован.
              {activeQuiz && (
                <> Сейчас активен квиз: <strong className="font-medium">{activeQuiz.title}</strong></>
              )}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {quizzes.map((quiz: QuizWithCounts) => (
          <Link
            key={quiz.id}
            href={`/admin/quizzes/${quiz.id}`}
            className={`group bg-white dark:bg-gray-800 shadow-sm hover:shadow-md rounded-lg overflow-hidden border border-gray-100 dark:border-gray-700 transition-all duration-200 flex flex-col
              ${quiz.isActive ? 'ring-2 ring-green-500 dark:ring-green-600' : ''}`}
          >
            <div className="p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {quiz.title}
                </h3>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    quiz.isActive
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/60 dark:text-green-200'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                  }`}
                >
                  {quiz.isActive ? 'Активен' : 'Неактивен'}
                </span>
              </div>
              
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2 min-h-[2.5rem]">
                {quiz.description || 'Без описания'}
              </p>

              <div className="flex flex-wrap gap-3 mt-auto">
                <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                  <DocumentTextIcon className="h-4 w-4" />
                  <span>{quiz._count.questions} вопр.</span>
                </div>
                <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                  <ChartBarIcon className="h-4 w-4" />
                  <span>{quiz._count.results} отв.</span>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-700/50 border-t border-gray-100 dark:border-gray-700 p-3 mt-auto flex items-center justify-between">
              <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                <ClockIcon className="h-3.5 w-3.5" />
                <span>
                  {new Date(quiz.updatedAt).toLocaleDateString('ru', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })}
                </span>
              </div>
              
              <span className="text-sm font-medium text-blue-600 dark:text-blue-400 group-hover:underline">
                Редактировать
              </span>
            </div>
          </Link>
        ))}

        {/* Кнопка добавления квиза */}
        <Link 
          href="/admin/quizzes/new"
          className="flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-8 text-center hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors"
        >
          <div className="bg-blue-100 dark:bg-blue-900/30 w-14 h-14 rounded-full flex items-center justify-center mb-3">
            <PlusIcon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
            Создать новый квиз
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Добавьте новый опрос для посетителей
          </p>
        </Link>

        {quizzes.length === 0 && (
          <div className="col-span-full text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="mx-auto bg-gray-100 dark:bg-gray-700 w-16 h-16 rounded-full flex items-center justify-center mb-4">
              <DocumentTextIcon className="h-8 w-8 text-gray-500 dark:text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Нет созданных квизов
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 max-w-sm mx-auto mb-6">
              Создайте свой первый опрос для получения обратной связи от посетителей вашего сайта
            </p>
            <Link
              href="/admin/quizzes/new"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Создать квиз
            </Link>
          </div>
        )}
      </div>

      {/* Фиксированная панель с кнопками навигации */}
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4 z-10 flex justify-between items-center shadow-lg">
        <div className="flex items-center">
          <Link
            href="/admin"
            className="px-6 py-2.5 rounded-lg bg-gray-500 hover:bg-gray-600 text-white font-medium text-sm transition duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            ← Назад в админку
          </Link>
        </div>
        <div className="flex gap-4">
          <Link
            href="/admin/quizzes/new"
            className="px-6 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm transition duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 inline-flex items-center"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Создать квиз
          </Link>
        </div>
      </div>
    </div>
  )
} 