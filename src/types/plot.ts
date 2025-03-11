import { Plot, PlotMedia, PlotDocument, PlotCadastral, PlotStatus } from '@prisma/client'

export interface ExtendedPlot extends Plot {
  cadastralNumber?: string | null
  _count: {
    media: number
    features: number
    communications: number
    documents: number
  }
}

export interface PlotTableItem {
  id: string
  title: string
  cadastralNumber?: string | null
  price: number
  pricePerMeter: number
  area: number
  status: PlotStatus
  isVisible: boolean
  media?: PlotMedia[]
}

export type SimpleCommunication = {
  name: string
}

export type SimpleFeature = {
  name: string
}

export type PlotFormData = {
  title: string
  slug: string
  description: string
  media: (File | PlotMedia)[]
  documents: (File | PlotDocument)[]
  region: string
  locality: string
  cadastralNumbers: (Omit<PlotCadastral, 'id' | 'createdAt' | 'updatedAt' | 'plotId'> | PlotCadastral)[]
  landUseType: string
  landCategory: string
  communications: SimpleCommunication[]
  features: SimpleFeature[]
  area: number
  price: number
  pricePerMeter: number
  status: PlotStatus
  isVisible: boolean
} 