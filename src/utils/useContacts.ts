import { useState, useEffect } from 'react'

export interface WorkingHours {
  id: string
  dayOfWeek: 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY'
  openTime: string
  closeTime: string
  isWorkingDay: boolean
}

export interface SocialMedia {
  id: string
  whatsapp: string | null
  telegram: string | null
  instagram: string | null
}

export interface ContactInfo {
  id: string
  phone: string
  email: string
  address: string
  workingHours: WorkingHours[]
  socialMedia: SocialMedia | null
}

export function useContacts() {
  const [contactInfo, setContactInfo] = useState<ContactInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const response = await fetch('/api/contacts')
        if (!response.ok) {
          throw new Error('Ошибка при получении контактных данных')
        }
        const data = await response.json()
        setContactInfo(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Произошла ошибка')
      } finally {
        setIsLoading(false)
      }
    }

    fetchContacts()
  }, [])

  return { contactInfo, isLoading, error }
} 