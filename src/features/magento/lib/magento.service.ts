import { cache } from 'react'
import {
  magentoProductSchema,
  magentoAttributeOptionSchema,
  magentoProductMappedSchema,
  magentoSearchResponseSchema,
  type MagentoProduct,
  type MagentoAttribute,
  type MagentoAttributeOption,
  type MagentoProductMapped,
  type MagentoSearchResponse
} from './magento.schema'

// Configuración desde variables de entorno
const MAGENTO_URL = process.env.MAGENTO_URL
const MAGENTO_ADMIN_USER = process.env.MAGENTO_ADMIN_USER
const MAGENTO_ADMIN_PASSWORD = process.env.MAGENTO_ADMIN_PASSWORD
// User-Agent más realista para evitar bloqueo de Cloudflare
const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'

// Validar que las credenciales estén configuradas
if (!MAGENTO_URL || !MAGENTO_ADMIN_USER || !MAGENTO_ADMIN_PASSWORD) {
  console.error('❌ Error: Credenciales de Magento no configuradas en .env')
}

// Tipo para el token en caché
type CachedToken = { token: string; expiresAt: number }

// Autenticar con Magento y obtener token Bearer
// Usa React.cache() para deduplicación por-request (seguro en serverless)
export const authenticate = cache(async (): Promise<string | null> => {
  if (!MAGENTO_URL || !MAGENTO_ADMIN_USER || !MAGENTO_ADMIN_PASSWORD) {
    console.error('❌ Error: Credenciales de Magento no configuradas')
    return null
  }

  try {
    const url = `${MAGENTO_URL}/integration/admin/token`
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': USER_AGENT,
        'Accept': 'application/json',
        'Accept-Language': 'en-US,en;q=0.9'
      },
      body: JSON.stringify({
        username: MAGENTO_ADMIN_USER,
        password: MAGENTO_ADMIN_PASSWORD
      })
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('❌ Error de autenticación:', error)
      return null
    }

    const token = (await response.text()).trim().replace(/"/g, '')
    return token
  } catch (error) {
    console.error('❌ Error al autenticar con Magento:', error)
    return null
  }
})

// Obtener headers con token de autorización
function getHeaders(token: string): HeadersInit {
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
    'User-Agent': USER_AGENT,
    'Accept': 'application/json',
    'Accept-Language': 'en-US,en;q=0.9',
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache'
  }
}

// Obtener mapeo de IDs de marca a nombres de marca
export const getBrandMap = cache(async (token: string): Promise<Record<string, string>> => {
  try {
    const url = `${MAGENTO_URL}/products/attributes/brand/options`
    const response = await fetch(url, {
      headers: getHeaders(token)
    })

    if (!response.ok) {
      console.error('❌ Error al obtener mapeo de marcas')
      return {}
    }

    const options = await response.json()

    // Validar respuesta con Zod
    const validatedOptions = magentoAttributeOptionSchema.array().parse(options)

    // Construir mapeo: { "123": "Marca A", "456": "Marca B" }
    const brandMap: Record<string, string> = {}
    for (const option of validatedOptions) {
      if (option.value && option.label) {
        brandMap[option.value] = option.label
      }
    }

    return brandMap
  } catch (error) {
    console.error('❌ Error al obtener mapeo de marcas:', error)
    return {}
  }
})

// Helper para extraer custom attribute
function getCustomAttribute(product: MagentoProduct, attributeCode: string): string | null {
  const customAttrs = product.custom_attributes

  for (const attr of customAttrs) {
    if (attr.attribute_code === attributeCode) {
      // Convertir valor a string o null
      if (attr.value === null || attr.value === undefined) {
        return null
      }

      // Si es un array, tomar el primer valor
      if (Array.isArray(attr.value)) {
        if (attr.value.length === 0) {
          return null
        }
        const firstValue = attr.value[0]
        return firstValue === null || firstValue === undefined ? null : String(firstValue)
      }

      return String(attr.value)
    }
  }

  return null
}

// Convertir producto de Magento a formato local
function mapMagentoProductToLocal(
  magentoProduct: MagentoProduct,
  brandMap: Record<string, string>
): MagentoProductMapped {
  // Obtener brand ID y resolverlo con el mapeo
  const brandId = getCustomAttribute(magentoProduct, 'brand')
  const brand = brandId ? brandMap[brandId] || null : null

  // Obtener url_key
  const urlKey = getCustomAttribute(magentoProduct, 'url_key')

  // Obtener status (1 = enabled, 0 = disabled)
  const enabled = magentoProduct.status === 1

  return {
    sku: magentoProduct.sku,
    name: magentoProduct.name,
    brand,
    urlKey,
    enabled
  }
}

// Buscar producto por SKU en Magento
export const searchProductBySKU = cache(
  async (token: string, sku: string): Promise<MagentoProductMapped | null> => {
    try {
      // Construir URL de búsqueda
      const url = new URL(`${MAGENTO_URL}/products`)
      url.searchParams.append('searchCriteria[filter_groups][0][filters][0][field]', 'sku')
      url.searchParams.append('searchCriteria[filter_groups][0][filters][0][value]', sku)
      url.searchParams.append('searchCriteria[filter_groups][0][filters][0][condition_type]', 'eq')
      url.searchParams.append('searchCriteria[pageSize]', '1')

      const response = await fetch(url.toString(), {
        headers: getHeaders(token)
      })

      if (!response.ok) {
        console.error('❌ Error al buscar producto:', response.statusText)
        return null
      }

      const data = await response.json()

      // Validar respuesta con Zod
      let searchResponse: MagentoSearchResponse
      try {
        searchResponse = magentoSearchResponseSchema.parse(data)
      } catch (zodError) {
        console.error('❌ Error de validación Zod en respuesta de Magento:', zodError)
        console.error('Datos recibidos de Magento:', JSON.stringify(data, null, 2))
        return null
      }

      // Si no hay resultados, retornar null
      if (searchResponse.total_count === 0 || searchResponse.items.length === 0) {
        return null
      }

      // Obtener el primer (y único) resultado
      const magentoProduct = searchResponse.items[0]

      // Obtener mapeo de marcas en paralelo para mejor performance (async-parallel)
      const [brandMap] = await Promise.all([
        getBrandMap(token)
      ])

      // Mapear a formato local
      const mappedProduct = mapMagentoProductToLocal(magentoProduct, brandMap)

      // Validar con Zod
      return magentoProductMappedSchema.parse(mappedProduct)
    } catch (error) {
      console.error('❌ Error al buscar producto por SKU:', error)
      return null
    }
  }
)

// Función principal: buscar producto por SKU (orquesta el flujo completo)
export const findProductBySKU = cache(async (sku: string): Promise<MagentoProductMapped | null> => {
  // 1. Autenticar
  const token = await authenticate()
  if (!token) {
    return null
  }

  // 2. Buscar producto
  const product = await searchProductBySKU(token, sku)
  return product
})
