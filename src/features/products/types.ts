export interface Product {
  id: number
  sku: string
  name: string
  brand: string | null
  urlKey: string | null
  enabled: boolean
  hasQrs?: boolean
  createdAt: string
  updatedAt: string
}
