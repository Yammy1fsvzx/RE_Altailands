'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { 
  HomeIcon, 
  PhoneIcon,
  MapIcon,
  ArrowLeftOnRectangleIcon,
  QuestionMarkCircleIcon,
  InboxIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline'

export default function Sidebar() {
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const navigation = [
    { name: 'Панель управления', href: '/admin', icon: HomeIcon },
    { name: 'Участки', href: '/admin/plots', icon: MapIcon },
    { name: 'Заявки', href: '/admin/applications', icon: InboxIcon },
    { name: 'Контакты', href: '/admin/contacts', icon: PhoneIcon },
    { name: 'Квизы', href: '/admin/quizzes', icon: QuestionMarkCircleIcon },
  ]

  return (
    <>
      {/* Мобильная навигация */}
      <div className="lg:hidden">
        <div className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
          <div className="px-4 py-2">
            <div className="flex items-center justify-between">
              <Link 
                href="/" 
                className="text-xl font-bold text-indigo-600 dark:text-indigo-400"
              >
                AltaiLands
              </Link>
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-md text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                {isMobileMenuOpen ? (
                  <XMarkIcon className="h-6 w-6" />
                ) : (
                  <Bars3Icon className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>

          {/* Выпадающее меню */}
          {isMobileMenuOpen && (
            <div className="border-b border-gray-200 dark:border-gray-800">
              <nav className="px-4 py-2 space-y-1">
                {navigation.map((item) => {
                  const isActive = pathname === item.href
                  const Icon = item.icon
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                        isActive
                          ? 'bg-indigo-50 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400'
                          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                      }`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Icon
                        className={`mr-3 flex-shrink-0 h-5 w-5 ${
                          isActive
                            ? 'text-indigo-600 dark:text-indigo-400'
                            : 'text-gray-400 dark:text-gray-600 group-hover:text-gray-500 dark:group-hover:text-gray-400'
                        }`}
                      />
                      {item.name}
                    </Link>
                  )
                })}
                <button
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="w-full flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <ArrowLeftOnRectangleIcon className="mr-3 flex-shrink-0 h-5 w-5 text-gray-400 dark:text-gray-600" />
                  Выйти
                </button>
              </nav>
            </div>
          )}
        </div>
      </div>

      {/* Десктопная боковая панель */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-white dark:bg-gray-900 pt-5 pb-4 overflow-y-auto border-r border-gray-200 dark:border-gray-800">
          <div className="flex items-center flex-shrink-0 px-4">
            <Link 
              href="/" 
              className="text-xl font-bold text-indigo-600 dark:text-indigo-400"
            >
              AltaiLands
            </Link>
          </div>
          <div className="mt-8 flex-1 flex flex-col">
            <nav className="flex-1 px-2 space-y-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href
                const Icon = item.icon
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                      isActive
                        ? 'bg-indigo-50 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                  >
                    <Icon
                      className={`mr-3 flex-shrink-0 h-6 w-6 ${
                        isActive
                          ? 'text-indigo-600 dark:text-indigo-400'
                          : 'text-gray-400 dark:text-gray-600 group-hover:text-gray-500 dark:group-hover:text-gray-400'
                      }`}
                    />
                    {item.name}
                  </Link>
                )
              })}
            </nav>
          </div>
          <div className="flex-shrink-0 flex border-t border-gray-200 dark:border-gray-800 p-4">
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="group flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 w-full"
            >
              <ArrowLeftOnRectangleIcon className="mr-3 flex-shrink-0 h-6 w-6 text-gray-400 dark:text-gray-600 group-hover:text-gray-500 dark:group-hover:text-gray-400" />
              Выйти
            </button>
          </div>
        </div>
      </div>
    </>
  )
} 