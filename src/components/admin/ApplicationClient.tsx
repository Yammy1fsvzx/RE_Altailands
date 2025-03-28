'use client'

import { useState, useEffect } from 'react'
import { notFound, useRouter } from 'next/navigation'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { ru } from 'date-fns/locale'
import ApplicationDetails, { ExtendedApplication } from '@/components/admin/ApplicationDetails'

interface ApplicationClientProps {
  id: string
}

export default function ApplicationClient({ id }: ApplicationClientProps) {
  const [application, setApplication] = useState<ExtendedApplication | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    async function loadApplication() {
      try {
        setLoading(true)
        const response = await fetch(`/api/admin/applications/${id}`)
        
        if (response.status === 404) {
          notFound()
        }
        
        if (!response.ok) {
          throw new Error('Ошибка загрузки данных заявки')
        }
        
        const data = await response.json()
        setApplication(data)
      } catch (error) {
        console.error('Error loading application:', error)
        setError(error instanceof Error ? error.message : 'Произошла ошибка')
      } finally {
        setLoading(false)
      }
    }
    
    loadApplication()
  }, [id])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-8 h-[400px]">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-600">Загрузка данных заявки...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white p-8 rounded-xl shadow-lg">
        <div className="text-red-500 text-center mb-4">
          <p className="mt-2 text-lg font-medium">{error}</p>
        </div>
        <div className="flex justify-center">
          <button
            onClick={() => router.push('/admin/applications')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Вернуться к списку
          </button>
        </div>
      </div>
    )
  }

  if (!application) {
    return null
  }

  return (
    <div>
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Заявка №{application.id.slice(-8)}
          </h1>
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