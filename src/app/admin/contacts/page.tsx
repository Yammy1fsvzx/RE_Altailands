import prisma from '@/lib/prisma'
import ContactForm from '@/components/admin/ContactForm'

export default async function ContactsPage() {
  const contact = await prisma.contact.findFirst({
    include: {
      workingHours: true,
      socialMedia: true,
    },
  })

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Контактная информация
        </h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Управление контактными данными сайта
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <ContactForm initialData={contact} />
        </div>
      </div>
    </div>
  )
} 