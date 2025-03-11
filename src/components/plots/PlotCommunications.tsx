interface Communication {
  name: string
  type: string
  description: string
}

interface PlotCommunicationsProps {
  communications: Communication[]
}

export default function PlotCommunications({ communications }: PlotCommunicationsProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">
          Коммуникации
        </h2>
        <div className="grid gap-4">
          {communications.map((communication) => (
            <div key={communication.name} className="flex gap-4">
              <div className="w-2 h-2 rounded-full bg-green-500 mt-2 flex-shrink-0" />
              <div>
                <div className="font-medium text-gray-900">{communication.name}</div>
                {communication.description && (
                  <p className="text-sm text-gray-500">{communication.description}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
} 