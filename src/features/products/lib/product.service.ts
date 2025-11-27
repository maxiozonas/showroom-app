import { prisma } from '@/lib/prisma'
import type { CreateProductInput, UpdateProductInput, ProductQuery } from '../schemas/product.schema'
import { QrStorageService } from '@/src/features/qr/lib/qr-storage.service'

export class ProductService {
  // Obtener productos con paginación y filtros
  static async getProducts(query: ProductQuery) {
    const { page, limit, search, brand, enabled, sortBy, sortOrder } = query
    const skip = (page - 1) * limit

    // Construir filtros
    const where: any = {}
    
    if (search) {
      where.OR = [
        { sku: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
      ]
    }
    
    if (brand) {
      where.brand = { contains: brand, mode: 'insensitive' }
    }
    
    if (enabled !== undefined) {
      where.enabled = enabled
    }

    // Ejecutar queries en paralelo
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          qrs: {
            select: { id: true },
            take: 1,
          },
        },
      }),
      prisma.product.count({ where }),
    ])

    // Agregar información de si tiene QRs
    const productsWithQrInfo = products.map(product => ({
      ...product,
      hasQrs: product.qrs.length > 0,
      qrs: undefined, // Remover el array de qrs del response
    }))

    return {
      products: productsWithQrInfo,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    }
  }

  // Obtener un producto por ID
  static async getProductById(id: number) {
    return prisma.product.findUnique({
      where: { id },
      include: {
        qrs: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
    })
  }

  // Crear un producto
  static async createProduct(data: CreateProductInput) {
    // Verificar si el SKU ya existe
    const existing = await prisma.product.findUnique({
      where: { sku: data.sku },
    })

    if (existing) {
      throw new Error('Ya existe un producto con este SKU')
    }

    return prisma.product.create({
      data,
    })
  }

  // Actualizar un producto
  static async updateProduct(id: number, data: UpdateProductInput) {
    // Si se actualiza el SKU, verificar que no exista
    if (data.sku) {
      const existing = await prisma.product.findFirst({
        where: {
          sku: data.sku,
          NOT: { id },
        },
      })

      if (existing) {
        throw new Error('Ya existe un producto con este SKU')
      }
    }

    return prisma.product.update({
      where: { id },
      data,
    })
  }

  // Eliminar un producto
  static async deleteProduct(id: number) {
    // Obtener todos los QRs del producto antes de eliminarlo
    const qrs = await prisma.qRHistory.findMany({
      where: { productId: id },
      select: { qrUrl: true },
    })

    // Eliminar QRs de UploadThing
    if (qrs.length > 0) {
      const qrUrls = qrs.map(qr => qr.qrUrl)
      try {
        await QrStorageService.deleteMultipleQrs(qrUrls)
        console.log(`✅ ${qrs.length} QRs eliminados de UploadThing para producto ${id}`)
      } catch (error) {
        console.error('⚠️ Error eliminando QRs de UploadThing:', error)
        // Continuamos con la eliminación del producto
      }
    }

    // Eliminar producto (cascade eliminará los QRs de la BD)
    return prisma.product.delete({
      where: { id },
    })
  }

  // Buscar producto por SKU
  static async getProductBySku(sku: string) {
    return prisma.product.findUnique({
      where: { sku },
    })
  }
}
