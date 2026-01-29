import { z } from 'zod'

// Schema para valor de atributo personalizado de Magento (puede ser string, number, null o array)
export const magentoAttributeValueSchema = z.union([
  z.string(),
  z.number(),
  z.null(),
  z.array(z.union([z.string(), z.number()]))
])

// Schema para atributo personalizado de Magento
export const magentoAttributeSchema = z.object({
  attribute_code: z.string(),
  value: magentoAttributeValueSchema
})

// Schema para respuesta de producto de Magento
export const magentoProductSchema = z.object({
  sku: z.string(),
  name: z.string(),
  status: z.number(),
  custom_attributes: z.array(magentoAttributeSchema)
})

// Schema para opción de atributo (brand)
export const magentoAttributeOptionSchema = z.object({
  value: z.string(),
  label: z.string()
})

// Schema para producto mapeado a formato local
export const magentoProductMappedSchema = z.object({
  sku: z.string(),
  name: z.string(),
  brand: z.string().nullable(),
  urlKey: z.string().nullable(),
  enabled: z.boolean()
})

// Schema para respuesta de búsqueda
export const magentoSearchResponseSchema = z.object({
  items: z.array(magentoProductSchema),
  total_count: z.number()
})

// Types exportados
export type MagentoAttributeValue = z.infer<typeof magentoAttributeValueSchema>
export type MagentoAttribute = z.infer<typeof magentoAttributeSchema>
export type MagentoProduct = z.infer<typeof magentoProductSchema>
export type MagentoAttributeOption = z.infer<typeof magentoAttributeOptionSchema>
export type MagentoProductMapped = z.infer<typeof magentoProductMappedSchema>
export type MagentoSearchResponse = z.infer<typeof magentoSearchResponseSchema>
