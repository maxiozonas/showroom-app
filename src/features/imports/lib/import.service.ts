import { prisma } from '@/lib/prisma'
import type { CsvRow, ImportResult, ImportError } from '../schemas/import.schema'

async function findOrCreateCategory(categoryName: string | null): Promise<number | null> {
  if (!categoryName || categoryName.trim() === '') {
    return null
  }

  const trimmedName = categoryName.trim()

  const existing = await prisma.category.findFirst({
    where: {
      name: {
        mode: 'insensitive',
        equals: trimmedName,
      },
    },
  })

  if (existing) {
    return existing.id
  }

  const slug = trimmedName
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

  const newCategory = await prisma.category.create({
    data: {
      name: trimmedName,
      slug: slug,
    },
  })

  return newCategory.id
}

export class ImportService {
  static async importProducts(rows: CsvRow[]): Promise<ImportResult> {
    const result: ImportResult = {
      success: 0,
      errors: [],
      created: 0,
      updated: 0,
      totalRows: rows.length,
    }

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

      if (duplicatesInCsv.has(row.sku) && skusSeen.has(row.sku)) {
        skusSeen.delete(row.sku)
        continue
      }

      try {
        const existing = await prisma.product.findUnique({
          where: { sku: row.sku },
        })

        const categoryId = await findOrCreateCategory(row.categoria)

        const productData = {
          sku: row.sku,
          name: row.articulo,
          brand: row.marca,
          urlKey: row['url-key'],
          enabled: row.habilitado,
          categoryId,
        }

        if (existing) {
          await prisma.product.update({
            where: { id: existing.id },
            data: productData,
          })
          result.updated++
          result.success++
        } else {
          await prisma.product.create({
            data: productData,
          })
          result.created++
          result.success++
        }
      } catch (error: any) {
        result.errors.push({
          row: i + 2,
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
      totalRows: rows.length,
    }

    try {
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

      const categoryCache = new Map<string, number | null>()

      for (const row of rows) {
        let categoryId: number | null = null

        if (row.categoria && row.categoria.trim() !== '') {
          if (categoryCache.has(row.categoria)) {
            categoryId = categoryCache.get(row.categoria)!
          } else {
            categoryId = await findOrCreateCategory(row.categoria)
            categoryCache.set(row.categoria, categoryId)
          }
        }

        const productData = {
          sku: row.sku,
          name: row.articulo,
          brand: row.marca,
          urlKey: row['url-key'],
          enabled: row.habilitado,
          categoryId,
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
      }

      await prisma.$transaction(async (tx) => {
        if (toCreate.length > 0) {
          await tx.product.createMany({
            data: toCreate,
            skipDuplicates: true,
          })
          result.created = toCreate.length
        }

        if (toUpdate.length > 0) {
          await Promise.all(
            toUpdate.map(update => tx.product.update(update))
          )
          result.updated = toUpdate.length
        }
      })

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
