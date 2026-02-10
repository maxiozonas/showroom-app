export interface Product {
  id: number
  sku: string
  name: string
  brand: string | null
  urlKey: string | null
  enabled: boolean
  category?: {
    id: number
    name: string
    slug: string
  } | null
  createdAt: string
  updatedAt: string
}
