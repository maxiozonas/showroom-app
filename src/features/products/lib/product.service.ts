import { cache } from 'react'
import { prisma } from '@/lib/prisma'
import type { CreateProductInput, UpdateProductInput, ProductQuery } from '../schemas/product.schema'

// Aplicar server-cache-react para deduplicación por-request (apply server-cache-react)
export const getProducts = cache(async (query: ProductQuery) => {
  const { page, limit, search, brand, enabled, categoryId, sortBy, sortOrder } = query
  const skip = (page - 1) * limit

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

  if (categoryId) {
    where.categoryId = categoryId
  }

  const [productResults, totalCount] = await Promise.all([
    prisma.product.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    }),
    prisma.product.count({ where }),
  ])

  return {
    products: productResults,
    pagination: {
      page,
      limit,
      total: totalCount,
      totalPages: Math.ceil(totalCount / limit),
    },
  }
})

// Obtener un producto por ID
export const getProductById = cache(async (id: number) => {
  return prisma.product.findUnique({
    where: { id },
    include: {
      category: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },
  })
})

// Crear un producto
export const createProduct = async (data: CreateProductInput) => {
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
export const updateProduct = async (id: number, data: UpdateProductInput) => {
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
export const deleteProduct = async (id: number) => {
  return prisma.product.delete({
    where: { id },
  })
}

// Buscar producto por SKU
export const getProductBySku = cache(async (sku: string) => {
  return prisma.product.findUnique({
    where: { sku },
  })
})
