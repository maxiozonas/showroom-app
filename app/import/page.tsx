'use client'

import { CsvUpload } from '@/src/features/imports/components'
import { AppLayout } from '@/src/components/app-layout'
import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'
import { toast } from 'sonner'

export default function ImportPage() {
  const handleDownloadTemplate = () => {
    const template = `sku,articulo,marca,habilitado
SKU-001,Silla de oficina,MarcaX,true
SKU-002,Escritorio,MarcaY,true
SKU-003,Lámpara,,false`

    const blob = new Blob([template], { type: 'text/csv;charset=utf-8;' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'plantilla-productos.csv'
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
    toast.success('✅ Plantilla descargada exitosamente')
  }

  return (
    <AppLayout>
      <div className="p-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Importar Productos</h1>
              <p className="text-muted-foreground mt-2">
                Carga productos masivamente mediante archivos CSV
              </p>
            </div>
            
            <Button onClick={handleDownloadTemplate} variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Descargar Plantilla
            </Button>
          </div>
        </div>

        <CsvUpload />
      </div>
    </AppLayout>
  )
}
