import { DocumentTextIcon } from '@heroicons/react/24/outline'

interface PlotDocument {
  id: string
  name: string
  title: string
  url: string
}

interface PlotDocumentsProps {
  documents: PlotDocument[]
}

export default function PlotDocuments({ documents }: PlotDocumentsProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">
          Прикрепленные файлы
        </h2>
        <div className="grid gap-4">
          {documents.map((doc) => (
            <a
              key={doc.id}
              href={doc.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 p-4 rounded-lg border border-gray-200 hover:border-green-500 transition-colors group"
            >
              <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0 group-hover:bg-green-100 transition-colors">
                <DocumentTextIcon className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <div className="font-medium text-gray-900 group-hover:text-green-600 transition-colors">
                  {doc.title}
                </div>
                <div className="text-sm text-gray-600">
                  {doc.name}
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  )
} 