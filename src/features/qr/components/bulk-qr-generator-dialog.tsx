'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Printer, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { generateQrWithProductInfoClient } from '@/src/features/qr/lib/qr-client-generator'

interface Product {
  id: number
  sku: string
  name: string
  brand: string | null
  urlKey: string | null
  enabled: boolean
}

interface BulkQrGeneratorDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  products: Product[]
}

export function BulkQrGeneratorDialog({
  open,
  onOpenChange,
  products,
}: BulkQrGeneratorDialogProps) {
  const [selectedProducts, setSelectedProducts] = useState<number[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [qrDataUrls, setQrDataUrls] = useState<string[]>([])

  const handleToggleProduct = (productId: number) => {
    setSelectedProducts(prev => {
      if (prev.includes(productId)) {
        return prev.filter(id => id !== productId)
      } else {
        return [...prev, productId]
      }
    })
  }

  const handleGenerateQrs = async () => {
    if (selectedProducts.length === 0) {
      toast.error('❌ Selecciona al menos un producto')
      return
    }

    const selectedProductsData = products.filter(p => selectedProducts.includes(p.id))

    // Verificar que todos tengan urlKey
    const missingUrlKey = selectedProductsData.filter(p => !p.urlKey)
    if (missingUrlKey.length > 0) {
      toast.error(`❌ Los siguientes productos no tienen URL key: ${missingUrlKey.map(p => p.sku).join(', ')}`)
      return
    }

    setIsGenerating(true)

    try {
      const BASE_URL = 'https://giliycia.com.ar'

      // Generar todos los QRs en el cliente
      const dataUrls = await Promise.all(
        selectedProductsData.map(async (p) => {
          const productUrl = `${BASE_URL}/${p.urlKey}.html`
          const dataUrl = await generateQrWithProductInfoClient({
            sku: p.sku,
            name: p.name,
            brand: p.brand,
            url: productUrl,
          })
          return dataUrl
        })
      )

      setQrDataUrls(dataUrls)
      toast.success(`✅ ${dataUrls.length} QR(s) generado(s) exitosamente`)

      // Imprimir automáticamente
      handlePrintQrs()
    } catch (error: any) {
      toast.error(`❌ ${error.message}`)
    } finally {
      setIsGenerating(false)
    }
  }

  const handlePrintQrs = () => {
    if (qrDataUrls.length === 0) {
      toast.error('❌ No hay QRs para imprimir')
      return
    }

    const printWindow = window.open('', '_blank')
    if (!printWindow) {
      toast.error('❌ No se pudo abrir la ventana de impresión')
      return
    }

    const qrCount = qrDataUrls.length
    // Calcular grid responsive según cantidad
    const cols = Math.ceil(Math.sqrt(qrCount))
    const rows = Math.ceil(qrCount / cols)

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Impresión de QRs</title>
          <style>
            @page {
              size: A4 portrait;
              margin: 0.8cm;
            }

            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }

            body {
              font-family: Arial, sans-serif;
              background: white;
              width: 21cm;
              min-height: 29.7cm;
            }

            .container {
              width: 100%;
              padding: 0.5cm;
            }

            .qr-grid {
              display: grid;
              grid-template-columns: repeat(${cols}, 1fr);
              grid-template-rows: repeat(${rows}, 1fr);
              gap: 0.8cm;
              width: 100%;
            }

            .qr-item {
              display: flex;
              align-items: center;
              justify-content: center;
              page-break-inside: avoid;
              overflow: hidden;
              aspect-ratio: 10.9 / 13.4;
            }

            .qr-item img {
              width: 100%;
              height: 100%;
              object-fit: contain;
              display: block;
              max-width: 9cm;
              max-height: 13cm;
            }

            @media print {
              body {
                print-color-adjust: exact;
                -webkit-print-color-adjust: exact;
              }

              @page {
                size: A4 portrait;
                margin: 0.8cm;
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
              ${qrDataUrls.map((dataUrl, index) => `
                <div class="qr-item">
                  <img src="${dataUrl}" alt="QR ${index + 1}" />
                </div>
              `).join('')}
            </div>
          </div>
        </body>
      </html>
    `)

    printWindow.document.close()

    // Esperar a que carguen las imágenes antes de imprimir
    setTimeout(() => {
      printWindow.print()
    }, 500)
  }

  const handleClose = () => {
    setSelectedProducts([])
    setQrDataUrls([])
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Generación Múltiple de QRs</DialogTitle>
          <DialogDescription>
            Selecciona los productos para generar e imprimir sus códigos QR
          </DialogDescription>
        </DialogHeader>

        {!qrDataUrls.length ? (
          <div className="space-y-4">
            {/* Lista de productos */}
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Seleccionados: {selectedProducts.length}
              </p>
              <ScrollArea className="h-[400px] border rounded-lg p-4">
                <div className="space-y-2">
                  {products.map(product => (
                    <div
                      key={product.id}
                      className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted transition-colors"
                    >
                      <Checkbox
                        id={`product-${product.id}`}
                        checked={selectedProducts.includes(product.id)}
                        onCheckedChange={() => handleToggleProduct(product.id)}
                      />
                      <label
                        htmlFor={`product-${product.id}`}
                        className="flex-1 cursor-pointer"
                      >
                        <div className="font-medium">{product.name}</div>
                        <div className="text-sm text-muted-foreground">
                          SKU: {product.sku}
                          {!product.urlKey && (
                            <span className="text-destructive ml-2">
                              (Sin URL key)
                            </span>
                          )}
                        </div>
                      </label>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>

            {/* Botones de acción */}
            <div className="flex gap-2">
              <Button
                onClick={handleGenerateQrs}
                disabled={selectedProducts.length === 0 || isGenerating}
                className="flex-1"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generando...
                  </>
                ) : (
                  `Generar ${selectedProducts.length} QR(s)`
                )}
              </Button>
              <Button onClick={handleClose} variant="outline">
                Cancelar
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-center py-8">
              <Printer className="h-12 w-12 text-primary mx-auto mb-4" />
              <p className="text-lg font-medium">{qrDataUrls.length} QR(s) generado(s)</p>
              <p className="text-sm text-muted-foreground">
                Los QRs se han generado y están listos para imprimir
              </p>
            </div>

            {/* Botones de acción */}
            <div className="flex gap-2">
              <Button
                onClick={handlePrintQrs}
                className="flex-1"
              >
                <Printer className="mr-2 h-4 w-4" />
                Imprimir QRs
              </Button>
              <Button onClick={handleClose} variant="outline">
                Cerrar
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
