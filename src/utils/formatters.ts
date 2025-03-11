/**
 * Форматирует номер телефона в читаемый вид
 * @param phone Номер телефона
 * @returns Отформатированный номер телефона
 */
export function formatPhoneNumber(phone: string): string {
  // Удаляем все нецифровые символы
  const cleaned = phone.replace(/\D/g, '')
  
  // Проверяем длину номера
  if (cleaned.length !== 11) {
    return phone // Возвращаем исходный номер, если он не соответствует формату
  }
  
  // Форматируем номер в виде +7 (XXX) XXX-XX-XX
  return `+7 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7, 9)}-${cleaned.slice(9)}`
}

/**
 * Форматирует число с разделителями тысяч
 * @param price Число для форматирования
 * @returns Отформатированное число
 */
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('ru-RU').format(price)
} 