import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { ProductQuery } from '../schemas/product.schema'

interface Product {
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

interface ProductsResponse {
  products: Product[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// Fetch products
async function fetchProducts(params: ProductQuery): Promise<ProductsResponse> {
  const searchParams = new URLSearchParams()
  
  if (params.page) searchParams.append('page', params.page.toString())
  if (params.limit) searchParams.append('limit', params.limit.toString())
  if (params.search) searchParams.append('search', params.search)
  if (params.brand) searchParams.append('brand', params.brand)
  if (params.enabled !== undefined) searchParams.append('enabled', params.enabled.toString())

  const response = await fetch(`/api/products?${searchParams}`)
  
  if (!response.ok) {
    throw new Error('Error al cargar productos')
  }
  
  return response.json()
}

// Hook para obtener productos
export function useProducts(params: ProductQuery) {
  return useQuery({
    queryKey: ['products', params],
    queryFn: () => fetchProducts(params),
    staleTime: 5 * 60 * 1000, // 5 minutos - datos se consideran frescos
    gcTime: 10 * 60 * 1000, // 10 minutos - mantener en caché
    placeholderData: (previousData) => previousData, // Mostrar datos previos mientras carga
    refetchOnMount: false, // No refetch al montar si hay datos frescos
    refetchOnWindowFocus: false, // No refetch al volver a la ventana
  })
}

// Hook para eliminar producto
export function useDeleteProduct() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
      })
      
      if (!response.ok) {
        throw new Error('Error al eliminar producto')
      }
      
      return response.json()
    },
    onSuccess: () => {
      // Invalidar caché de productos para refrescar
      queryClient.invalidateQueries({ queryKey: ['products'] })
    },
  })
}

// Hook para crear/actualizar producto
export function useSaveProduct() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ id, data }: { id?: number; data: any }) => {
      const url = id ? `/api/products/${id}` : '/api/products'
      const method = id ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Error al guardar producto')
      }
      
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
    },
  })
}
