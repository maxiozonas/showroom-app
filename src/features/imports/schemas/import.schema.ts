import { z } from 'zod'

// Schema para validar cada fila del CSV
export const csvRowSchema = z.object({
  sku: z.string().min(1, 'SKU es requerido'),
  articulo: z.string().min(1, 'Artículo es requerido'),
  marca: z.string().optional().nullable().transform(val => val || null),
  'url-key': z.string().optional().nullable().transform(val => val || null),
  habilitado: z.union([
    z.boolean(),
    z.string().transform(val => {
      const normalized = val.toLowerCase().trim()
      if (normalized === 'true' || normalized === '1' || normalized === 'si' || normalized === 'sí') return true
      if (normalized === 'false' || normalized === '0' || normalized === 'no') return false
      return true // default
    })
  ]).default(true),
})

// Type para una fila del CSV
export type CsvRow = z.infer<typeof csvRowSchema>

// Resultado de la importación
export interface ImportResult {
  success: number
  errors: ImportError[]
  created: number
  updated: number
  totalRows: number
}

export interface ImportError {
  row: number
  data: any
  error: string
}
