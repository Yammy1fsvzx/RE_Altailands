import type { Metadata } from "next"
import { Plus_Jakarta_Sans, Inter, Play } from "next/font/google";
import "./globals.css"
import SessionProvider from "@/components/providers/SessionProvider"
import VisitTracker from '@/components/VisitTracker'
import ConditionalHeader from '@/components/ConditionalHeader'
import ConditionalFooter from '@/components/ConditionalFooter'

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  variable: "--font-inter",
  display: "swap",
});

const play = Play({
  weight: ['400', '700'],
  subsets: ['cyrillic'],
  display: 'swap',
  fallback: ['system-ui', 'arial'],
  preload: true,
})

export const metadata: Metadata = {
  title: "AltaiLand - Земельные участки в Алтае",
  description: "Продажа земельных участков в живописных местах Алтая",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru">
      <body className={`${plusJakartaSans.variable} ${inter.variable} ${play.className}`}>
        <SessionProvider>
          <VisitTracker />
          <ConditionalHeader />
          {children}
          <ConditionalFooter />
        </SessionProvider>
      </body>
    </html>
  )
}
