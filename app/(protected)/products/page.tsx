'use client'

import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { ProductsTable } from '@/src/features/products/components'
import { GenerateQrDialog, QrDetailsDialog } from '@/src/features/qr/components'
import { Button } from '@/components/ui/button'
import { QrCode, Loader2, Printer, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { QrClientService } from '@/src/features/qr/lib/qr-client.service'
import { generateQrWithProductInfoClient } from '@/src/features/qr/lib/qr-client-generator'

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
  const [isDeletingBulk, setIsDeletingBulk] = useState(false)
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
      const BASE_URL = 'https://giliycia.com.ar'
      
      // Obtener datos de los productos seleccionados
      const selectedProducts = allProducts.filter((p: Product) => 
        selectedProductIds.includes(p.id)
      )
      
      if (selectedProducts.length === 0) {
        toast.error('❌ No se encontraron los productos seleccionados')
        setIsGeneratingBulk(false)
        return
      }

      // 1. Generar QRs en el cliente (rápido, sin subir)
      toast.info('📊 Generando QRs...')
      const qrDataUrls = await Promise.all(
        selectedProducts.map(async (p: Product) => {
          const productUrl = `${BASE_URL}/${p.urlKey}.html`
          const dataUrl = await generateQrWithProductInfoClient({
            sku: p.sku,
            name: p.name,
            brand: p.brand,
            url: productUrl,
          })
          return {
            productId: p.id,
            sku: p.sku,
            name: p.name,
            dataUrl,
            productUrl,
          }
        })
      )

      // 2. Abrir ventana de impresión INMEDIATAMENTE (antes de subir)
      handlePrintBulkQrsFromDataUrls(qrDataUrls.map(q => q.dataUrl))
      toast.success(`✅ ${qrDataUrls.length} QR(s) listos para imprimir`)

      // 3. Subir QRs ya generados al servidor (sin regenerar)
      toast.info('📤 Guardando QRs en el servidor...')
      const results = await QrClientService.uploadPreGeneratedQrs(qrDataUrls)

      setBulkQrResults(results)
      const successCount = results.filter((r: any) => r.success).length
      toast.success(`✅ ${successCount} QR(s) guardados en el servidor`)

      // Limpiar selección y actualizar cache
      setSelectedProductIds([])
      handleQrSuccess()
    } catch (error: any) {
      toast.error(`❌ ${error.message}`)
    } finally {
      setIsGeneratingBulk(false)
    }
  }

  const handleDeleteBulkQrs = async () => {
    // Filtrar solo productos que tienen QRs
    const productsWithQrs = allProducts.filter(
      (p: Product) => selectedProductIds.includes(p.id) && p.hasQrs
    )

    if (productsWithQrs.length === 0) {
      toast.error('❌ Ninguno de los productos seleccionados tiene QRs')
      return
    }

    // Confirmar eliminación
    const confirmMessage = `¿Estás seguro de eliminar ${productsWithQrs.length} QR(s)? Esta acción no se puede deshacer.`
    if (!window.confirm(confirmMessage)) {
      return
    }

    setIsDeletingBulk(true)

    try {
      const response = await fetch('/api/qrs/delete-multiple', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productIds: productsWithQrs.map((p: Product) => p.id),
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Error al eliminar QRs')
      }

      const data = await response.json()
      toast.success(`✅ ${data.deleted} QR(s) eliminados exitosamente`)

      // Limpiar selección y actualizar cache
      setSelectedProductIds([])
      handleQrSuccess()
    } catch (error: any) {
      toast.error(`❌ ${error.message}`)
    } finally {
      setIsDeletingBulk(false)
    }
  }

  const handlePrintBulkQrsFromDataUrls = (dataUrls: string[]) => {
    if (dataUrls.length === 0) {
      toast.error('❌ No hay QRs para imprimir')
      return
    }

    const printWindow = window.open('', '_blank')
    if (!printWindow) {
      toast.error('❌ No se pudo abrir la ventana de impresión. Permite ventanas emergentes para este sitio.')
      return
    }

    // Dimensiones del QR: 9.9cm x 12.4cm (+ margen de marcas de corte ~1cm)
    const qrWidth = '10.9cm'
    const qrHeight = '13.4cm'

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Impresión de QRs</title>
          <style>
            @page {
              size: A4;
              margin: 0.5cm;
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
              min-height: 100vh;
              display: flex;
              flex-wrap: wrap;
              justify-content: center;
              align-content: flex-start;
              gap: 0.5cm;
              padding: 0.5cm;
            }
            
            .qr-item {
              width: ${qrWidth};
              height: ${qrHeight};
              display: flex;
              align-items: center;
              justify-content: center;
              page-break-inside: avoid;
            }
            
            .qr-item img {
              width: 100%;
              height: 100%;
              object-fit: contain;
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
            ${dataUrls.map((dataUrl, index) => `
              <div class="qr-item">
                <img src="${dataUrl}" alt="QR ${index + 1}" />
              </div>
            `).join('')}
          </div>
        </body>
      </html>
    `)
    
    printWindow.document.close()
    setTimeout(() => {
      printWindow.print()
    }, 500)
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
    <div className="p-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Productos</h1>
            <p className="text-muted-foreground mt-2">
              Gestiona los productos del showroom y genera códigos QR
            </p>
          </div>
          <div className="flex gap-3">
            <Button 
              onClick={handleDeleteBulkQrs} 
              size="lg"
              variant="destructive"
              disabled={selectedProductIds.length === 0 || isDeletingBulk || isGeneratingBulk}
            >
              {isDeletingBulk ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Eliminando...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-5 w-5" />
                  Eliminar QRs ({selectedProductIds.length})
                </>
              )}
            </Button>
            <Button 
              onClick={handleGenerateBulkQrs} 
              size="lg"
              disabled={selectedProductIds.length === 0 || isGeneratingBulk || isDeletingBulk}
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
  )
}
