'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline'
import { useNotification } from '@/contexts/NotificationContext'

type Question = {
  id?: string
  title: string
  description?: string
  imageUrl?: string
  order: number
  type: 'SINGLE' | 'MULTIPLE' | 'TEXT' | 'PHONE' | 'EMAIL'
  isRequired: boolean
  answers: Answer[]
}

type Answer = {
  id?: string
  text: string
  imageUrl?: string
  order: number
}

type QuizFormData = {
  id?: string
  title: string
  description: string
  isActive: boolean
  questions: Question[]
}

type QuizFormProps = {
  initialData?: QuizFormData
}

export default function QuizForm({ initialData }: QuizFormProps) {
  const router = useRouter()
  const { showNotification } = useNotification()
  const [isLoading, setIsLoading] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [formData, setFormData] = useState<QuizFormData>(
    initialData || {
      title: '',
      description: '',
      isActive: true,
      questions: [],
    }
  )

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch(`/api/admin/quizzes${formData.id ? `/${formData.id}` : ''}`, {
        method: formData.id ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error('Ошибка при сохранении квиза')
      }

      showNotification(
        formData.id ? 'Квиз успешно обновлен' : 'Квиз успешно создан',
        'success'
      )
      router.push('/admin/quizzes')
      router.refresh()
    } catch (error) {
      console.error('Error:', error)
      showNotification('Ошибка при сохранении квиза', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!formData.id || !confirm('Вы уверены, что хотите удалить этот квиз?')) {
      return
    }

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/admin/quizzes/${formData.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Ошибка при удалении квиза')
      }

      showNotification('Квиз успешно удален', 'success')
      router.push('/admin/quizzes')
      router.refresh()
    } catch (error) {
      console.error('Error:', error)
      showNotification('Ошибка при удалении квиза', 'error')
    } finally {
      setIsDeleting(false)
    }
  }

  const addQuestion = () => {
    const newQuestion: Question = {
      title: '',
      order: formData.questions.length,
      type: 'SINGLE',
      isRequired: true,
      answers: [],
    }
    setFormData({
      ...formData,
      questions: [...formData.questions, newQuestion],
    })
  }

  const removeQuestion = (index: number) => {
    const newQuestions = [...formData.questions]
    newQuestions.splice(index, 1)
    // Пересчитываем порядок
    newQuestions.forEach((q, i) => (q.order = i))
    setFormData({ ...formData, questions: newQuestions })
  }

  const updateQuestion = (index: number, field: keyof Question, value: any) => {
    const newQuestions = [...formData.questions]
    newQuestions[index] = { ...newQuestions[index], [field]: value }
    setFormData({ ...formData, questions: newQuestions })
  }

  const addAnswer = (questionIndex: number) => {
    const newQuestions = [...formData.questions]
    const question = newQuestions[questionIndex]
    const newAnswer: Answer = {
      text: '',
      order: question.answers.length,
    }
    question.answers = [...question.answers, newAnswer]
    setFormData({ ...formData, questions: newQuestions })
  }

  const removeAnswer = (questionIndex: number, answerIndex: number) => {
    const newQuestions = [...formData.questions]
    const question = newQuestions[questionIndex]
    question.answers.splice(answerIndex, 1)
    // Пересчитываем порядок
    question.answers.forEach((a, i) => (a.order = i))
    setFormData({ ...formData, questions: newQuestions })
  }

  const updateAnswer = (questionIndex: number, answerIndex: number, field: keyof Answer, value: any) => {
    const newQuestions = [...formData.questions]
    const question = newQuestions[questionIndex]
    question.answers[answerIndex] = { ...question.answers[answerIndex], [field]: value }
    setFormData({ ...formData, questions: newQuestions })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <button
          type="button"
          onClick={() => router.push('/admin/quizzes')}
          className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white 
                   font-medium transition duration-200"
        >
          ← Назад к списку
        </button>
        <div className="flex gap-4">
          {formData.id && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting}
              className="px-6 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 
                       text-white font-medium text-sm transition duration-200
                       focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2
                       disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isDeleting ? 'Удаление...' : 'Удалить'}
            </button>
          )}
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 
                     text-white font-medium text-sm transition duration-200
                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                     disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Сохранение...' : 'Сохранить'}
          </button>
        </div>
      </div>

      <div className="space-y-8">
        {/* Основная информация */}
        <div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
            Основная информация
          </h3>
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Название
              </label>
              <input
                type="text"
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="block w-full px-4 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 
                          shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20
                          bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                          placeholder-gray-400 dark:placeholder-gray-500
                          transition duration-200 ease-in-out"
                required
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Описание
              </label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="block w-full px-4 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 
                          shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20
                          bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                          placeholder-gray-400 dark:placeholder-gray-500
                          transition duration-200 ease-in-out"
              />
            </div>

            <div className="flex items-center">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 
                              peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full 
                              peer dark:bg-gray-700 peer-checked:after:translate-x-full 
                              peer-checked:after:border-white after:content-[''] after:absolute 
                              after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 
                              after:border after:rounded-full after:h-5 after:w-5 after:transition-all 
                              dark:border-gray-600 peer-checked:bg-blue-600">
                </div>
                <span className="ml-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Активен
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Вопросы */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Вопросы
            </h3>
            <button
              type="button"
              onClick={addQuestion}
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 
                       text-white font-medium text-sm transition duration-200
                       focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                       inline-flex items-center"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Добавить вопрос
            </button>
          </div>

          <div className="space-y-6">
            {formData.questions.map((question, qIndex) => (
              <div
                key={qIndex}
                className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1 mr-4">
                    <input
                      type="text"
                      value={question.title}
                      onChange={(e) => updateQuestion(qIndex, 'title', e.target.value)}
                      className="block w-full px-4 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-300 transition duration-200 ease-in-out"
                      placeholder="Текст вопроса"
                      required
                    />
                    <div className="mt-2">
                      <textarea
                        value={question.description || ''}
                        onChange={(e) => updateQuestion(qIndex, 'description', e.target.value)}
                        className="block w-full px-4 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-300 transition duration-200 ease-in-out"
                        placeholder="Описание вопроса (необязательно)"
                        rows={2}
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeQuestion(qIndex)}
                    className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 p-2 rounded-lg transition-colors"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-white mb-1">
                      Тип вопроса
                    </label>
                    <select
                      value={question.type}
                      onChange={(e) => updateQuestion(qIndex, 'type', e.target.value)}
                      className="block w-full px-4 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-300 transition duration-200 ease-in-out"
                    >
                      <option value="SINGLE">Один вариант</option>
                      <option value="MULTIPLE">Несколько вариантов</option>
                      <option value="TEXT">Текстовый ответ</option>
                      <option value="PHONE">Телефон</option>
                      <option value="EMAIL">Email</option>
                    </select>
                  </div>
                  <div>
                    <div className="flex items-center h-full">
                      <input
                        type="checkbox"
                        checked={question.isRequired}
                        onChange={(e) => updateQuestion(qIndex, 'isRequired', e.target.checked)}
                        className="flex justify-center items-center flex-row h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 dark:bg-gray-700"
                      />
                      <label className="ml-2 block text-sm text-gray-700 dark:text-white">
                        Обязательный вопрос
                      </label>
                    </div>
                  </div>
                </div>

                {(question.type === 'SINGLE' || question.type === 'MULTIPLE') && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-white">
                        Варианты ответов
                      </label>
                      <button
                        type="button"
                        onClick={() => addAnswer(qIndex)}
                        className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 text-sm"
                      >
                        + Добавить вариант
                      </button>
                    </div>
                    <div className="space-y-2">
                      {question.answers.map((answer, aIndex) => (
                        <div key={aIndex} className="flex items-center gap-2">
                          <input
                            type="text"
                            value={answer.text}
                            onChange={(e) => updateAnswer(qIndex, aIndex, 'text', e.target.value)}
                            className="block w-full px-4 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-300 transition duration-200 ease-in-out"
                            placeholder="Текст ответа"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => removeAnswer(qIndex, aIndex)}
                            className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {formData.questions.length === 0 && (
              <div className="text-center py-12 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <p className="text-gray-500 dark:text-gray-300">
                  Нет вопросов. Нажмите "Добавить вопрос" для создания первого вопроса.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </form>
  )
} 