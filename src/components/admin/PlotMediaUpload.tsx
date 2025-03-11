'use client'

import { useState, useCallback, useEffect } from 'react'
import { useDropzone } from 'react-dropzone'
import Image from 'next/image'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { PlotMedia } from '@prisma/client'

type PlotMediaUploadProps = {
  initialMedia?: (File | PlotMedia)[]
  onMediaChange: (media: (File | PlotMedia)[]) => void
}

export default function PlotMediaUpload({ initialMedia = [], onMediaChange }: PlotMediaUploadProps) {
  const [media, setMedia] = useState<(File | PlotMedia)[]>([])

  // Синхронизируем локальное состояние с initialMedia
  useEffect(() => {
    setMedia(initialMedia)
  }, [initialMedia])

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newMedia = [...media, ...acceptedFiles]
    setMedia(newMedia)
    onMediaChange(newMedia)
  }, [media, onMediaChange])

  const removeMedia = useCallback((index: number) => {
    const newMedia = media.filter((_, i) => i !== index)
    setMedia(newMedia)
    onMediaChange(newMedia)
  }, [media, onMediaChange])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp'],
      'video/*': ['.mp4', '.webm', '.ogg']
    }
  })

  const getMediaPreview = useCallback((file: File | PlotMedia) => {
    if (file instanceof File) {
      return URL.createObjectURL(file)
    }
    return file.url
  }, [])

  const getMediaType = useCallback((file: File | PlotMedia) => {
    if (file instanceof File) {
      return file.type
    }
    return file.type || 'image/jpeg'
  }, [])

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
          ${isDragActive
            ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950'
            : 'border-gray-300 dark:border-gray-600 hover:border-indigo-500 dark:hover:border-indigo-500'
          }`}
      >
        <input {...getInputProps()} />
        {isDragActive ? (
          <p className="text-indigo-600 dark:text-indigo-400">
            Перетащите файлы сюда...
          </p>
        ) : (
          <p className="text-gray-600 dark:text-gray-400">
            Перетащите файлы сюда или нажмите для выбора
          </p>
        )}
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
          Поддерживаются изображения (JPEG, PNG, GIF, WebP) и видео (MP4, WebM, OGG)
        </p>
      </div>

      {media.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {media.map((file, index) => (
            <div
              key={index}
              className="relative group aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden"
            >
              {getMediaType(file).startsWith('image/') ? (
                <Image
                  src={getMediaPreview(file)}
                  alt={file instanceof File ? file.name : file.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
                />
              ) : (
                <video
                  src={getMediaPreview(file)}
                  className="w-full h-full object-cover"
                />
              )}
              <button
                type="button"
                onClick={() => removeMedia(index)}
                className="absolute top-2 right-2 p-1 bg-white/80 dark:bg-black/80 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <XMarkIcon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
} 