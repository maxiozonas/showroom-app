import { useState, useCallback } from 'react'
import type { Product } from '../types'

export function useProductSelection() {
  const [selectedIds, setSelectedIds] = useState<Set<number>>(() => new Set())
  const [selectedProducts, setSelectedProducts] = useState<Product[]>(() => [])

  const toggleProduct = useCallback((productId: number, product: Product) => {
    console.log('[DEBUG useProductSelection] toggleProduct llamado:', { productId, productSku: product.sku })
    
    setSelectedIds(prev => {
      const newSet = new Set(prev)
      if (newSet.has(productId)) {
        // Deseleccionar
        newSet.delete(productId)
        setSelectedProducts(prevProducts => {
          const filtered = prevProducts.filter(p => p.id !== productId)
          console.log('[DEBUG useProductSelection] Deseleccionado:', { 
            productId, 
            prevCount: prevProducts.length,
            newCount: filtered.length 
          })
          return filtered
        })
      } else {
        // Seleccionar - 🛡️ PROTECCIÓN: Verificar que no exista antes de agregar
        newSet.add(productId)
        setSelectedProducts(prevProducts => {
          // Verificar si ya existe para evitar duplicados
          if (prevProducts.some(p => p.id === productId)) {
            console.log('[DEBUG useProductSelection] ⚠️ Producto ya existe, no se agrega:', { productId })
            return prevProducts
          }
          const newProducts = [...prevProducts, product]
          console.log('[DEBUG useProductSelection] Seleccionado:', { 
            productId, 
            prevCount: prevProducts.length,
            newCount: newProducts.length 
          })
          return newProducts
        })
      }
      return newSet
    })
  }, [])

  const toggleAll = useCallback((products: Product[]) => {
    console.log('[DEBUG useProductSelection] toggleAll llamado:', { 
      productsCount: products.length,
      productIds: products.map(p => p.id)
    })
    
    setSelectedIds(prev => {
      const allSelected = products.every(p => prev.has(p.id))
      console.log('[DEBUG useProductSelection] toggleAll - allSelected:', allSelected)

      if (allSelected) {
        // Deseleccionar todos
        const idsToRemove = new Set(products.map(p => p.id))
        const newSet = new Set(prev)
        idsToRemove.forEach(id => newSet.delete(id))

        setSelectedProducts(prevProducts => {
          const filtered = prevProducts.filter(p => !idsToRemove.has(p.id))
          console.log('[DEBUG useProductSelection] toggleAll - Deseleccionados:', {
            prevCount: prevProducts.length,
            newCount: filtered.length
          })
          return filtered
        })
        return newSet
      } else {
        // Seleccionar todos los que no están seleccionados
        const newSet = new Set(prev)

        setSelectedProducts(prevProducts => {
          const existingIds = new Set(prevProducts.map(p => p.id))
          const newProducts = [...prevProducts]
          let addedCount = 0

          products.forEach(p => {
            if (!newSet.has(p.id) && !existingIds.has(p.id)) {
              newSet.add(p.id)
              newProducts.push(p)
              addedCount++
            } else if (existingIds.has(p.id)) {
              console.log('[DEBUG useProductSelection] toggleAll - ⚠️ Producto ya existe, saltando:', { productId: p.id })
            }
          })

          console.log('[DEBUG useProductSelection] toggleAll - Seleccionados:', {
            prevCount: prevProducts.length,
            newCount: newProducts.length,
            addedCount
          })

          return newProducts
        })

        return newSet
      }
    })
  }, [])

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
