'use client'

import { useState, lazy, Suspense } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { ProductsTable } from '@/src/features/products/components'
import { Button } from '@/components/ui/button'
import { Loader2, Printer, Download } from 'lucide-react'
import { toast } from 'sonner'
import { generateQrWithProductInfoClient } from '@/src/features/qr/lib/qr-client-generator'
import { Skeleton } from '@/components/ui/skeleton'

const GenerateQrDialog = lazy(() => import('@/src/features/qr/components').then(m => ({ default: m.GenerateQrDialog })))
const MagentoProductDialog = lazy(() => import('@/src/features/magento/components').then(m => ({ default: m.MagentoProductDialog })))

interface Product {
  id: number
  sku: string
  name: string
  brand: string | null
  urlKey: string | null
  enabled: boolean
  createdAt: string
  updatedAt: string
}

export default function ProductsPage() {
  const queryClient = useQueryClient()
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [qrDialogOpen, setQrDialogOpen] = useState(false)

  // Diálogos
  const [magentoDialogOpen, setMagentoDialogOpen] = useState(false)

  // Selección múltiple de productos (estado sincronizado con el hook)
  const [selectedCount, setSelectedCount] = useState(0)
  const [selectedProductsForQr, setSelectedProductsForQr] = useState<Product[]>([])
  const [isGeneratingBulk, setIsGeneratingBulk] = useState(false)

  const handleGenerateQR = (product: Product) => {
    setSelectedProduct(product)
    setQrDialogOpen(true)
  }

  const handleQrDialogClose = () => {
    setQrDialogOpen(false)
    setSelectedProduct(null)
  }

  const handleQrSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['products'] })
  }

  const handleSelectionChange = (count: number, products: Product[]) => {
    setSelectedCount(count)
    setSelectedProductsForQr(products)
  }

  const handleGenerateBulkQrs = async () => {
    if (selectedCount === 0) {
      toast.error('❌ Selecciona al menos un producto')
      return
    }

    setIsGeneratingBulk(true)

    try {
      const BASE_URL = 'https://giliycia.com.ar'

      // Generar QRs en el cliente
      const qrDataUrls = await Promise.all(
        selectedProductsForQr.map(async (p: Product) => {
          const productUrl = `${BASE_URL}/${p.urlKey}.html`
          const dataUrl = await generateQrWithProductInfoClient({
            sku: p.sku,
            name: p.name,
            brand: p.brand,
            url: productUrl,
          })
          return { dataUrl }
        })
      )

      // Imprimir inmediatamente
      handlePrintBulkQrsFromDataUrls(qrDataUrls.map(q => q.dataUrl))
      toast.success(`✅ ${qrDataUrls.length} QR(s) generados`)
    } catch (error: any) {
      toast.error(`❌ ${error.message}`)
    } finally {
      setIsGeneratingBulk(false)
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
              onClick={() => setMagentoDialogOpen(true)}
              size="lg"
              variant="outline"
            >
              <Download className="mr-2 h-5 w-5" />
              Importar desde Magento
            </Button>
            <Button
              onClick={handleGenerateBulkQrs}
              size="lg"
              disabled={selectedCount === 0 || isGeneratingBulk}
            >
              {isGeneratingBulk ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Generando...
                </>
              ) : (
                <>
                  <Printer className="mr-2 h-5 w-5" />
                  Generar e Imprimir QRs ({selectedCount})
                </>
              )}
            </Button>
          </div>
        </div>

        <ProductsTable
          onGenerateQR={handleGenerateQR}
          onSelectionChange={handleSelectionChange}
        />

        {/* Dialog para generar nuevo QR */}
        <Suspense fallback={<Skeleton className="h-[500px] w-[400px]" />}>
          <GenerateQrDialog
            open={qrDialogOpen}
            onOpenChange={handleQrDialogClose}
            product={selectedProduct}
            onSuccess={handleQrSuccess}
          />
        </Suspense>

        {/* Dialog para importar desde Magento */}
        <Suspense fallback={<Skeleton className="h-[500px] w-[500px]" />}>
          <MagentoProductDialog
            open={magentoDialogOpen}
            onOpenChange={setMagentoDialogOpen}
            onSuccess={handleQrSuccess}
          />
        </Suspense>
    </div>
  )
}