import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { options } from '../api/auth/[...nextauth]/options'
import Sidebar from '@/components/admin/Navbar'
import { NotificationProvider } from '@/contexts/NotificationContext'
import Toast from '@/components/admin/Toast'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(options)

  if (!session?.user || session.user.role !== 'ADMIN') {
    redirect('/auth/signin')
  }

  return (
    <NotificationProvider>
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
        <Sidebar />
        
        {/* Основной контент */}
        <div className="lg:pl-64">
          <main className="py-20 lg:py-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {children}
            </div>
          </main>
        </div>

        <Toast />
      </div>
    </NotificationProvider>
  )
} 