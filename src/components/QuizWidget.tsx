'use client'

import { useState } from 'react'
import { QuestionMarkCircleIcon } from '@heroicons/react/24/outline'

type Answer = {
  id: string
  text: string
  imageUrl?: string | null
}

type Question = {
  id: string
  title: string
  description?: string | null
  imageUrl?: string | null
  type: 'SINGLE' | 'MULTIPLE' | 'TEXT' | 'PHONE' | 'EMAIL'
  isRequired: boolean
  answers: Answer[]
}

type Quiz = {
  id: string
  title: string
  description: string
  questions: Question[]
}

type QuizWidgetProps = {
  quiz: Quiz
}

export default function QuizWidget({ quiz }: QuizWidgetProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({})
  const [userInfo, setUserInfo] = useState({ name: '', email: '', phone: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)

  const currentQuestion = quiz.questions[currentStep]
  const isLastStep = currentStep === quiz.questions.length - 1
  const progress = ((currentStep + 1) / quiz.questions.length) * 100

  const handleAnswerChange = (value: string | string[]) => {
    setAnswers({ ...answers, [currentQuestion.id]: value })
  }

  const handleNext = () => {
    if (isLastStep) {
      handleSubmit()
    } else {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    setCurrentStep(currentStep - 1)
  }

  const isCurrentQuestionAnswered = () => {
    const answer = answers[currentQuestion.id]
    if (currentQuestion.isRequired) {
      if (currentQuestion.type === 'MULTIPLE') {
        return Array.isArray(answer) && answer.length > 0
      }
      return !!answer
    }
    return true
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      const response = await fetch('/api/quiz-results', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          quizId: quiz.id,
          answers,
          ...userInfo,
        }),
      })

      if (!response.ok) {
        throw new Error('Ошибка при отправке результатов')
      }

      setIsCompleted(true)
    } catch (error) {
      console.error('Ошибка:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isCompleted) {
    return (
      <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 max-w-2xl mx-auto">
        <div className="text-center">
          <QuestionMarkCircleIcon className="mx-auto h-12 w-12 text-green-500" />
          <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
            Спасибо за ваши ответы!
          </h3>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Мы свяжемся с вами в ближайшее время.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 max-w-2xl mx-auto">
      {/* Прогресс */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
          <span>Вопрос {currentStep + 1} из {quiz.questions.length}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Текущий вопрос */}
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          {currentQuestion.title}
        </h3>
        {currentQuestion.description && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            {currentQuestion.description}
          </p>
        )}

        {/* Поля ввода в зависимости от типа вопроса */}
        <div className="space-y-4">
          {currentQuestion.type === 'SINGLE' && (
            <div className="space-y-2">
              {currentQuestion.answers.map((answer) => (
                <label
                  key={answer.id}
                  className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <input
                    type="radio"
                    name={currentQuestion.id}
                    value={answer.id}
                    checked={answers[currentQuestion.id] === answer.id}
                    onChange={(e) => handleAnswerChange(e.target.value)}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="ml-3 text-gray-700 dark:text-gray-300">
                    {answer.text}
                  </span>
                </label>
              ))}
            </div>
          )}

          {currentQuestion.type === 'MULTIPLE' && (
            <div className="space-y-2">
              {currentQuestion.answers.map((answer) => (
                <label
                  key={answer.id}
                  className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <input
                    type="checkbox"
                    value={answer.id}
                    checked={Array.isArray(answers[currentQuestion.id]) && 
                      (answers[currentQuestion.id] as string[]).includes(answer.id)}
                    onChange={(e) => {
                      const current = (answers[currentQuestion.id] as string[]) || []
                      const value = e.target.value
                      const newValue = e.target.checked
                        ? [...current, value]
                        : current.filter(v => v !== value)
                      handleAnswerChange(newValue)
                    }}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 rounded"
                  />
                  <span className="ml-3 text-gray-700 dark:text-gray-300">
                    {answer.text}
                  </span>
                </label>
              ))}
            </div>
          )}

          {currentQuestion.type === 'TEXT' && (
            <textarea
              value={answers[currentQuestion.id] as string || ''}
              onChange={(e) => handleAnswerChange(e.target.value)}
              rows={3}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600"
              placeholder="Введите ваш ответ..."
            />
          )}

          {currentQuestion.type === 'PHONE' && (
            <input
              type="tel"
              value={answers[currentQuestion.id] as string || ''}
              onChange={(e) => handleAnswerChange(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600"
              placeholder="+7 (999) 999-99-99"
            />
          )}

          {currentQuestion.type === 'EMAIL' && (
            <input
              type="email"
              value={answers[currentQuestion.id] as string || ''}
              onChange={(e) => handleAnswerChange(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600"
              placeholder="example@email.com"
            />
          )}
        </div>
      </div>

      {/* Кнопки навигации */}
      <div className="flex justify-between">
        <button
          type="button"
          onClick={handleBack}
          disabled={currentStep === 0}
          className={`px-4 py-2 text-sm font-medium rounded-md ${
            currentStep === 0
              ? 'text-gray-400 cursor-not-allowed'
              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
          }`}
        >
          Назад
        </button>
        <button
          type="button"
          onClick={handleNext}
          disabled={!isCurrentQuestionAnswered() || isSubmitting}
          className="btn-primary"
        >
          {isSubmitting
            ? 'Отправка...'
            : isLastStep
            ? 'Завершить'
            : 'Далее'}
        </button>
      </div>
    </div>
  )
} 