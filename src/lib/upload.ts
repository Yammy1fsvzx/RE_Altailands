import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { v4 as uuidv4 } from 'uuid'
import { existsSync } from 'fs'

const UPLOAD_DIR = join(process.cwd(), 'public', 'uploads')

export async function uploadFile(file: File): Promise<string> {
  try {
    // Создаем директорию, если она не существует
    if (!existsSync(UPLOAD_DIR)) {
      await mkdir(UPLOAD_DIR, { recursive: true })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Генерируем уникальное имя файла
    const ext = file.name.split('.').pop()
    const filename = `${uuidv4()}.${ext}`

    // Создаем путь для сохранения файла
    const filePath = join(UPLOAD_DIR, filename)

    // Сохраняем файл
    await writeFile(filePath, buffer)

    // Возвращаем URL для доступа к файлу
    return `/uploads/${filename}`
  } catch (error) {
    console.error('Error uploading file:', error)
    throw new Error('Failed to upload file')
  }
} 