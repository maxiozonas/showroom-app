import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

interface QrHistoryItem {
  id: number
  productId: number
  url: string
  qrUrl: string
  createdAt: string
  product: {
    id: number
    sku: string
    name: string
    brand: string | null
  }
}

interface QrHistoryResponse {
  history: QrHistoryItem[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

interface QrHistoryParams {
  page: number
  limit: number
  search?: string
}

// Fetch QR history
async function fetchQrHistory(params: QrHistoryParams): Promise<QrHistoryResponse> {
  const searchParams = new URLSearchParams()
  
  searchParams.append('page', params.page.toString())
  searchParams.append('limit', params.limit.toString())
  if (params.search) searchParams.append('search', params.search)

  const response = await fetch(`/api/history?${searchParams}`)
  
  if (!response.ok) {
    throw new Error('Error al cargar historial')
  }
  
  return response.json()
}

// Hook para obtener historial
export function useQrHistory(params: QrHistoryParams) {
  return useQuery({
    queryKey: ['qr-history', params],
    queryFn: () => fetchQrHistory(params),
    staleTime: 5 * 60 * 1000, // 5 minutos - datos se consideran frescos
    gcTime: 10 * 60 * 1000, // 10 minutos - mantener en caché
    placeholderData: (previousData) => previousData, // Mostrar datos previos mientras carga
    refetchOnMount: false, // No refetch al montar si hay datos frescos
    refetchOnWindowFocus: false, // No refetch al volver a la ventana
  })
}

// Hook para eliminar QR
export function useDeleteQr() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/history/${id}`, {
        method: 'DELETE',
      })
      
      if (!response.ok) {
        throw new Error('Error al eliminar QR')
      }
      
      return response.json()
    },
    onSuccess: () => {
      // Invalidar caché de historial y productos
      queryClient.invalidateQueries({ queryKey: ['qr-history'] })
      queryClient.invalidateQueries({ queryKey: ['products'] })
    },
  })
}
