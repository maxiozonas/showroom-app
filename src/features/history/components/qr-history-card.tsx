'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Download, Printer, ExternalLink, Eye, Trash2 } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { toast } from 'sonner'
import Image from 'next/image'

interface QrHistoryItem {
  id: number
  url: string
  qrUrl: string
  createdAt: string
  product: {
    id: number
    sku: string
    name: string
    brand: string | null
  }
}

interface QrHistoryCardProps {
  item: QrHistoryItem
  onDelete?: (id: number) => void
}

export function QrHistoryCard({ item, onDelete }: QrHistoryCardProps) {
  const [detailsOpen, setDetailsOpen] = useState(false)

  const handleDownload = async () => {
    try {
      const response = await fetch(item.qrUrl)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `qr-${item.product.sku}.png`
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
          <title>QR - ${item.product.name}</title>
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
            <img src="${item.qrUrl}" alt="QR Code" />
            <div class="info">
              <h2>${item.product.name}</h2>
              <p><strong>SKU:</strong> ${item.product.sku}</p>
              ${item.product.brand ? `<p><strong>Marca:</strong> ${item.product.brand}</p>` : ''}
              <p><strong>URL:</strong> ${item.url}</p>
              <p><strong>Generado:</strong> ${new Date(item.createdAt).toLocaleString()}</p>
            </div>
          </div>
        </body>
      </html>
    `)
    printWindow.document.close()
    printWindow.focus()
    
    setTimeout(() => {
      printWindow.print()
    }, 500)
  }

  const handleDelete = async () => {
    if (!confirm('¿Estás seguro de eliminar este QR? Esta acción no se puede deshacer.')) {
      return
    }

    // Llamar al callback que maneja la eliminación con React Query
    onDelete?.(item.id)
  }

  return (
    <>
      <Card className="hover:shadow-lg transition-shadow">
        <CardContent className="p-6">
          <div className="flex gap-4 items-start">
            {/* Product Info */}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg mb-1 truncate">
                {item.product.name}
              </h3>
              <p className="text-sm text-muted-foreground mb-1">
                SKU: {item.product.sku}
              </p>
              {item.product.brand && (
                <p className="text-sm text-muted-foreground mb-2">
                  Marca: {item.product.brand}
                </p>
              )}
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>📅</span>
                <span>{new Date(item.createdAt).toLocaleDateString('es-AR', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDetailsOpen(true)}
                className="w-full"
              >
                <Eye className="h-4 w-4 mr-2" />
                Ver
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
                className="w-full"
              >
                <Download className="h-4 w-4 mr-2" />
                Descargar
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrint}
                className="w-full"
              >
                <Printer className="h-4 w-4 mr-2" />
                Imprimir
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDelete}
                className="w-full"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Eliminar
              </Button>
            </div>
          </div>

          {/* URL Link */}
          <div className="mt-4 pt-4 border-t">
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-primary hover:underline"
            >
              <span className="truncate">{item.url}</span>
              <ExternalLink className="h-3 w-3 flex-shrink-0" />
            </a>
          </div>
        </CardContent>
      </Card>

      {/* Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalles del QR</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            {/* QR Code Large */}
            <div className="flex justify-center">
              <div className="relative w-64 h-64 bg-white border-2 border-gray-200 rounded-lg overflow-hidden">
                <Image
                  src={item.qrUrl}
                  alt={`QR ${item.product.name}`}
                  fill
                  className="object-contain p-4"
                  loading="lazy"
                  unoptimized
                />
              </div>
            </div>

            {/* Product Details */}
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Producto</label>
                <p className="text-lg font-semibold">{item.product.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">SKU</label>
                <p className="font-mono">{item.product.sku}</p>
              </div>
              {item.product.brand && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Marca</label>
                  <p>{item.product.brand}</p>
                </div>
              )}
              <div>
                <label className="text-sm font-medium text-muted-foreground">URL del Artículo</label>
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-primary hover:underline break-all"
                >
                  {item.url}
                  <ExternalLink className="h-4 w-4 flex-shrink-0" />
                </a>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Fecha de Generación</label>
                <p>{new Date(item.createdAt).toLocaleString('es-AR', {
                  dateStyle: 'full',
                  timeStyle: 'short'
                })}</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={handleDownload}>
                <Download className="h-4 w-4 mr-2" />
                Descargar
              </Button>
              <Button variant="outline" onClick={handlePrint}>
                <Printer className="h-4 w-4 mr-2" />
                Imprimir
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
