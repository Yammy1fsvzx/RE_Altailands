const { PrismaClient, PlotStatus, ApplicationType, Role } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  // Очищаем существующие данные
  await prisma.comment.deleteMany()
  await prisma.application.deleteMany()
  await prisma.plotMedia.deleteMany()
  await prisma.plotDocument.deleteMany()
  await prisma.plotCadastral.deleteMany()
  await prisma.plotCommunication.deleteMany()
  await prisma.plotFeature.deleteMany()
  await prisma.plot.deleteMany()
  await prisma.quizAnswer.deleteMany()
  await prisma.quizQuestion.deleteMany()
  await prisma.quiz.deleteMany()
  await prisma.user.deleteMany()

  // Создаем админа
  const hashedPassword = await bcrypt.hash('admin123', 12)
  const admin = await prisma.user.create({
    data: {
      email: 'admin@altailands.ru',
      name: 'Администратор',
      password: hashedPassword,
      role: Role.ADMIN
    }
  })

  // Создаем тестовые участки
  const plots = [
    {
      title: 'Живописный участок у реки',
      slug: 'zhivopisnyy-uchastok-u-reki',
      description: 'Прекрасный участок с видом на реку, идеально подходит для строительства загородного дома.',
      area: 1500,
      price: 3500000,
      pricePerMeter: 2333,
      region: 'Алтайский край',
      locality: 'село Алтайское',
      landUseType: 'ИЖС',
      landCategory: 'Земли населенных пунктов',
      status: PlotStatus.AVAILABLE,
      isVisible: true,
      media: {
        create: [
          {
            url: '/plots/plot1-1.jpg',
            name: 'Вид на реку',
            type: 'image/jpeg',
            order: 1,
          },
          {
            url: '/plots/plot1-2.jpg',
            name: 'Общий вид участка',
            type: 'image/jpeg',
            order: 2,
          }
        ]
      },
      documents: {
        create: [
          {
            title: 'Свидетельство о собственности',
            name: 'sviditelstvo.pdf',
            url: '/documents/doc1.pdf',
          }
        ]
      },
      cadastralNumbers: {
        create: [
          {
            number: '22:01:123456:789'
          }
        ]
      },
      communications: {
        create: [
          {
            type: 'Электричество',
            name: 'electricity',
            description: '15 кВт, подключено'
          },
          {
            type: 'Вода',
            name: 'water',
            description: 'Скважина 20м'
          }
        ]
      },
      features: {
        create: [
          {
            title: 'Река рядом',
            name: 'river',
            description: '100м до реки'
          },
          {
            title: 'Лес рядом',
            name: 'forest',
            description: 'Сосновый бор в 500м'
          }
        ]
      }
    },
    {
      title: 'Участок в сосновом бору',
      slug: 'uchastok-v-sosnovom-boru',
      description: 'Великолепный участок в окружении соснового леса. Чистый воздух и тишина.',
      area: 2000,
      price: 4500000,
      pricePerMeter: 2250,
      region: 'Алтайский край',
      locality: 'поселок Сосновка',
      landUseType: 'ИЖС',
      landCategory: 'Земли населенных пунктов',
      status: PlotStatus.RESERVED,
      isVisible: true,
      media: {
        create: [
          {
            url: '/plots/plot2-1.jpg',
            name: 'Вид на лес',
            type: 'image/jpeg',
            order: 1,
          }
        ]
      },
      cadastralNumbers: {
        create: [
          {
            number: '22:02:234567:890'
          }
        ]
      },
      communications: {
        create: [
          {
            type: 'Электричество',
            name: 'electricity',
            description: '10 кВт, по границе'
          },
          {
            type: 'Газ',
            name: 'gas',
            description: 'Магистральный газ по границе'
          }
        ]
      },
      features: {
        create: [
          {
            title: 'Лес',
            name: 'forest',
            description: 'Участок в сосновом лесу'
          }
        ]
      }
    },
    {
      title: 'Участок под коммерческую застройку',
      slug: 'uchastok-pod-kommercheskuyu-zastroyku',
      description: 'Перспективный участок под коммерческую застройку в развивающемся районе.',
      area: 5000,
      price: 12000000,
      pricePerMeter: 2400,
      region: 'Алтайский край',
      locality: 'город Бийск',
      landUseType: 'Коммерческое использование',
      landCategory: 'Земли населенных пунктов',
      status: PlotStatus.AVAILABLE,
      isVisible: true,
      media: {
        create: [
          {
            url: '/plots/plot3-1.jpg',
            name: 'Вид с дороги',
            type: 'image/jpeg',
            order: 1,
          },
          {
            url: '/plots/plot3-2.jpg',
            name: 'Панорама участка',
            type: 'image/jpeg',
            order: 2,
          },
          {
            url: '/plots/plot3-3.jpg',
            name: 'План участка',
            type: 'image/jpeg',
            order: 3,
          }
        ]
      },
      documents: {
        create: [
          {
            title: 'Градостроительный план',
            name: 'gradplan.pdf',
            url: '/documents/doc3-1.pdf',
          },
          {
            title: 'Технические условия',
            name: 'tech-conditions.pdf',
            url: '/documents/doc3-2.pdf',
          }
        ]
      },
      cadastralNumbers: {
        create: [
          {
            number: '22:03:345678:901'
          }
        ]
      },
      communications: {
        create: [
          {
            type: 'Электричество',
            name: 'electricity',
            description: '100 кВт, ТП на участке'
          },
          {
            type: 'Вода',
            name: 'water',
            description: 'Центральное водоснабжение'
          },
          {
            type: 'Канализация',
            name: 'sewage',
            description: 'Центральная канализация'
          }
        ]
      }
    }
  ]

  const createdPlots = []
  for (const plot of plots) {
    const createdPlot = await prisma.plot.create({
      data: plot
    })
    createdPlots.push(createdPlot)
  }

  // Создаем тестовый квиз
  const quiz = await prisma.quiz.create({
    data: {
      title: 'Подбор участка',
      description: 'Ответьте на несколько вопросов для подбора идеального участка',
      isActive: true,
      questions: {
        create: [
          {
            title: 'Какой тип участка вас интересует?',
            type: 'SINGLE',
            order: 0,
            isRequired: true,
            answers: {
              create: [
                { text: 'Под ИЖС', order: 0 },
                { text: 'Под коммерческую застройку', order: 1 },
                { text: 'Под дачное строительство', order: 2 }
              ]
            }
          },
          {
            title: 'Какая площадь участка вас интересует?',
            type: 'SINGLE',
            order: 1,
            isRequired: true,
            answers: {
              create: [
                { text: 'До 1000 м²', order: 0 },
                { text: '1000-2000 м²', order: 1 },
                { text: 'Более 2000 м²', order: 2 }
              ]
            }
          }
        ]
      }
    },
    include: {
      questions: {
        include: {
          answers: true
        }
      }
    }
  })

  // Создаем тестовые заявки
  const applications = [
    {
      type: ApplicationType.QUIZ,
      name: 'Иван Петров',
      email: 'ivan@example.com',
      phone: '+7 (999) 123-45-67',
      status: 'NEW',
      quizId: quiz.id,
      quizAnswers: {
        [quiz.questions[0].id]: quiz.questions[0].answers[0].text,
        [quiz.questions[1].id]: quiz.questions[1].answers[1].text
      }
    },
    {
      type: ApplicationType.PLOT,
      name: 'Мария Сидорова',
      email: 'maria@example.com',
      phone: '+7 (999) 765-43-21',
      status: 'IN_PROGRESS',
      plotId: createdPlots[0].id,
      message: 'Интересует возможность электроснабжения участка'
    },
    {
      type: ApplicationType.CONTACT,
      name: 'Алексей Иванов',
      email: 'alex@example.com',
      phone: '+7 (999) 999-99-99',
      status: 'COMPLETED',
      message: 'Прошу проконсультировать по процедуре оформления земли в собственность'
    }
  ]

  // Создаем заявки и добавляем к ним комментарии
  for (const applicationData of applications) {
    const application = await prisma.application.create({
      data: applicationData
    })

    // Добавляем комментарии к заявке
    if (application.type === ApplicationType.QUIZ) {
      await prisma.comment.create({
        data: {
          text: 'Перезвонить в понедельник',
          authorId: admin.id,
          applicationId: application.id
        }
      })
    } else if (application.type === ApplicationType.PLOT) {
      await prisma.comment.create({
        data: {
          text: 'Отправлены документы по электричеству',
          authorId: admin.id,
          applicationId: application.id
        }
      })
    } else if (application.type === ApplicationType.CONTACT) {
      await prisma.comment.createMany({
        data: [
          {
            text: 'Консультация проведена',
            authorId: admin.id,
            applicationId: application.id
          },
          {
            text: 'Клиент принял решение',
            authorId: admin.id,
            applicationId: application.id
          }
        ]
      })
    }
  }

  console.log('База данных успешно заполнена тестовыми данными')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 