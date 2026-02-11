'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Upload, FileText, CheckCircle2, XCircle, AlertCircle, Download } from 'lucide-react'
import { toast } from 'sonner'
import type { ImportError } from '../schemas/import.schema'

interface ImportResult {
  success: number
  created: number
  updated: number
  errors: ImportError[]
  totalRows: number
}

export function CsvUpload() {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [result, setResult] = useState<ImportResult | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [showResultModal, setShowResultModal] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      processFile(selectedFile)
    }
  }

  const processFile = (selectedFile: File) => {
    if (!selectedFile.name.endsWith('.csv')) {
      toast.error('Por favor selecciona un archivo CSV')
      return
    }
    setFile(selectedFile)
    setResult(null)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile) {
      processFile(droppedFile)
    }
  }

  const handleUpload = async () => {
    if (!file) {
      toast.error('Por favor selecciona un archivo')
      return
    }

    setUploading(true)
    setResult(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/import', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al importar')
      }

      setResult(data)
      setShowResultModal(true)
      
      if (data.errors.length === 0) {
        toast.success(`✅ Importación exitosa: ${data.created} productos creados`)
      } else if (data.success > 0) {
        toast.warning(`⚠️ Importación parcial: ${data.success} exitosos, ${data.errors.length} errores`)
      } else {
        toast.error(`❌ Importación fallida: ${data.errors.length} errores`)
      }
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setUploading(false)
    }
  }

  const handleReset = () => {
    setFile(null)
    setResult(null)
    setShowResultModal(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

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

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Importar Productos desde CSV</CardTitle>
          <CardDescription>
            Sube un archivo CSV con las columnas: <strong>sku</strong>, <strong>articulo</strong>, <strong>categoria</strong> (opcional), <strong>marca</strong> (opcional), <strong>url-key</strong> (opcional), <strong>habilitado</strong> (opcional), <strong>impreso</strong> (opcional)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Drag & Drop Zone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`
              relative border-2 border-dashed rounded-lg p-12 text-center transition-colors
              ${isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'}
              ${file ? 'bg-muted/50' : 'hover:border-primary/50 hover:bg-muted/30'}
            `}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="hidden"
              id="csv-upload"
            />
            
            {!file ? (
              <div className="space-y-4">
                <div className="flex justify-center">
                  <Upload className="h-12 w-12 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-lg font-medium mb-2">
                    Arrastra tu archivo CSV aquí
                  </p>
                  <p className="text-sm text-muted-foreground mb-4">
                    o haz clic para seleccionar
                  </p>
                  <label htmlFor="csv-upload">
                    <Button variant="outline" asChild>
                      <span className="cursor-pointer">
                        <FileText className="mr-2 h-4 w-4" />
                        Seleccionar archivo
                      </span>
                    </Button>
                  </label>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-center">
                  <FileText className="h-12 w-12 text-primary" />
                </div>
                <div>
                  <p className="text-lg font-medium mb-2">{file.name}</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    {(file.size / 1024).toFixed(2)} KB
                  </p>
                  <div className="flex gap-2 justify-center">
                    <Button
                      onClick={handleUpload}
                      disabled={uploading}
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      {uploading ? 'Importando...' : 'Importar'}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleReset}
                      disabled={uploading}
                    >
                      Cambiar archivo
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Progress */}
          {uploading && (
            <div className="space-y-2">
              <Progress value={50} className="w-full" />
              <p className="text-sm text-muted-foreground text-center">Procesando archivo...</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results */}
      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {result.errors.length === 0 ? (
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              ) : (
                <AlertCircle className="h-5 w-5 text-yellow-500" />
              )}
              Resultado de la Importación
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Total procesadas</p>
                <p className="text-2xl font-bold">{result.totalRows}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Exitosas</p>
                <p className="text-2xl font-bold text-green-600">{result.success}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Creadas</p>
                <p className="text-2xl font-bold text-blue-600">{result.created}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Actualizadas</p>
                <p className="text-2xl font-bold text-orange-600">{result.updated}</p>
              </div>
            </div>

            {/* Errors */}
            {result.errors.length > 0 && (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertTitle>Errores encontrados ({result.errors.length})</AlertTitle>
                <AlertDescription>
                  <div className="mt-2 max-h-60 overflow-y-auto space-y-2">
                    {result.errors.map((error, index) => (
                      <div key={index} className="text-sm border-l-2 border-destructive pl-2">
                        <strong>Fila {error.row}:</strong> {error.error}
                        {error.data && (
                          <div className="text-xs text-muted-foreground mt-1">
                            {JSON.stringify(error.data)}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {/* Success message */}
            {result.errors.length === 0 && (
              <Alert>
                <CheckCircle2 className="h-4 w-4" />
                <AlertTitle>¡Importación exitosa!</AlertTitle>
                <AlertDescription>
                  Todos los productos fueron procesados correctamente.
                </AlertDescription>
              </Alert>
            )}

            <Button onClick={handleReset} className="w-full">
              Importar otro archivo
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Formato del CSV</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <p>El archivo CSV debe tener las siguientes columnas:</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li><strong>sku</strong>: Código único del producto (requerido)</li>
              <li><strong>articulo</strong>: Nombre del producto (requerido)</li>
              <li><strong>categoria</strong>: Categoría del producto (opcional)</li>
              <li><strong>marca</strong>: Marca del producto (opcional)</li>
              <li><strong>url-key</strong>: Slug para construir la URL del producto (opcional)</li>
              <li><strong>habilitado</strong>: true/false, 1/0, si/no (opcional, por defecto true)</li>
              <li><strong>impreso</strong>: true/false, 1/0, si/no (opcional, por defecto false)</li>
            </ul>
            <p className="mt-4 text-muted-foreground">
              Ejemplo de CSV:
            </p>
            <pre className="bg-muted p-3 rounded-md text-xs overflow-x-auto">
{`sku,articulo,categoria,marca,url-key,habilitado,impreso
ABC-001,Producto 1,Categoria A,Marca A,producto-1-marca-a,true,false
ABC-002,Producto 2,Categoria B,Marca B,producto-2-marca-b,false,true
ABC-003,Producto 3,,,,true,false`}
            </pre>
          </div>
        </CardContent>
      </Card>

      {/* Result Modal */}
      <Dialog open={showResultModal} onOpenChange={setShowResultModal}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {result && result.errors.length === 0 ? (
                <>
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  ¡Importación Exitosa!
                </>
              ) : (
                <>
                  <AlertCircle className="h-5 w-5 text-yellow-500" />
                  Importación Completada
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              Resumen del proceso de importación
            </DialogDescription>
          </DialogHeader>

          {result && (
            <div className="space-y-6">
              {/* Summary Stats */}
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <p className="text-3xl font-bold text-green-600">{result.created}</p>
                      <p className="text-sm text-muted-foreground mt-1">Productos Creados</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <p className="text-3xl font-bold text-red-600">{result.errors.length}</p>
                      <p className="text-sm text-muted-foreground mt-1">Errores</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Success Message */}
              {result.errors.length === 0 && (
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <AlertTitle className="text-green-800">¡Perfecto!</AlertTitle>
                  <AlertDescription className="text-green-700">
                    Todos los productos fueron importados correctamente.
                  </AlertDescription>
                </Alert>
              )}

              {/* Errors */}
              {result.errors.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">Errores Encontrados:</h4>
                  <div className="max-h-60 overflow-y-auto space-y-2 border rounded-lg p-4">
                    {result.errors.map((error, index) => (
                      <div key={index} className="text-sm border-l-2 border-red-500 pl-3 py-1">
                        <p className="font-medium">Fila {error.row}:</p>
                        <p className="text-muted-foreground">{error.error}</p>
                        {error.data && (
                          <p className="text-xs text-muted-foreground mt-1 font-mono">
                            {JSON.stringify(error.data)}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={handleReset}>
                  Importar Otro Archivo
                </Button>
                <Button onClick={() => setShowResultModal(false)}>
                  Cerrar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
