'use client'

import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { ProductsTable } from '@/src/features/products/components'
import { GenerateQrDialog } from '@/src/features/qr/components'
import { AppLayout } from '@/src/components/app-layout'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

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

export default function ProductsPage() {
  const queryClient = useQueryClient()
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [qrDialogOpen, setQrDialogOpen] = useState(false)

  const handleGenerateQR = (product: Product) => {
    setSelectedProduct(product)
    setQrDialogOpen(true)
  }

  const handleQrDialogClose = () => {
    setQrDialogOpen(false)
    setSelectedProduct(null)
  }

  const handleQrSuccess = () => {
    // Invalidar caché de productos para actualizar hasQrs
    queryClient.invalidateQueries({ queryKey: ['products'] })
  }

  return (
    <AppLayout>
      <div className="p-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Productos</h1>
            <p className="text-muted-foreground mt-2">
              Gestiona los productos del showroom y genera códigos QR
            </p>
          </div>
        </div>

        <ProductsTable onGenerateQR={handleGenerateQR} />

        <GenerateQrDialog
          open={qrDialogOpen}
          onOpenChange={handleQrDialogClose}
          product={selectedProduct}
          onSuccess={handleQrSuccess}
        />
      </div>
    </AppLayout>
  )
}
