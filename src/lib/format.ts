export function formatPrice(price: number): string {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0,
  }).format(price)
}

export function formatArea(area: number): string {
  return `${area.toLocaleString('ru-RU')} м²`
} 