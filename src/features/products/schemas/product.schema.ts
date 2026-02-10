import { z } from 'zod'

// Schema para crear un producto
export const createProductSchema = z.object({
  sku: z.string().min(1, 'SKU es requerido'),
  name: z.string().min(1, 'Nombre es requerido'),
  brand: z.string().optional().nullable(),
  urlKey: z.string().optional().nullable(),
  enabled: z.boolean(),
  categoryId: z.number().optional().nullable(),
})

// Schema para actualizar un producto
export const updateProductSchema = z.object({
  sku: z.string().min(1, 'SKU es requerido').optional(),
  name: z.string().min(1, 'Nombre es requerido').optional(),
  brand: z.string().optional().nullable(),
  urlKey: z.string().optional().nullable(),
  enabled: z.boolean().optional(),
  categoryId: z.number().optional().nullable(),
})

// Schema para query params de listado
export const productQuerySchema = z.object({
  page: z.string().nullable().optional().transform(val => val ? parseInt(val) : 1).pipe(z.number().int().positive()).catch(1),
  limit: z.string().nullable().optional().transform(val => val ? parseInt(val) : 10).pipe(z.number().int().positive().max(100)).catch(10),
  search: z.string().nullable().optional().transform(val => val || undefined),
  brand: z.string().nullable().optional().transform(val => val || undefined),
  enabled: z.string().nullable().optional().transform(val => {
    if (!val) return undefined
    return val === 'true'
  }),
  categoryId: z.string().nullable().optional().transform(val => val ? parseInt(val) : undefined),
  sortBy: z.string().nullable().optional().transform(val => val || 'createdAt').pipe(z.enum(['sku', 'name', 'brand', 'createdAt', 'updatedAt'])).catch('createdAt'),
  sortOrder: z.string().nullable().optional().transform(val => val || 'desc').pipe(z.enum(['asc', 'desc'])).catch('desc'),
})

// Types exportados
export type CreateProductInput = z.infer<typeof createProductSchema>
export type UpdateProductInput = z.infer<typeof updateProductSchema>
export type ProductQuery = z.infer<typeof productQuerySchema>
