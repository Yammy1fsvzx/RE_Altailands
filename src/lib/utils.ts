export function getMediaUrl(url: string): string {
  if (url.startsWith('http')) return url
  return `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/uploads/${url}`
}

export function slugify(text: string): string {
  const translitMap: { [key: string]: string } = {
    'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo',
    'ж': 'zh', 'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm',
    'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
    'ф': 'f', 'х': 'h', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'sch', 'ъ': '',
    'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya',
    ' ': '-', '_': '-', '/': '-'
  }

  return text
    .toLowerCase()
    .split('')
    .map(char => translitMap[char] || char)
    .join('')
    .replace(/[^a-z0-9-]/g, '') // Оставляем только латинские буквы, цифры и дефис
    .replace(/-+/g, '-') // Заменяем множественные дефисы на один
    .replace(/^-|-$/g, '') // Убираем дефисы в начале и конце
} 