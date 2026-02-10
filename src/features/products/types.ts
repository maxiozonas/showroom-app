export interface Product {
  id: number
  sku: string
  name: string
  brand: string | null
  urlKey: string | null
  enabled: boolean
  categoryId: number | null
  category?: {
    id: number
    name: string
    slug: string
  } | null
  hasQrs?: boolean
  createdAt: string
  updatedAt: string
}
