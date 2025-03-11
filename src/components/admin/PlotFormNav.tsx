import { useFormContext } from 'react-hook-form'
import { 
  DocumentTextIcon, 
  PhotoIcon, 
  MapPinIcon, 
  DocumentDuplicateIcon,
  BoltIcon,
  StarIcon
} from '@heroicons/react/24/outline'
import clsx from 'clsx'

type Section = {
  id: string
  title: string
  icon: React.ForwardRefExoticComponent<any>
}

const sections: Section[] = [
  { id: 'main', title: 'Основное', icon: DocumentTextIcon },
  { id: 'media', title: 'Медиафайлы', icon: PhotoIcon },
  { id: 'location', title: 'Расположение', icon: MapPinIcon },
  { id: 'cadastral', title: 'Кадастр', icon: DocumentDuplicateIcon },
  { id: 'communications', title: 'Коммуникации', icon: BoltIcon },
  { id: 'features', title: 'Особенности', icon: StarIcon },
]

export default function PlotFormNav() {
  const { formState: { errors } } = useFormContext()

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <nav className="sticky top-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-2 mb-6">
      <div className="flex flex-wrap gap-2">
        {sections.map((section) => {
          const hasError = errors[section.id]
          const Icon = section.icon

          return (
            <button
              key={section.id}
              type="button"
              onClick={() => scrollToSection(section.id)}
              className={clsx(
                'flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                'hover:bg-gray-100 dark:hover:bg-gray-700',
                hasError 
                  ? 'text-red-600 dark:text-red-400'
                  : 'text-gray-600 dark:text-gray-300'
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="hidden sm:inline">{section.title}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
} 