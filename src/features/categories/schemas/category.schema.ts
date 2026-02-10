import { z } from 'zod'

export const createCategorySchema = z.object({
  name: z.string().min(1, 'Nombre es requerido'),
  slug: z.string()
    .min(1, 'Slug es requerido')
    .regex(/^[a-z0-9-]+$/, 'Slug solo puede contener letras minúsculas, números y guiones')
    .transform(val => val.toLowerCase()),
})

export const updateCategorySchema = z.object({
  name: z.string().min(1, 'Nombre es requerido').optional(),
  slug: z.string()
    .min(1, 'Slug es requerido')
    .regex(/^[a-z0-9-]+$/, 'Slug solo puede contener letras minúsculas, números y guiones')
    .transform(val => val.toLowerCase())
    .optional(),
})

export const categoryQuerySchema = z.object({
  page: z.string().nullable().optional().transform(val => val ? parseInt(val) : 1).pipe(z.number().int().positive()).catch(1),
  limit: z.string().nullable().optional().transform(val => val ? parseInt(val) : 10).pipe(z.number().int().positive().max(100)).catch(10),
  search: z.string().nullable().optional().transform(val => val || undefined),
  sortBy: z.string().nullable().optional().transform(val => val || 'name').pipe(z.enum(['name', 'slug', 'createdAt', 'updatedAt'])).catch('name'),
  sortOrder: z.string().nullable().optional().transform(val => val || 'asc').pipe(z.enum(['asc', 'desc'])).catch('asc'),
})

export type CreateCategoryInput = z.infer<typeof createCategorySchema>
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>
export type CategoryQuery = z.infer<typeof categoryQuerySchema>
