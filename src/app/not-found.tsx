'use client';

import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 bg-gray-100">
      <div className="text-center space-y-6">
        <div className="space-y-2">
          <h1 className="text-6xl md:text-8xl font-bold text-[#16a34a]">
            404
          </h1>
          <h2 className="text-2xl md:text-3xl font-semibold text-black">
            Страница не найдена
          </h2>
          <p className="text-black text-base md:text-lg max-w-lg mx-auto">
            Извините, но страница, которую вы ищете, не существует или была перемещена
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link 
            href="/"
            className="px-6 py-3 rounded-lg bg-[#16a34a] hover:bg-[#15803d] text-white font-medium transition-colors"
          >
            Вернуться на главную
          </Link>
          <Link 
            href="/catalog"
            className="px-6 py-3 rounded-lg bg-white hover:bg-gray-50 text-black border-2 border-gray-800 font-medium transition-colors"
          >
            Перейти в каталог
          </Link>
        </div>
      </div>
    </div>
  )
}