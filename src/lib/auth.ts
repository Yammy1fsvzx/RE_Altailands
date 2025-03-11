import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { Role } from '@prisma/client'
import { options } from '@/app/api/auth/[...nextauth]/options'

export async function requireAdmin() {
  const session = await getServerSession(options)
  
  if (!session?.user) {
    redirect('/auth/signin')
  }
  
  
  // @ts-ignore - мы знаем, что role существует в нашем приложении
  if (session.user.role !== Role.ADMIN) {
    redirect('/')
  }
  
  return session
} 