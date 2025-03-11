'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Application, Comment, Quiz, Plot, User } from '@prisma/client'
import { useNotification } from '@/contexts/NotificationContext'

type ApplicationStatus = 'NEW' | 'IN_PROGRESS' | 'COMPLETED' | 'REJECTED'

interface QuizQuestion {
  id: string
  title: string
  answers: Array<{
    id: string
    text: string
  }>
}

interface ExtendedQuiz extends Quiz {
  title: string
  questions: QuizQuestion[]
}

interface ExtendedPlot extends Plot {
  id: string
  title: string
}

interface ExtendedComment extends Comment {
  author: User
}

interface ExtendedApplication extends Application {
  quiz?: ExtendedQuiz
  plot?: ExtendedPlot
  comments: ExtendedComment[]
  quizAnswers: Record<string, string | string[]>
}

interface ApplicationDetailsProps {
  application: ExtendedApplication
}

export default function ApplicationDetails({ application }: ApplicationDetailsProps) {
  const router = useRouter()
  const { showNotification } = useNotification()
  const [isUpdating, setIsUpdating] = useState(false)
  const [newComment, setNewComment] = useState('')
  const [status, setStatus] = useState<ApplicationStatus>(application.status as ApplicationStatus)

  const handleStatusChange = async (newStatus: string) => {
    try {
      const response = await fetch(`/api/admin/applications/${application.id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        throw new Error('Ошибка при обновлении статуса')
      }

      showNotification('Статус заявки успешно обновлен', 'success')
      router.refresh()
    } catch (error) {
      console.error('Error:', error)
      showNotification('Ошибка при обновлении статуса', 'error')
    }
  }

  const handleAddComment = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!newComment.trim()) return

    setIsUpdating(true)
    try {
      const response = await fetch(`/api/admin/applications/${application.id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: newComment }),
      })

      if (!response.ok) {
        throw new Error('Ошибка при добавлении комментария')
      }

      showNotification('Комментарий успешно добавлен', 'success')
      setNewComment('')
      router.refresh()
    } catch (error) {
      console.error('Error:', error)
      showNotification('Ошибка при добавлении комментария', 'error')
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Основная информация */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4 md:p-6">
        <h2 className="text-base md:text-lg font-medium text-gray-900 dark:text-white mb-3 md:mb-4">
          Основная информация
        </h2>
        <dl className="grid grid-cols-1 gap-3 md:gap-4 md:grid-cols-2">
          <div>
            <dt className="text-xs md:text-sm font-medium text-gray-500 dark:text-gray-400">Тип заявки</dt>
            <dd className="mt-1 text-sm md:text-base text-gray-900 dark:text-white">
              {application.type === 'QUIZ' && 'Квиз'}
              {application.type === 'PLOT' && 'Участок'}
              {application.type === 'CONTACT' && 'Контакты'}
            </dd>
          </div>
          <div>
            <dt className="text-xs md:text-sm font-medium text-gray-500 dark:text-gray-400">Статус</dt>
            <dd className="mt-1">
              <select
                value={status}
                onChange={(e) => handleStatusChange(e.target.value as string)}
                disabled={isUpdating}
                className="block w-full px-4 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-300 transition duration-200 ease-in-out"
              >
                <option value="NEW">Новая</option>
                <option value="IN_PROGRESS">В работе</option>
                <option value="COMPLETED">Завершена</option>
                <option value="REJECTED">Отклонена</option>
              </select>
            </dd>
          </div>
          <div>
            <dt className="text-xs md:text-sm font-medium text-gray-500 dark:text-gray-400">Имя</dt>
            <dd className="mt-1 text-sm md:text-base text-gray-900 dark:text-white break-words">{application.name}</dd>
          </div>
          <div>
            <dt className="text-xs md:text-sm font-medium text-gray-500 dark:text-gray-400">Email</dt>
            <dd className="mt-1 text-sm md:text-base text-gray-900 dark:text-white break-words">{application.email}</dd>
          </div>
          <div>
            <dt className="text-xs md:text-sm font-medium text-gray-500 dark:text-gray-400">Телефон</dt>
            <dd className="mt-1 text-sm md:text-base text-gray-900 dark:text-white break-words">{application.phone}</dd>
          </div>
          {application.message && (
            <div className="col-span-1 md:col-span-2">
              <dt className="text-xs md:text-sm font-medium text-gray-500 dark:text-gray-400">Сообщение</dt>
              <dd className="mt-1 text-sm md:text-base text-gray-900 dark:text-white whitespace-pre-wrap break-words">
                {application.message}
              </dd>
            </div>
          )}
        </dl>
      </div>

      {/* Информация о квизе */}
      {application.type === 'QUIZ' && application.quiz && (
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4 md:p-6">
          <h2 className="text-base md:text-lg font-medium text-gray-900 dark:text-white mb-3 md:mb-4">
            Ответы на квиз: {application.quiz.title}
          </h2>
          <div className="space-y-3 md:space-y-4">
            {application.quiz.questions.map((question: QuizQuestion) => {
              const answer = application.quizAnswers?.[question.id] ?? ''
              return (
                <div key={question.id} className="border-b border-gray-200 dark:border-gray-700 pb-3 md:pb-4">
                  <h3 className="text-sm md:text-base font-medium text-gray-900 dark:text-white mb-2">
                    {question.title}
                  </h3>
                  <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 break-words">
                    {Array.isArray(answer)
                      ? answer.map((a: string) => {
                          const answerObj = question.answers.find((qa: { id: string; text: string }) => qa.id === a)
                          return answerObj ? answerObj.text : a
                        }).join(', ')
                      : answer}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Информация об участке */}
      {application.type === 'PLOT' && application.plot && (
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4 md:p-6">
          <h2 className="text-base md:text-lg font-medium text-gray-900 dark:text-white mb-3 md:mb-4">
            Информация об участке
          </h2>
          <div className="mb-3 md:mb-4">
            <Link
              href={`/admin/plots/${application.plot.id}`}
              className="text-sm md:text-base text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
            >
              {application.plot.title}
            </Link>
          </div>
        </div>
      )}

      {/* Комментарии */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4 md:p-6">
        <h2 className="text-base md:text-lg font-medium text-gray-900 dark:text-white mb-3 md:mb-4">
          Комментарии
        </h2>
        
        {/* Форма добавления комментария */}
        <form onSubmit={handleAddComment} className="mb-4 md:mb-6">
          <div>
            <label htmlFor="comment" className="sr-only">
              Добавить комментарий
            </label>
            <textarea
              id="comment"
              rows={3}
              className="block w-full px-4 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600    shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20   bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100   placeholder-gray-400 dark:placeholder-gray-500   transition duration-200 ease-in-out"
              placeholder="Добавьте комментарий..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
            />
          </div>
          <div className="mt-3">
            <button
              type="submit"
              disabled={isUpdating || !newComment.trim()}
              className="w-full md:w-auto btn-primary"
            >
              {isUpdating ? 'Добавление...' : 'Добавить комментарий'}
            </button>
          </div>
        </form>

        {/* Список комментариев */}
        <div className="space-y-3 md:space-y-4">
          {application.comments.map((comment: ExtendedComment) => (
            <div
              key={comment.id}
              className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 md:p-4"
            >
              <div className="flex justify-between items-start">
                <div className="text-sm md:text-base text-gray-900 dark:text-white break-words">
                  {comment.text}
                </div>
              </div>
              <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                {comment.author.name} • {new Date(comment.createdAt).toLocaleString('ru')}
              </div>
            </div>
          ))}

          {application.comments.length === 0 && (
            <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 text-center py-3 md:py-4">
              Нет комментариев
            </p>
          )}
        </div>
      </div>
    </div>
  )
} 