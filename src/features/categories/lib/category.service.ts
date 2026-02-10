import { cache } from 'react'
import { prisma } from '@/lib/prisma'
import type { CreateCategoryInput, UpdateCategoryInput, CategoryQuery } from '../schemas/category.schema'

export const getCategories = cache(async (query: CategoryQuery) => {
  const { page, limit, search, sortBy, sortOrder } = query
  const skip = (page - 1) * limit

  const where: any = {}

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { slug: { contains: search, mode: 'insensitive' } },
    ]
  }

  const [categories, totalCount] = await Promise.all([
    prisma.category.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
      include: {
        _count: {
          select: { products: true },
        },
      },
    }),
    prisma.category.count({ where }),
  ])

  return {
    categories,
    pagination: {
      page,
      limit,
      total: totalCount,
      totalPages: Math.ceil(totalCount / limit),
    },
  }
})

export const getCategoryById = cache(async (id: number) => {
  return prisma.category.findUnique({
    where: { id },
    include: {
      _count: {
        select: { products: true },
      },
    },
  })
})

export const getCategoryBySlug = cache(async (slug: string) => {
  return prisma.category.findUnique({
    where: { slug },
    include: {
      _count: {
        select: { products: true },
      },
    },
  })
})

export const createCategory = async (data: CreateCategoryInput) => {
  const existingName = await prisma.category.findUnique({
    where: { name: data.name },
  })

  if (existingName) {
    throw new Error('Ya existe una categoría con este nombre')
  }

  const existingSlug = await prisma.category.findUnique({
    where: { slug: data.slug },
  })

  if (existingSlug) {
    throw new Error('Ya existe una categoría con este slug')
  }

  return prisma.category.create({
    data,
  })
}

export const updateCategory = async (id: number, data: UpdateCategoryInput) => {
  if (data.name) {
    const existingName = await prisma.category.findFirst({
      where: {
        name: data.name,
        NOT: { id },
      },
    })

    if (existingName) {
      throw new Error('Ya existe una categoría con este nombre')
    }
  }

  if (data.slug) {
    const existingSlug = await prisma.category.findFirst({
      where: {
        slug: data.slug,
        NOT: { id },
      },
    })

    if (existingSlug) {
      throw new Error('Ya existe una categoría con este slug')
    }
  }

  return prisma.category.update({
    where: { id },
    data,
  })
}

export const deleteCategory = async (id: number) => {
  const category = await prisma.category.findUnique({
    where: { id },
    include: {
      _count: {
        select: { products: true },
      },
    },
  })

  if (!category) {
    throw new Error('Categoría no encontrada')
  }

  if (category._count.products > 0) {
    throw new Error(`No se puede eliminar la categoría porque tiene ${category._count.products} productos asociados. Desasigna los productos primero.`)
  }

  return prisma.category.delete({
    where: { id },
  })
}

export const getAllCategories = cache(async () => {
  return prisma.category.findMany({
    orderBy: { name: 'asc' },
  })
})
