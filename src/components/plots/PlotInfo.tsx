import { MapPinIcon } from '@heroicons/react/24/outline'
import { formatPrice } from '@/utils/formatters'
import CadastralNumber from './CadastralNumber'
import { squareMetersToSotka, pricePerMeterToPricePerSotka, formatSotka } from '@/utils/unitConversion'

interface Plot {
  id: string
  title: string
  description: string
  area: number
  price: number
  pricePerMeter: number
  region: string
  locality: string
  landUseType: string
  landCategory: string
  cadastralNumbers: {
    id: string
    number: string
  }[]
}

interface PlotInfoProps {
  plot: Plot
}

export default function PlotInfo({ plot }: PlotInfoProps) {
  // Преобразуем площадь из квадратных метров в сотки
  const areaSotka = squareMetersToSotka(plot.area);
  // Преобразуем цену за квадратный метр в цену за сотку
  const pricePerSotka = pricePerMeterToPricePerSotka(plot.pricePerMeter);

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      {/* Заголовок и цена */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {plot.title}
            </h1>
            <div className="flex items-center text-gray-600">
              <MapPinIcon className="w-5 h-5 mr-1.5" />
              <span>{plot.locality}, {plot.region}</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900 whitespace-nowrap">
              {formatPrice(plot.price)} ₽
            </div>
            <div className="text-sm text-gray-600 whitespace-nowrap">
              {formatPrice(pricePerSotka)} ₽/сотка
            </div>
          </div>
        </div>
      </div>

      {/* Основные характеристики */}
      <div className="p-6">
        <h2 className="text-lg font-semibold mb-4">Характеристики участка</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6">
          <div>
            <div className="text-sm font-medium text-gray-500">Площадь</div>
            <div className="mt-1 text-lg">{formatSotka(areaSotka)} соток</div>
          </div>
          
          <div>
            <div className="text-sm font-medium text-gray-500">Стоимость сотки</div>
            <div className="mt-1 text-lg">{formatPrice(pricePerSotka)} ₽</div>
          </div>
          
          <div>
            <div className="text-sm font-medium text-gray-500">Вид разрешенного использования</div>
            <div className="mt-1">{plot.landUseType}</div>
          </div>
          
          <div>
            <div className="text-sm font-medium text-gray-500">Категория земель</div>
            <div className="mt-1">{plot.landCategory}</div>
          </div>

          {plot.cadastralNumbers.length > 0 && (
            <div className="sm:col-span-2">
              <div className="text-sm font-medium text-gray-500 mb-1">Кадастровый номер</div>
              <div className="flex flex-wrap gap-2">
                {plot.cadastralNumbers.map(cadastral => (
                  <CadastralNumber key={cadastral.id} number={cadastral.number} />
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">Описание</h3>
          <div className="prose prose-sm max-w-none text-gray-600" dangerouslySetInnerHTML={{ __html: plot.description }} />
        </div>
      </div>
    </div>
  )
} 