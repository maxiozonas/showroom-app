import { useState, useCallback } from 'react'
import type { Product } from '../types'

export function useProductSelection() {
  const [selectedIds, setSelectedIds] = useState<Set<number>>(() => new Set())
  const [selectedProducts, setSelectedProducts] = useState<Product[]>(() => [])

  const toggleProduct = useCallback((productId: number, product: Product) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev)
      if (newSet.has(productId)) {
        newSet.delete(productId)
        setSelectedProducts(prevProducts => prevProducts.filter(p => p.id !== productId))
      } else {
        newSet.add(productId)
        setSelectedProducts(prevProducts => [...prevProducts, product])
      }
      return newSet
    })
  }, [])

  const toggleAll = useCallback((products: Product[]) => {
    setSelectedIds(prev => {
      const allSelected = products.every(p => prev.has(p.id))
      
      if (allSelected) {
        // Deseleccionar todos
        const idsToRemove = new Set(products.map(p => p.id))
        const newSet = new Set(prev)
        idsToRemove.forEach(id => newSet.delete(id))
        
        setSelectedProducts(prevProducts => prevProducts.filter(p => !idsToRemove.has(p.id)))
        return newSet
      } else {
        // Seleccionar todos los que no están seleccionados
        const newSet = new Set(prev)
        const newProducts = [...selectedProducts]
        
        products.forEach(p => {
          if (!newSet.has(p.id)) {
            newSet.add(p.id)
            newProducts.push(p)
          }
        })
        
        setSelectedProducts(newProducts)
        return newSet
      }
    })
  }, [selectedProducts])

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set())
    setSelectedProducts([])
  }, [])

  const isSelected = useCallback((productId: number) => selectedIds.has(productId), [selectedIds])

  return {
    selectedIds: Array.from(selectedIds),
    selectedProducts,
    toggleProduct,
    toggleAll,
    clearSelection,
    isSelected,
    count: selectedIds.size,
  }
}
