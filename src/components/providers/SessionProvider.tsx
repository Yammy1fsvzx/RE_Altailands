'use client'

import { SessionProvider as Provider } from 'next-auth/react'

type Props = {
  children: React.ReactNode
}

export default function SessionProvider({ children }: Props) {
  return (
    <Provider 
      session={undefined}
      refetchInterval={0}
      refetchOnWindowFocus={false}
    >
      {children}
    </Provider>
  )
} 