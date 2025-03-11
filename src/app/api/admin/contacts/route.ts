import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import prisma from '@/lib/prisma'
import { options } from '../../auth/[...nextauth]/options'

export async function GET() {
  const session = await getServerSession(options)
  
  if (!session?.user || session.user.role !== 'ADMIN') {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  const contact = await prisma.contact.findFirst({
    include: {
      workingHours: true,
      socialMedia: true,
    },
  })

  return NextResponse.json(contact)
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(options)
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return new NextResponse(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const data = await request.json()

    // Проверяем только обязательные поля
    if (!data.phone || !data.email || !data.address) {
      return new NextResponse(
        JSON.stringify({ error: 'Не заполнены обязательные поля' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Проверяем корректность данных рабочих часов
    if (!Array.isArray(data.workingHours) || data.workingHours.length !== 7) {
      return new NextResponse(
        JSON.stringify({ error: 'Некорректные данные рабочих часов' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Ищем существующий контакт
    const existingContact = await prisma.contact.findFirst({
      include: { socialMedia: true }
    })

    // Проверяем, есть ли непустые значения в социальных сетях
    const hasSocialMedia = data.socialMedia && (
      data.socialMedia.whatsapp?.trim() || 
      data.socialMedia.telegram?.trim() || 
      data.socialMedia.instagram?.trim()
    )

    // Если существует контакт и у него есть socialMedia, но в новых данных все поля пустые,
    // то удаляем существующую запись socialMedia
    if (existingContact?.id && existingContact.socialMedia && !hasSocialMedia) {
      await prisma.socialMedia.deleteMany({
        where: { contactId: existingContact.id }
      })
    }

    // Формируем объект для обновления
    const updateData: any = {
      phone: data.phone,
      email: data.email,
      address: data.address,
      workingHours: {
        deleteMany: {},
        create: data.workingHours.map((hours: any) => ({
          dayOfWeek: hours.dayOfWeek,
          openTime: hours.openTime,
          closeTime: hours.closeTime,
          isWorkingDay: hours.isWorkingDay,
        })),
      }
    }

    // Добавляем socialMedia только если есть непустые значения
    if (hasSocialMedia) {
      updateData['socialMedia'] = {
        upsert: {
          create: {
            whatsapp: data.socialMedia.whatsapp?.trim() || null,
            telegram: data.socialMedia.telegram?.trim() || null,
            instagram: data.socialMedia.instagram?.trim() || null,
          },
          update: {
            whatsapp: data.socialMedia.whatsapp?.trim() || null,
            telegram: data.socialMedia.telegram?.trim() || null,
            instagram: data.socialMedia.instagram?.trim() || null,
          },
        },
      }
    }

    // Создаем или обновляем контакт
    const contact = await prisma.contact.upsert({
      where: {
        id: existingContact?.id || '',
      },
      create: {
        phone: data.phone,
        email: data.email,
        address: data.address,
        workingHours: {
          create: data.workingHours.map((hours: any) => ({
            dayOfWeek: hours.dayOfWeek,
            openTime: hours.openTime,
            closeTime: hours.closeTime,
            isWorkingDay: hours.isWorkingDay,
          })),
        },
        ...(hasSocialMedia ? {
          socialMedia: {
            create: {
              whatsapp: data.socialMedia.whatsapp?.trim() || null,
              telegram: data.socialMedia.telegram?.trim() || null,
              instagram: data.socialMedia.instagram?.trim() || null,
            },
          }
        } : {}),
      },
      update: updateData,
      include: {
        workingHours: true,
        socialMedia: true,
      },
    })

    return NextResponse.json(contact)
  } catch (error: any) {
    console.error('Error creating/updating contact:', error)
    return new NextResponse(
      JSON.stringify({ 
        error: 'Ошибка при сохранении контакта', 
        details: error.message || String(error)
      }),
      { 
        status: 500, 
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
} 