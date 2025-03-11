'use client'

import { useState } from 'react'

interface CadastralNumberProps {
  number: string
}

export default function CadastralNumber({ number }: CadastralNumberProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(number);
    setCopied(true);
    // Сбрасываем состояние через 2 секунды
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div 
      className="my-2 flex items-center gap-2 group cursor-pointer"
      onClick={handleCopy}
    >
      <span className="group-hover:text-green-500">
        {number}
      </span>
      <span 
        className={`text-xs transition-all duration-200 ${
          copied 
            ? 'text-green-500' 
            : 'text-gray-500 opacity-0 group-hover:opacity-100'
        }`}
      >
        {copied ? 'Скопировано!' : 'Нажмите, чтобы скопировать'}
      </span>
    </div>
  )
} 