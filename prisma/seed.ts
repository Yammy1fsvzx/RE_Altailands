const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcrypt')

const prisma = new PrismaClient()

async function main() {
  // Сохраняем текущие данные
  const existingPlots = await prisma.plot.findMany({
    include: {
      media: true,
      documents: true,
      cadastralNumbers: true,
      communications: true,
      features: true,
    }
  })

  const existingContacts = await prisma.contact.findMany({
    include: {
      workingHours: true,
      socialMedia: true,
    }
  })

  // Создаем или обновляем администратора
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@altailands.ru'
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123'
  
  const hashedPassword = await bcrypt.hash(adminPassword, 10)
  
  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      password: hashedPassword,
      role: 'ADMIN'
    },
    create: {
      email: adminEmail,
      password: hashedPassword,
      role: 'ADMIN',
      name: 'Administrator'
    }
  })

  console.log('Администратор создан/обновлен:', admin.email)

  // Очищаем только данные квиза
  await prisma.quizAnswer.deleteMany()
  await prisma.quizQuestion.deleteMany()
  await prisma.quiz.deleteMany()

  // Создаем новый квиз
  const quiz = await prisma.quiz.create({
    data: {
      title: 'Ответьте на 4 простых вопроса. И получите бесплатную консультацию юриста по ЗУ.',
      description: 'Ответьте на несколько вопросов для подбора идеального участка',
      isActive: true,
      questions: {
        create: [
          {
            title: 'Какая площадь участка вас интересует?',
            type: 'SINGLE',
            order: 0,
            isRequired: true,
            answers: {
              create: [
                { text: 'до 20 соток', order: 0 },
                { text: 'от 20-100 соток', order: 1 },
                { text: 'от 1-5 ГА', order: 2 },
                { text: '5 ГА и более', order: 3 }
              ]
            }
          },
          {
            title: 'Какие особенности участка для вас важны?',
            type: 'MULTIPLE',
            order: 1,
            isRequired: true,
            answers: {
              create: [
                { text: '1-ая береговая линия', order: 0 },
                { text: 'наличие сосен на территории', order: 1 },
                { text: 'сильная удаленность от населенных пунктов (живописный дикий Алтай)', order: 2 }
              ]
            }
          },
          {
            title: 'Когда планируете приобретение земли?',
            type: 'SINGLE',
            order: 2,
            isRequired: true,
            answers: {
              create: [
                { text: 'в ближайший месяц', order: 0 },
                { text: 'в ближайший квартал', order: 1 },
                { text: 'в этом году', order: 2 }
              ]
            }
          },
          {
            title: 'Какой бюджет предусмотрен на покупку?',
            type: 'SINGLE',
            order: 3,
            isRequired: true,
            answers: {
              create: [
                { text: 'до 10 млн рублей', order: 0 },
                { text: 'до 100 млн рублей', order: 1 },
                { text: 'свыше 100 млн рублей', order: 2 }
              ]
            }
          }
        ]
      }
    },
    include: {
      questions: true
    }
  })

  console.log('Квиз успешно обновлен:', quiz.title)
  console.log('Количество вопросов:', quiz.questions.length)
  console.log('Существующие участки сохранены:', existingPlots.length)
  console.log('Существующие контакты сохранены:', existingContacts.length)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 