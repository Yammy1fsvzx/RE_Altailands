'use client'

import { useState } from 'react'
import { Plot, PlotDocument } from '@prisma/client'
import { PlusIcon, XMarkIcon } from '@heroicons/react/24/outline'

type DocumentFile = File & {
  name: string
}

type PlotDescriptionFormProps = {
  plot?: Plot & {
    documents: PlotDocument[]
  } | null
  onChange: (data: {
    title: string
    slug: string
    description: string
    documents: (DocumentFile | PlotDocument)[]
  }) => void
}

export default function PlotDescriptionForm({ plot, onChange }: PlotDescriptionFormProps) {
  const [title, setTitle] = useState(plot?.title || '')
  const [slug, setSlug] = useState(plot?.slug || '')
  const [description, setDescription] = useState(plot?.description || '')
  const [documents, setDocuments] = useState<(DocumentFile | PlotDocument)[]>(plot?.documents || [])
  const [newDocument, setNewDocument] = useState<File | null>(null)

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value
    setTitle(newTitle)
    setSlug(generateSlug(newTitle))
    onChange({
      title: newTitle,
      slug: generateSlug(newTitle),
      description,
      documents
    })
  }

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newDescription = e.target.value
    setDescription(newDescription)
    onChange({
      title,
      slug,
      description: newDescription,
      documents
    })
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setNewDocument(e.target.files[0])
    }
  }

  const handleAddDocument = () => {
    if (newDocument) {
      const newDocuments = [...documents, newDocument]
      setDocuments(newDocuments)
      setNewDocument(null)
      onChange({
        title,
        slug,
        description,
        documents: newDocuments
      })
    }
  }

  const removeDocument = (index: number) => {
    const newDocuments = documents.filter((_, i) => i !== index)
    setDocuments(newDocuments)
    onChange({
      title,
      slug,
      description,
      documents: newDocuments
    })
  }

  const generateSlug = (value: string) => {
    return value
      .toLowerCase()
      .replace(/[^a-zа-я0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '')
  }

  return (
    <div className="space-y-8 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Название
        </label>
        <input
          type="text"
          value={title}
          onChange={handleTitleChange}
          className="block w-full rounded-md border border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white p-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          URL (slug)
        </label>
        <input
          type="text"
          value={slug}
          readOnly
          className="block w-full rounded-md border border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white bg-gray-50 dark:bg-gray-600 p-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Описание
        </label>
        <textarea
          value={description}
          onChange={handleDescriptionChange}
          rows={4}
          className="block w-full rounded-md border border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white p-2"
        />
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 border-b border-gray-300 dark:border-gray-600 pb-2">
          Документы
        </h3>
        <div className="space-y-4">
          {documents.map((doc, index) => (
            <div key={index} className="flex items-start gap-4 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg shadow hover:shadow-lg transition-shadow duration-200">
              <div className="flex-1">
                <input
                  type="text"
                  value={doc instanceof File ? doc.name : doc.title}
                  readOnly
                  className="block w-full rounded-md border border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white p-2 bg-gray-50 dark:bg-gray-600"
                />
              </div>
              <button
                type="button"
                onClick={() => removeDocument(index)}
                className="inline-flex items-center justify-center rounded-full border border-transparent p-1 text-gray-600 dark:text-gray-400 shadow-sm hover:bg-red-100 dark:hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors duration-200"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
          ))}

          <div className="flex gap-2">
            <input
              type="file"
              onChange={handleFileChange}
              className="block w-full rounded-md border border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white p-2"
            />
            <button
              type="button"
              onClick={handleAddDocument}
              disabled={!newDocument}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              <PlusIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
  
} 