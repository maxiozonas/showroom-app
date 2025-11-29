'use client'

import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { ProductsTable } from '@/src/features/products/components'
import { GenerateQrDialog, QrDetailsDialog } from '@/src/features/qr/components'
import { AppLayout } from '@/src/components/app-layout'
import { Button } from '@/components/ui/button'
import { QrCode, Loader2, Printer } from 'lucide-react'
import { toast } from 'sonner'
import { QrClientService } from '@/src/features/qr/lib/qr-client.service'

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
  
  // Selección múltiple de productos
  const [selectedProductIds, setSelectedProductIds] = useState<number[]>([])
  const [isGeneratingBulk, setIsGeneratingBulk] = useState(false)
  const [bulkQrResults, setBulkQrResults] = useState<any[]>([])
  const [allProducts, setAllProducts] = useState<Product[]>([])

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

  const handleGenerateBulkQrs = async () => {
    if (selectedProductIds.length === 0) {
      toast.error('❌ Selecciona al menos un producto')
      return
    }

    setIsGeneratingBulk(true)
    setBulkQrResults([])

    try {
      // Obtener datos de los productos seleccionados
      const selectedProducts = allProducts.filter((p: Product) => 
        selectedProductIds.includes(p.id)
      )
      
      if (selectedProducts.length === 0) {
        toast.error('❌ No se encontraron los productos seleccionados')
        setIsGeneratingBulk(false)
        return
      }

      // Generar QRs en el cliente
      const results = await QrClientService.generateAndUploadMultipleQrs(
        selectedProducts.map((p: Product) => ({
          id: p.id,
          sku: p.sku,
          name: p.name,
          brand: p.brand,
          urlKey: p.urlKey!,
        }))
      )

      setBulkQrResults(results)

      const successCount = results.filter((r: any) => r.success).length
      toast.success(`✅ ${successCount} QR(s) generado(s) exitosamente`)

      // Abrir vista de impresión automáticamente
      handlePrintBulkQrs(results)

      // Limpiar selección y actualizar cache
      setSelectedProductIds([])
      handleQrSuccess()
    } catch (error: any) {
      toast.error(`❌ ${error.message}`)
    } finally {
      setIsGeneratingBulk(false)
    }
  }

  const handlePrintBulkQrs = (results: any[]) => {
    const successfulQrs = results.filter(r => r.success && r.qrUrl)
    
    if (successfulQrs.length === 0) {
      toast.error('❌ No hay QRs para imprimir')
      return
    }

    const printWindow = window.open('', '_blank')
    if (!printWindow) {
      toast.error('❌ No se pudo abrir la ventana de impresión')
      return
    }

    const qrCount = successfulQrs.length
    let gridCols = 'grid-cols-1'
    
    if (qrCount === 2) {
      gridCols = 'grid-cols-2'
    } else if (qrCount === 3 || qrCount === 4) {
      gridCols = 'grid-cols-2'
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Impresión de QRs</title>
          <style>
            @page {
              size: A4;
              margin: 1cm;
            }
            
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            
            body {
              font-family: Arial, sans-serif;
              background: white;
            }
            
            .container {
              width: 100%;
              height: 100vh;
              display: grid;
              ${qrCount === 1 ? 'place-items: center;' : ''}
            }
            
            .qr-grid {
              display: grid;
              ${gridCols === 'grid-cols-1' ? '' : `
                grid-template-columns: repeat(2, 1fr);
                gap: 1cm;
              `}
              width: 100%;
              ${qrCount === 1 ? '' : 'padding: 1cm;'}
            }
            
            .qr-item {
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              page-break-inside: avoid;
              ${qrCount > 2 ? 'margin-bottom: 1cm;' : ''}
            }
            
            .qr-item img {
              width: 8cm;
              height: auto;
              display: block;
            }
            
            @media print {
              body {
                print-color-adjust: exact;
                -webkit-print-color-adjust: exact;
              }
              
              .qr-item {
                break-inside: avoid;
              }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="qr-grid">
              ${successfulQrs.map(qr => `
                <div class="qr-item">
                  <img src="${qr.qrUrl}" alt="QR ${qr.sku}" />
                </div>
              `).join('')}
            </div>
          </div>
        </body>
      </html>
    `)
    
    printWindow.document.close()
    setTimeout(() => {
      printWindow.print()
    }, 500)
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
          <Button 
            onClick={handleGenerateBulkQrs} 
            size="lg"
            disabled={selectedProductIds.length === 0 || isGeneratingBulk}
          >
            {isGeneratingBulk ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Generando...
              </>
            ) : (
              <>
                <Printer className="mr-2 h-5 w-5" />
                Generar e Imprimir QRs ({selectedProductIds.length})
              </>
            )}
          </Button>
        </div>

        <ProductsTable 
          onGenerateQR={handleGenerateQR}
          selectedProducts={selectedProductIds}
          onSelectionChange={setSelectedProductIds}
          onProductsLoaded={setAllProducts}
        />

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
