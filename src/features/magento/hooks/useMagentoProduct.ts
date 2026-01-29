import { useQuery } from '@tanstack/react-query'
import type { MagentoProductMapped } from '../lib/magento.schema'

// Fetch producto desde API local
async function fetchMagentoProduct(sku: string): Promise<MagentoProductMapped> {
  const response = await fetch(`/api/magento/product/${encodeURIComponent(sku)}`)
  
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Error al buscar producto')
  }
  
  return response.json()
}

// Hook para buscar producto en Magento
export function useMagentoProduct(sku: string, enabled = true) {
  return useQuery({
    queryKey: ['magento-product', sku],
    queryFn: () => fetchMagentoProduct(sku),
    enabled: enabled && sku.length > 0,
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutos - datos se consideran frescos
    gcTime: 10 * 60 * 1000, // 10 minutos - mantener en caché
    placeholderData: undefined, // No mostrar datos placeholder
  })
}
