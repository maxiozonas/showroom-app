'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Download, Printer, ExternalLink } from 'lucide-react'
import { toast } from 'sonner'
import Image from 'next/image'

interface QrDetailsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  qrData: {
    id: number
    url: string
    qrUrl: string
    createdAt: string
    product: {
      sku: string
      name: string
      brand: string | null
    }
  } | null
}

export function QrDetailsDialog({ open, onOpenChange, qrData }: QrDetailsDialogProps) {
  if (!qrData) return null

  const handleDownload = async () => {
    try {
      const response = await fetch(qrData.qrUrl)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `qr-${qrData.product.sku}.png`
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
    const printWindow = window.open('', '_blank')
    if (!printWindow) {
      toast.error('❌ Error al abrir ventana de impresión')
      return
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>QR - ${qrData.product.name}</title>
          <style>
            body {
              margin: 0;
              padding: 20px;
              font-family: Arial, sans-serif;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
            }
            .container {
              text-align: center;
              max-width: 400px;
            }
            img {
              width: 300px;
              height: 300px;
              margin-bottom: 20px;
            }
            h2 {
              margin: 10px 0;
              color: #333;
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
            <img src="${qrData.qrUrl}" alt="QR Code" />
            <h2>${qrData.product.name}</h2>
            <p><strong>SKU:</strong> ${qrData.product.sku}</p>
            ${qrData.product.brand ? `<p><strong>Marca:</strong> ${qrData.product.brand}</p>` : ''}
            <p><strong>URL:</strong> ${qrData.url}</p>
          </div>
        </body>
      </html>
    `)
    printWindow.document.close()
    setTimeout(() => {
      printWindow.print()
    }, 250)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Detalles del QR</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          {/* QR Code Large */}
          <div className="flex justify-center">
            <div className="relative w-80 h-80 bg-muted rounded-lg p-4">
              <Image
                src={qrData.qrUrl}
                alt={`QR ${qrData.product.name}`}
                fill
                className="object-contain p-4"
                loading="lazy"
                unoptimized
              />
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-3">
            <div>
              <h3 className="text-lg font-semibold">{qrData.product.name}</h3>
              <p className="text-sm text-muted-foreground">SKU: {qrData.product.sku}</p>
              {qrData.product.brand && (
                <p className="text-sm text-muted-foreground">Marca: {qrData.product.brand}</p>
              )}
            </div>

            <div className="pt-2 border-t">
              <p className="text-sm font-medium mb-1">URL del producto:</p>
              <a
                href={qrData.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary hover:underline flex items-center gap-1"
              >
                {qrData.url}
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>

            <div className="pt-2 border-t">
              <p className="text-sm text-muted-foreground">
                Generado el: {new Date(qrData.createdAt).toLocaleDateString('es-AR', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-4">
            <Button onClick={handleDownload} className="flex-1">
              <Download className="mr-2 h-4 w-4" />
              Descargar
            </Button>
            <Button onClick={handlePrint} variant="outline" className="flex-1">
              <Printer className="mr-2 h-4 w-4" />
              Imprimir
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
