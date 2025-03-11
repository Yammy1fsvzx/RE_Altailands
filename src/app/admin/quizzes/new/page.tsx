import QuizForm from '@/components/admin/QuizForm'

export default function NewQuizPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Создание квиза
        </h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Заполните форму для создания нового квиза
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <QuizForm />
        </div>
      </div>
    </div>
  )
} 