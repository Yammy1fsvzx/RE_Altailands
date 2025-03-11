import { MapPinIcon } from '@heroicons/react/24/outline'
import { formatPrice } from '@/utils/formatters'
import CadastralNumber from './CadastralNumber'

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
            <div className="text-2xl font-bold text-gray-900">
              {formatPrice(plot.price)} ₽
            </div>
            <div className="text-sm text-gray-600">
              {formatPrice(plot.pricePerMeter)} ₽/м²
            </div>
          </div>
        </div>
      </div>

      {/* Основные характеристики */}
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Характеристики участка
        </h2>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
          <div>
            <dt className="text-sm text-gray-600">Площадь</dt>
            <dd className="text-base font-medium text-gray-900">{plot.area} м²</dd>
          </div>
          <div>
            <dt className="text-sm text-gray-600">Вид разрешенного использования</dt>
            <dd className="text-base font-medium text-gray-900">{plot.landUseType}</dd>
          </div>
          <div>
            <dt className="text-sm text-gray-600">Категория земель</dt>
            <dd className="text-base font-medium text-gray-900">{plot.landCategory}</dd>
          </div>
          {plot.cadastralNumbers.length > 0 && (
            <div>
              <dt className="text-sm text-gray-600">Кадастровые номера</dt>
              <dd className="text-base font-medium text-gray-900">
                {plot.cadastralNumbers.map(c => (
                  <CadastralNumber key={c.number} number={c.number} />
                ))}
              </dd>
            </div>
          )}
        </dl>
      </div>

      {/* Описание */}
      <div className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Описание участка
        </h2>
        <div className="prose prose-gray max-w-none">
          <p className="whitespace-pre-wrap">{plot.description}</p>
        </div>
      </div>
    </div>
  )
} 