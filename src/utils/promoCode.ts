/**
 * Генерирует случайный промокод заданной длины
 * @param length Длина промокода (по умолчанию 8 символов)
 * @returns Сгенерированный промокод
 */
export function generatePromoCode(length: number = 8): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = ''
  
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length)
    result += characters.charAt(randomIndex)
  }
  
  return result
} 