import { hash } from 'bcryptjs'
import prisma from '../lib/prisma'

async function main() {
  const password = await hash('admin123', 12)
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      name: 'Admin',
      password,
      role: 'ADMIN',
    },
  })
  
  console.log('Admin created:', admin)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect()) 