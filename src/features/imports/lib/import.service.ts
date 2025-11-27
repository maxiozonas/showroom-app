import { prisma } from '@/lib/prisma'
import type { CsvRow, ImportResult, ImportError } from '../schemas/import.schema'

export class ImportService {
  static async importProducts(rows: CsvRow[]): Promise<ImportResult> {
    const result: ImportResult = {
      success: 0,
      errors: [],
      created: 0,
      updated: 0,
    }

    // Detectar SKUs duplicados en el CSV
    const skusSeen = new Set<string>()
    const duplicatesInCsv = new Set<string>()
    
    rows.forEach((row, index) => {
      if (skusSeen.has(row.sku)) {
        duplicatesInCsv.add(row.sku)
        result.errors.push({
          row: index + 2,
          data: row,
          error: `SKU duplicado en el archivo CSV: ${row.sku}`,
        })
      } else {
        skusSeen.add(row.sku)
      }
    })

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i]
      
      // Saltar si es un duplicado en el CSV
      if (duplicatesInCsv.has(row.sku) && skusSeen.has(row.sku)) {
        skusSeen.delete(row.sku) // Solo procesar el primero
        continue
      }
      
      try {
        // Buscar si existe el producto por SKU
        const existing = await prisma.product.findUnique({
          where: { sku: row.sku },
        })

        const productData = {
          sku: row.sku,
          name: row.articulo,
          brand: row.marca,
          urlKey: row['url-key'],
          enabled: row.habilitado,
        }

        if (existing) {
          // Producto ya existe - marcar como error en lugar de actualizar
          result.errors.push({
            row: i + 2,
            data: row,
            error: `El SKU ${row.sku} ya existe en la base de datos. Producto: ${existing.name}`,
          })
        } else {
          // Crear nuevo producto
          await prisma.product.create({
            data: productData,
          })
          result.created++
          result.success++
        }
      } catch (error: any) {
        result.errors.push({
          row: i + 2, // +2 por header y porque index empieza en 0
          data: row,
          error: error.message || 'Error al procesar producto',
        })
      }
    }

    return result
  }

  static async importProductsBatch(rows: CsvRow[]): Promise<ImportResult> {
    const result: ImportResult = {
      success: 0,
      errors: [],
      created: 0,
      updated: 0,
    }

    try {
      // Obtener todos los SKUs existentes
      const existingProducts = await prisma.product.findMany({
        where: {
          sku: {
            in: rows.map(r => r.sku),
          },
        },
        select: { sku: true, id: true },
      })

      const existingSkus = new Set(existingProducts.map((p: { sku: string }) => p.sku))
      const toCreate: any[] = []
      const toUpdate: any[] = []

      // Separar productos a crear vs actualizar
      rows.forEach((row, index) => {
        const productData = {
          sku: row.sku,
          name: row.articulo,
          brand: row.marca,
          urlKey: row['url-key'],
          enabled: row.habilitado,
        }

        if (existingSkus.has(row.sku)) {
          const existing = existingProducts.find((p: { sku: string; id: number }) => p.sku === row.sku)
          if (existing) {
            toUpdate.push({
              where: { id: existing.id },
              data: productData,
            })
          }
        } else {
          toCreate.push(productData)
        }
      })

      // Crear productos nuevos en batch
      if (toCreate.length > 0) {
        await prisma.product.createMany({
          data: toCreate,
          skipDuplicates: true,
        })
        result.created = toCreate.length
      }

      // Actualizar productos existentes
      for (const update of toUpdate) {
        await prisma.product.update(update)
        result.updated++
      }

      result.success = result.created + result.updated
    } catch (error: any) {
      result.errors.push({
        row: 0,
        data: {},
        error: error.message || 'Error en importación batch',
      })
    }

    return result
  }
}
