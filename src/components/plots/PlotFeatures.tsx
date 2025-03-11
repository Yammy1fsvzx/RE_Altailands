interface Feature {
  name: string
  title: string
  description: string
}

interface PlotFeaturesProps {
  features: Feature[]
}

export default function PlotFeatures({ features }: PlotFeaturesProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">
          Особенности участка
        </h2>
        <div className="grid gap-4">
          {features.map((feature) => (
            <div key={feature.name} className="flex gap-4">
              <div className="w-2 h-2 rounded-full bg-green-500 mt-2 flex-shrink-0" />
              <div>
                <div className="font-medium text-gray-900">{feature.name}</div>
                {feature.description && (
                  <p className="text-sm text-gray-500">{feature.description}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
} 