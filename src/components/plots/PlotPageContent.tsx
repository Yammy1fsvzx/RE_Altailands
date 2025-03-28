'use client'

import PlotGallery from '@/components/plots/PlotGallery'
import PlotInfo from '@/components/plots/PlotInfo'
import PlotDocuments from '@/components/plots/PlotDocuments'
import PlotFeatures from '@/components/plots/PlotFeatures'
import PlotCommunications from '@/components/plots/PlotCommunications'
import SimilarPlots from '@/components/plots/SimilarPlots'
import ContactForm from '@/components/forms/ContactForm'

interface PlotPageContentProps {
  plot: any // Здесь нужно определить правильный тип для plot
}

export default function PlotPageContent({ plot }: PlotPageContentProps) {
  return (
    <main className="min-h-screen bg-gray-50 pt-16 md:pt-20">
      <PlotGallery media={plot.media} />

      <div className="max-w-7xl mx-auto px-4 py-4 sm:py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <PlotInfo plot={plot} />
            
            {plot.documents.length > 0 && (
              <PlotDocuments documents={plot.documents} />
            )}

            {plot.features.length > 0 && (
              <PlotFeatures features={plot.features} />
            )}

            {plot.communications.length > 0 && (
              <PlotCommunications communications={plot.communications} />
            )}
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
              <ContactForm 
                type="PLOT"
                plotId={plot.id}
                plotTitle={plot.title}
              />
            </div>
          </div>
        </div>

        <div className="mt-12 sm:mt-16">
          <SimilarPlots 
            currentPlotId={plot.id}
            region={plot.region}
            priceRange={[plot.price * 0.7, plot.price * 1.3]}
            areaRange={[plot.area * 0.7, plot.area * 1.3]}
          />
        </div>
      </div>
    </main>
  )
} 