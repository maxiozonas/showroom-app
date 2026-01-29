'use client'

import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, Search, Check, AlertCircle } from 'lucide-react'
import { useMagentoProduct } from '../hooks/useMagentoProduct'
import { toast } from 'sonner'
import type { CreateProductInput } from '@/src/features/products/schemas/product.schema'
import type { MagentoProductMapped } from '../lib/magento.schema'

interface MagentoProductDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function MagentoProductDialog({
  open,
  onOpenChange,
  onSuccess,
}: MagentoProductDialogProps) {
  const queryClient = useQueryClient()
  const [sku, setSku] = useState('')
  const [searchEnabled, setSearchEnabled] = useState(false)
  const [importing, setImporting] = useState(false)

  const {
    data: magentoProduct,
    isLoading,
    error,
    refetch,
  } = useMagentoProduct(sku, searchEnabled)

  // Buscar producto cuando cambia el SKU
  const handleSearch = () => {
    if (sku.trim().length === 0) {
      toast.error('❌ Ingresa un SKU')
      return
    }
    setSearchEnabled(true)
    refetch()
  }

  // Resetear estado al cerrar el diálogo
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setSku('')
      setSearchEnabled(false)
      queryClient.invalidateQueries({ queryKey: ['magento-product'] })
    }
    onOpenChange(newOpen)
  }

  // Importar producto directamente a la base de datos
  const handleImport = async () => {
    if (!magentoProduct) {
      return
    }

    setImporting(true)

    try {
      const productData: CreateProductInput = {
        sku: magentoProduct.sku,
        name: magentoProduct.name,
        brand: magentoProduct.brand || null,
        urlKey: magentoProduct.urlKey || null,
        enabled: magentoProduct.enabled,
      }

      // Intentar crear el producto
      let response = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData)
      })

      let result

      // Si el SKU ya existe, preguntar si desea actualizar
      if (!response.ok) {
        const error = await response.json()

        if (error.error && error.error.includes('Ya existe un producto')) {
          const shouldUpdate = window.confirm(
            `El producto con SKU "${magentoProduct.sku}" ya existe en el sistema.\n\n` +
            `Datos actuales en Magento:\n` +
            `• Nombre: ${magentoProduct.name}\n` +
            `• Marca: ${magentoProduct.brand || 'Sin marca'}\n` +
            `• Estado: ${magentoProduct.enabled ? 'Habilitado' : 'Deshabilitado'}\n\n` +
            `¿Deseas actualizarlo con estos datos de Magento?`
          )

          if (!shouldUpdate) {
            toast.info('Importación cancelada')
            setImporting(false)
            return
          }

          // Buscar el producto existente para obtener su ID
          const searchResponse = await fetch(`/api/products?search=${encodeURIComponent(magentoProduct.sku)}&limit=1`)
          const searchData = await searchResponse.json()

          if (!searchResponse.ok || !searchData.products || searchData.products.length === 0) {
            throw new Error('No se pudo encontrar el producto existente')
          }

          const existingProduct = searchData.products[0]

          // Actualizar el producto existente
          response = await fetch(`/api/products/${existingProduct.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(productData)
          })

          if (!response.ok) {
            const updateError = await response.json()
            throw new Error(updateError.error || 'Error al actualizar producto')
          }

          result = await response.json()
          toast.success('✅ Producto actualizado exitosamente')
        } else {
          throw new Error(error.error || 'Error al importar producto')
        }
      } else {
        result = await response.json()
        toast.success('✅ Producto importado exitosamente')
      }

      // Refrescar lista de productos y cerrar diálogo
      onSuccess()
      handleOpenChange(false)
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error al importar producto'
      toast.error(`❌ ${errorMessage}`)
    } finally {
      setImporting(false)
    }
  }

  // Manejar Enter en el input
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Importar Producto desde Magento</DialogTitle>
          <DialogDescription>
            Busca un producto por SKU en Magento para importarlo al sistema
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Input de SKU */}
          <div className="space-y-2">
            <Label htmlFor="sku">SKU del Producto</Label>
            <div className="flex gap-2">
              <Input
                id="sku"
                placeholder="Ej: ABC-123"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isLoading || importing}
              />
              <Button
                type="button"
                variant="secondary"
                onClick={handleSearch}
                disabled={isLoading || importing || sku.trim().length === 0}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Resultado de la búsqueda */}
          {isLoading && (
            <div className="flex items-center justify-center py-8 text-muted-foreground">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              <span>Buscando en Magento...</span>
            </div>
          )}

          {!isLoading && error && (
            <div className="flex items-start gap-3 p-4 bg-destructive/10 text-destructive rounded-lg">
              <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="font-medium">Producto no encontrado</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {error.message || 'No se encontró el producto en Magento'}
                </p>
              </div>
            </div>
          )}

          {!isLoading && !error && magentoProduct && (
            <div className="space-y-4 p-4 bg-muted rounded-lg">
              <div className="flex items-start gap-3">
                <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-medium">Producto encontrado en Magento</p>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="grid grid-cols-3 gap-2">
                  <span className="text-muted-foreground">SKU:</span>
                  <span className="font-medium col-span-2">{magentoProduct.sku}</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <span className="text-muted-foreground">Nombre:</span>
                  <span className="font-medium col-span-2">{magentoProduct.name}</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <span className="text-muted-foreground">Marca:</span>
                  <span className="font-medium col-span-2">
                    {magentoProduct.brand || 'Sin marca'}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <span className="text-muted-foreground">URL Key:</span>
                  <span className="font-medium col-span-2">
                    {magentoProduct.urlKey || 'Sin URL key'}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <span className="text-muted-foreground">Estado:</span>
                  <span className="font-medium col-span-2">
                    {magentoProduct.enabled ? 'Habilitado' : 'Deshabilitado'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={importing}
          >
            Cancelar
          </Button>
          {magentoProduct && (
            <Button
              type="button"
              onClick={handleImport}
              disabled={importing}
            >
              {importing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Importando...
                </>
              ) : (
                'Importar Producto'
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
