'use client'

import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { ProductsTable } from '@/src/features/products/components'
import { GenerateQrDialog, QrDetailsDialog } from '@/src/features/qr/components'
import { AppLayout } from '@/src/components/app-layout'
import { toast } from 'sonner'

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

interface QrData {
  id: number
  url: string
  qrUrl: string
  createdAt: string
  product: {
    sku: string
    name: string
    brand: string | null
  }
}

export default function ProductsPage() {
  const queryClient = useQueryClient()
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [qrDialogOpen, setQrDialogOpen] = useState(false)
  const [qrDetailsOpen, setQrDetailsOpen] = useState(false)
  const [qrData, setQrData] = useState<QrData | null>(null)
  const [isLoadingQr, setIsLoadingQr] = useState(false)

  const handleGenerateQR = async (product: Product) => {
    setSelectedProduct(product)
    
    // Si el producto ya tiene QR, obtenerlo y mostrar detalles
    if (product.hasQrs) {
      setIsLoadingQr(true)
      try {
        const response = await fetch(`/api/history?productId=${product.id}&page=1&limit=1`)
        if (!response.ok) throw new Error('Error al obtener QR')
        
        const data = await response.json()
        if (data.history && data.history.length > 0) {
          const qr = data.history[0] // Obtener el QR más reciente
          setQrData({
            id: qr.id,
            url: qr.url,
            qrUrl: qr.qrUrl,
            createdAt: qr.createdAt,
            product: {
              sku: product.sku,
              name: product.name,
              brand: product.brand
            }
          })
          setQrDetailsOpen(true)
        } else {
          // Si no tiene QR, abrir dialog de generación
          setQrDialogOpen(true)
        }
      } catch (error) {
        toast.error('❌ Error al cargar el QR')
        console.error(error)
      } finally {
        setIsLoadingQr(false)
      }
    } else {
      // Si no tiene QR, abrir dialog de generación
      setQrDialogOpen(true)
    }
  }

  const handleQrDialogClose = () => {
    setQrDialogOpen(false)
    setSelectedProduct(null)
  }

  const handleQrDetailsClose = () => {
    setQrDetailsOpen(false)
    setQrData(null)
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

        {/* Dialog para generar nuevo QR */}
        <GenerateQrDialog
          open={qrDialogOpen}
          onOpenChange={handleQrDialogClose}
          product={selectedProduct}
          onSuccess={handleQrSuccess}
        />

        {/* Dialog para ver detalles de QR existente */}
        <QrDetailsDialog
          open={qrDetailsOpen}
          onOpenChange={handleQrDetailsClose}
          qrData={qrData}
        />
      </div>
    </AppLayout>
  )
}
