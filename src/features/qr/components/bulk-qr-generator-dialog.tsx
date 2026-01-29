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
import { Printer, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'

interface Product {
  id: number
  sku: string
  name: string
  brand: string | null
  urlKey: string | null
  enabled: boolean
  hasQrs?: boolean
}

interface BulkQrGeneratorDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  products: Product[]
  onSuccess?: () => void
}

interface QrResult {
  success: boolean
  productId: number
  sku: string
  name: string
  qrUrl?: string
  error?: string
}

export function BulkQrGeneratorDialog({
  open,
  onOpenChange,
  products,
  onSuccess,
}: BulkQrGeneratorDialogProps) {
  const [selectedProducts, setSelectedProducts] = useState<number[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [results, setResults] = useState<QrResult[]>([])
  const [showResults, setShowResults] = useState(false)

  const handleToggleProduct = (productId: number) => {
    setSelectedProducts(prev => {
      if (prev.includes(productId)) {
        return prev.filter(id => id !== productId)
      } else {
        if (prev.length >= 4) {
          toast.error('❌ Máximo 4 productos por vez')
          return prev
        }
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
    setShowResults(false)

    try {
      const response = await fetch('/api/qrs/generate-multiple', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          products: selectedProductsData.map(p => ({
            id: p.id,
            sku: p.sku,
            name: p.name,
            brand: p.brand,
            urlKey: p.urlKey,
          })),
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Error al generar QRs')
      }

      const data = await response.json()
      setResults(data.results)
      setShowResults(true)

      const successCount = data.results.filter((r: QrResult) => r.success).length
      toast.success(`✅ ${successCount} QR(s) generado(s) exitosamente`)

      if (onSuccess) {
        onSuccess()
      }
    } catch (error: any) {
      toast.error(`❌ ${error.message}`)
    } finally {
      setIsGenerating(false)
    }
  }

  const handlePrintQrs = () => {
    const successfulQrs = results.filter(r => r.success && r.qrUrl)
    
    if (successfulQrs.length === 0) {
      toast.error('❌ No hay QRs para imprimir')
      return
    }

    // Abrir ventana de impresión
    const printWindow = window.open('', '_blank')
    if (!printWindow) {
      toast.error('❌ No se pudo abrir la ventana de impresión')
      return
    }

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
              height: 29.7cm;
            }
            
            .container {
              width: 100%;
              height: 100%;
              padding: 0.5cm;
            }
            
            .qr-grid {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              grid-template-rows: repeat(2, 1fr);
              gap: 0.8cm;
              width: 100%;
              height: 100%;
            }
            
            .qr-item {
              display: flex;
              align-items: center;
              justify-content: center;
              page-break-inside: avoid;
              overflow: hidden;
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
    
    // Esperar a que carguen las imágenes antes de imprimir
    setTimeout(() => {
      printWindow.print()
    }, 500)
  }

  const handleClose = () => {
    setSelectedProducts([])
    setResults([])
    setShowResults(false)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Generación Múltiple de QRs</DialogTitle>
          <DialogDescription>
            Selecciona hasta 4 productos para generar e imprimir sus códigos QR
          </DialogDescription>
        </DialogHeader>

        {!showResults ? (
          <div className="space-y-4">
            {/* Lista de productos */}
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Seleccionados: {selectedProducts.length}/4
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
                        disabled={
                          !selectedProducts.includes(product.id) && 
                          selectedProducts.length >= 4
                        }
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
            {/* Resultados */}
            <ScrollArea className="h-[400px] border rounded-lg p-4">
              <div className="space-y-2">
                {results.map((result, index) => (
                  <div
                    key={index}
                    className={`flex items-start space-x-3 p-3 rounded-lg ${
                      result.success ? 'bg-green-50' : 'bg-red-50'
                    }`}
                  >
                    {result.success ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <div className="font-medium">{result.name}</div>
                      <div className="text-sm text-muted-foreground">
                        SKU: {result.sku}
                      </div>
                      {!result.success && result.error && (
                        <div className="text-sm text-red-600 mt-1">
                          Error: {result.error}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            {/* Botones de acción */}
            <div className="flex gap-2">
              <Button
                onClick={handlePrintQrs}
                disabled={results.filter(r => r.success).length === 0}
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
