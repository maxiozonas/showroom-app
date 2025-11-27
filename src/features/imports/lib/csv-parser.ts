import Papa from 'papaparse'
import { csvRowSchema, type CsvRow, type ImportError } from '../schemas/import.schema'

export interface ParsedCsvResult {
  validRows: CsvRow[]
  errors: ImportError[]
}

export async function parseCSV(file: File): Promise<ParsedCsvResult> {
  return new Promise(async (resolve, reject) => {
    const validRows: CsvRow[] = []
    const errors: ImportError[] = []

    try {
      // Leer el archivo como texto
      const text = await file.text()

      Papa.parse(text, {
        header: true,
        skipEmptyLines: true,
        transformHeader: (header) => {
          // Normalizar nombres de columnas
          const normalized = header.toLowerCase().trim()
          if (normalized === 'artículo' || normalized === 'articulo') return 'articulo'
          return normalized
        },
        complete: (results) => {
          results.data.forEach((row: any, index: number) => {
            try {
              // Validar con Zod
              const validatedRow = csvRowSchema.parse(row)
              validRows.push(validatedRow)
            } catch (error: any) {
              errors.push({
                row: index + 2, // +2 porque index empieza en 0 y hay header
                data: row,
                error: error.errors?.[0]?.message || 'Error de validación',
              })
            }
          })

          resolve({ validRows, errors })
        },
        error: (error: any) => {
          reject(new Error(`Error al parsear CSV: ${error.message}`))
        },
      })
    } catch (error: any) {
      reject(new Error(`Error al leer archivo: ${error.message}`))
    }
  })
}

export async function validateCsvHeaders(file: File): Promise<boolean> {
  return new Promise(async (resolve, reject) => {
    try {
      const text = await file.text()
      
      Papa.parse(text, {
        header: true,
        preview: 1,
        complete: (results) => {
          const headers = results.meta.fields || []
          const normalizedHeaders = headers.map(h => h.toLowerCase().trim())
          
          const requiredHeaders = ['sku', 'articulo']
          const hasRequired = requiredHeaders.every(h => 
            normalizedHeaders.includes(h) || normalizedHeaders.includes('artículo')
          )
          
          resolve(hasRequired)
        },
        error: (error: any) => {
          reject(error)
        },
      })
    } catch (error) {
      reject(error)
    }
  })
}
