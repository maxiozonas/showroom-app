'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Download, Printer, CheckCircle2, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface Product {
  id: number
  sku: string
  name: string
  brand: string | null
  urlKey: string | null
}

interface GenerateQrDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  product: Product | null
  onSuccess?: () => void
}

interface QrResult {
  id: number
  qrUrl: string
  url: string
  createdAt: string
}

const BASE_URL = 'https://giliycia.com.ar'

export function GenerateQrDialog({
  open,
  onOpenChange,
  product,
  onSuccess,
}: GenerateQrDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [qrResult, setQrResult] = useState<QrResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isExisting, setIsExisting] = useState(false)

  // Auto-generar QR cuando se abre el diálogo
  useEffect(() => {
    if (open && product && !qrResult) {
      handleGenerateQR()
    }
  }, [open, product])

  const handleGenerateQR = async () => {
    if (!product) return

    // Verificar que el producto tenga urlKey
    if (!product.urlKey) {
      setError('El producto no tiene un URL key configurado. Por favor, actualiza el producto con su URL key.')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Construir la URL completa
      const productUrl = `${BASE_URL}/${product.urlKey}.html`

      const response = await fetch('/api/qrs/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          url: productUrl,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Error al generar QR')
      }

      const result = await response.json()
      
      // Verificar si es un QR existente comparando la fecha de creación
      const qrDate = new Date(result.createdAt)
      const now = new Date()
      const diffInSeconds = (now.getTime() - qrDate.getTime()) / 1000
      const isExistingQr = diffInSeconds > 5 // Si fue creado hace más de 5 segundos, es existente
      
      setQrResult(result)
      setIsExisting(isExistingQr)
      
      if (isExistingQr) {
        toast.info('ℹ️ Mostrando QR existente del producto')
      } else {
        toast.success('✅ Código QR generado y guardado exitosamente')
      }
      
      // Llamar callback para invalidar caché
      if (onSuccess) {
        onSuccess()
      }
    } catch (error: any) {
      setError(error.message)
      toast.error(`❌ ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }


  const handleDownload = async () => {
    if (!qrResult) return

    try {
      const response = await fetch(qrResult.qrUrl)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `qr-${product?.sku}.png`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      toast.success('✅ QR descargado exitosamente')
    } catch (error) {
      toast.error('❌ Error al descargar QR')
    }
  }

  const handlePrint = () => {
    if (!qrResult) return

    const printWindow = window.open('', '_blank')
    if (!printWindow) {
      toast.error('❌ No se pudo abrir la ventana de impresión')
      return
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>QR Code - ${product?.sku}</title>
          <style>
            body {
              margin: 0;
              padding: 20px;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              font-family: Arial, sans-serif;
            }
            .container {
              text-align: center;
            }
            img {
              max-width: 400px;
              height: auto;
            }
            .info {
              margin-top: 20px;
            }
            h2 {
              margin: 10px 0;
            }
            p {
              margin: 5px 0;
              color: #666;
            }
            @media print {
              body {
                padding: 0;
              }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <img src="${qrResult.qrUrl}" alt="QR Code" />
            <div class="info">
              <h2>${product?.name}</h2>
              <p><strong>SKU:</strong> ${product?.sku}</p>
              ${product?.brand ? `<p><strong>Marca:</strong> ${product.brand}</p>` : ''}
              <p><strong>URL:</strong> ${qrResult.url}</p>
            </div>
          </div>
        </body>
      </html>
    `)
    printWindow.document.close()
    printWindow.focus()
    
    // Esperar a que cargue la imagen antes de imprimir
    setTimeout(() => {
      printWindow.print()
    }, 500)
  }

  const handleClose = () => {
    setQrResult(null)
    setError(null)
    setIsExisting(false)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="text-center">
            {isLoading ? 'Cargando...' : isExisting ? 'QR del Producto' : '¡QR Generado!'}
          </DialogTitle>
          {!isLoading && qrResult && (
            <DialogDescription className="text-center">
              {isExisting 
                ? 'Este producto ya tiene un código QR generado'
                : 'Código QR generado exitosamente'}
            </DialogDescription>
          )}
        </DialogHeader>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Cargando código QR...</p>
          </div>
        ) : error ? (
          <div className="space-y-4">
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
            <DialogFooter>
              <Button onClick={handleClose} variant="outline" className="w-full">
                Cerrar
              </Button>
            </DialogFooter>
          </div>
        ) : qrResult ? (
          <div className="space-y-4">
            {/* Success Message */}
            <div className="text-center">
              <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                {isExisting 
                  ? 'Un producto solo puede tener un código QR'
                  : 'Código QR generado y guardado exitosamente'}
              </p>
            </div>

            {/* QR Code */}
            <div className="flex justify-center p-4 bg-muted rounded-lg">
              <div className="relative w-48 h-48">
                <Image
                  src={qrResult.qrUrl}
                  alt="QR Code"
                  fill
                  className="object-contain"
                  loading="lazy"
                  unoptimized
                />
              </div>
            </div>

            {/* Product Info - Compact */}
            <div className="text-center text-xs text-muted-foreground">
              <p className="font-medium">{product?.name}</p>
              <p>SKU: {product?.sku}</p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button onClick={handleDownload} className="flex-1" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Descargar
              </Button>
              <Button onClick={handlePrint} variant="outline" className="flex-1" size="sm">
                <Printer className="mr-2 h-4 w-4" />
                Imprimir
              </Button>
            </div>

            <Button onClick={handleClose} variant="ghost" className="w-full" size="sm">
              Cerrar
            </Button>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
