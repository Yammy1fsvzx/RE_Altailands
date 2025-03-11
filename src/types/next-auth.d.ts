import { Role } from '@prisma/client'
import 'next-auth'
import { DefaultSession } from 'next-auth'
import { JWT } from 'next-auth/jwt'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      role: Role
    } & DefaultSession['user']
  }

  interface User {
    role: Role
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: Role
    id: string
  }
}

// Для middleware
declare module 'next-auth/middleware' {
  interface NextAuthMiddlewareOptions {
    callbacks?: {
      authorized?: (params: { token: JWT | null }) => boolean | Promise<boolean>
    }
  }
} 