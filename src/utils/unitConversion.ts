/**
 * Конвертирует площадь из квадратных метров в сотки
 * 1 сотка = 100 кв.м
 */
export function squareMetersToSotka(squareMeters: number): number {
  return squareMeters / 100;
}

/**
 * Конвертирует площадь из соток в квадратные метры
 * 1 сотка = 100 кв.м
 */
export function sotkaToSquareMeters(sotka: number): number {
  return sotka * 100;
}

/**
 * Конвертирует цену за квадратный метр в цену за сотку
 * 1 сотка = 100 кв.м
 */
export function pricePerMeterToPricePerSotka(pricePerMeter: number): number {
  return pricePerMeter * 100;
}

/**
 * Конвертирует цену за сотку в цену за квадратный метр
 * 1 сотка = 100 кв.м
 */
export function pricePerSotkaToPricePerMeter(pricePerSotka: number): number {
  return pricePerSotka / 100;
}

/**
 * Форматирует число соток для отображения
 * @param sotka Количество соток
 * @param digits Количество цифр после запятой
 */
export function formatSotka(sotka: number, digits: number = 0): string {
  // Если число целое, отображаем его без десятичной части
  if (Number.isInteger(sotka)) {
    return sotka.toString();
  }
  
  // Иначе форматируем с указанным количеством знаков после запятой
  return sotka.toFixed(digits);
} 