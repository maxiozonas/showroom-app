'use client'

import { useState } from 'react'
import { CsvUpload } from '@/src/features/imports/components'
import { useAllCategories } from '@/src/features/categories/hooks/useCategories'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Download, FileDown } from 'lucide-react'
import { toast } from 'sonner'

export default function ImportPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [isExporting, setIsExporting] = useState(false)
  const { data: categories } = useAllCategories()

  const handleDownloadTemplate = () => {
    const template = `sku,articulo,categoria,marca,url-key,habilitado,impreso
SKU-001,Silla de oficina,Salon Aberturas,MarcaX,url-silla,true,false
SKU-002,Escritorio,Salon Aberturas,MarcaY,url-escritorio,true,true
SKU-003,Lámpara,,,url-lampara,false,false`

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

  const handleExport = async () => {
    setIsExporting(true)
    try {
      const params = new URLSearchParams()
      if (selectedCategory && selectedCategory !== 'all') {
        params.append('categoryId', selectedCategory)
      }

      const response = await fetch(`/api/export?${params}`)

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Error al exportar')
      }

      const csv = await response.text()
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url

      const filename = selectedCategory && selectedCategory !== 'all'
        ? `productos-categoria-${selectedCategory}-${new Date().toISOString().slice(0, 10)}.csv`
        : `productos-todos-${new Date().toISOString().slice(0, 10)}.csv`

      a.download = filename
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast.success('✅ Productos exportados exitosamente')
    } catch (error: any) {
      toast.error(`❌ ${error.message}`)
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="p-8 space-y-8">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Importar / Exportar Productos</h1>
            <p className="text-muted-foreground mt-2">
              Gestiona tus productos mediante archivos CSV
            </p>
          </div>

          <Button onClick={handleDownloadTemplate} variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Descargar Plantilla
          </Button>
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-1">
        <Card>
          <CardHeader>
            <CardTitle>Importar Productos</CardTitle>
            <CardDescription>
              Carga productos masivamente mediante un archivo CSV. Los productos se crearán o actualizarán según el SKU.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CsvUpload />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Exportar Productos</CardTitle>
            <CardDescription>
              Exporta productos a un archivo CSV. Puedes filtrar por categoría.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <Select value={selectedCategory || 'all'} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full sm:w-[300px]">
                  <SelectValue placeholder="Seleccionar categoría" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las categorías</SelectItem>
                  {categories && categories.map((cat: any) => (
                    <SelectItem key={cat.id} value={cat.id.toString()}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button
                onClick={handleExport}
                disabled={isExporting}
                className="w-full sm:w-auto"
              >
                <FileDown className="mr-2 h-4 w-4" />
                {isExporting ? 'Exportando...' : 'Exportar CSV'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
