import Papa from 'papaparse'
import { prisma } from '@/lib/prisma'

export interface ExportProduct {
  sku: string
  articulo: string
  categoria: string
  marca: string | null
  'url-key': string | null
  habilitado: boolean
  impreso: boolean
}

export class ExportService {
  static async exportProductsByCategory(categoryId?: number): Promise<string> {
    const where: any = {}

    if (categoryId) {
      where.categoryId = categoryId
    }

    const products = await prisma.product.findMany({
      where,
      include: {
        category: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        sku: 'asc',
      },
    })

    const exportData: ExportProduct[] = products.map((product) => ({
      sku: product.sku,
      articulo: product.name,
      categoria: product.category?.name || '',
      marca: product.brand || '',
      'url-key': product.urlKey || '',
      habilitado: product.enabled,
      impreso: (product as any).printed,
    }))

    const csv = Papa.unparse(exportData, {
      quotes: true,
      delimiter: ',',
      header: true,
      newline: '\n',
    })

    return csv
  }

  static getExportFileName(categoryId?: number): string {
    const timestamp = new Date().toISOString().slice(0, 10)
    if (categoryId) {
      return `productos-categoria-${categoryId}-${timestamp}.csv`
    }
    return `productos-todos-${timestamp}.csv`
  }
}
