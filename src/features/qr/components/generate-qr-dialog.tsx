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
import { Download, Printer, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { generateQrWithProductInfoClient, dataUrlToBlob } from '../lib/qr-client-generator'

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

const BASE_URL = 'https://giliycia.com.ar'

export function GenerateQrDialog({
  open,
  onOpenChange,
  product,
  onSuccess,
}: GenerateQrDialogProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)

  // Auto-generar QR cuando se abre el diálogo
  useEffect(() => {
    if (open && product && !qrDataUrl) {
      handleGenerateQR()
    }
  }, [open, product, qrDataUrl])

  const handleGenerateQR = async () => {
    if (!product || !product.urlKey) {
      setError('El producto no tiene una URL key configurada')
      return
    }

    setIsGenerating(true)
    setError(null)

    try {
      const productUrl = `${BASE_URL}/${product.urlKey}.html`

      // Generar QR en el cliente
      const dataUrl = await generateQrWithProductInfoClient({
        sku: product.sku,
        name: product.name,
        brand: product.brand,
        url: productUrl,
      })

      setQrDataUrl(dataUrl)
      setIsGenerating(false)
      toast.success('✅ QR generado')
    } catch (error: any) {
      setError(error.message)
      toast.error(`❌ ${error.message}`)
      setIsGenerating(false)
    }
  }

  const handleClose = () => {
    setQrDataUrl(null)
    setError(null)
    onOpenChange(false)
  }

  const handleDownload = async () => {
    if (!qrDataUrl || !product) return

    try {
      const blob = await dataUrlToBlob(qrDataUrl)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `qr-${product.sku}.png`
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
    if (!qrDataUrl || !product) return

    const printWindow = window.open('', '_blank')
    if (!printWindow) {
      toast.error('❌ No se pudo abrir la ventana de impresión')
      return
    }

    // Dimensiones del QR: 9.9cm x 12.4cm (+ margen de líneas de corte)
    const qrWidth = '10.9cm'
    const qrHeight = '13.4cm'

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>QR Code - ${product.sku}</title>
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
              display: flex;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              background: white;
            }

            .qr-container {
              width: ${qrWidth};
              height: ${qrHeight};
              display: flex;
              align-items: center;
              justify-content: center;
              position: relative;
            }

            .qr-container img {
              width: 100%;
              height: 100%;
              object-fit: contain;
            }

            @media print {
              body {
                print-color-adjust: exact;
                -webkit-print-color-adjust: exact;
              }

              .qr-container {
                page-break-inside: avoid;
              }
            }
          </style>
        </head>
        <body>
          <div class="qr-container">
            <img src="${qrDataUrl}" alt="QR Code - ${product.sku}" />
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
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="text-center">
            {isGenerating ? 'Generando...' : '¡QR Generado!'}
          </DialogTitle>
          {!isGenerating && qrDataUrl && (
            <DialogDescription className="text-center">
              Código QR generado exitosamente
            </DialogDescription>
          )}
        </DialogHeader>

        {isGenerating ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Generando código QR...</p>
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
        ) : qrDataUrl ? (
          <div className="space-y-4">
            {/* QR Code */}
            <div className="flex justify-center p-4 bg-muted rounded-lg">
              <div className="relative w-48 h-48">
                <Image
                  src={qrDataUrl}
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
