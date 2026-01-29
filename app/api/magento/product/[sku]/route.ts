import { NextRequest, NextResponse } from 'next/server'
import { findProductBySKU } from '@/src/features/magento/lib/magento.service'

// GET /api/magento/product/:sku - Buscar producto por SKU en Magento
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sku: string }> }
) {
  try {
    // En Next.js 16, params es una Promise
    const { sku } = await params
    const decodedSku = decodeURIComponent(sku)

    console.log('[Magento API] Buscando SKU:', decodedSku)
    console.log('[Magento API] MAGENTO_URL configurada:', !!process.env.MAGENTO_URL)

    // Validar que el SKU no esté vacío
    if (!decodedSku || decodedSku.trim().length === 0) {
      return NextResponse.json(
        { error: 'SKU es requerido' },
        { status: 400 }
      )
    }

    // Verificar variables de entorno
    if (!process.env.MAGENTO_URL || !process.env.MAGENTO_ADMIN_USER || !process.env.MAGENTO_ADMIN_PASSWORD) {
      console.error('[Magento API] ❌ Variables de entorno faltantes')
      console.error('[Magento API] MAGENTO_URL:', !!process.env.MAGENTO_URL)
      console.error('[Magento API] MAGENTO_ADMIN_USER:', !!process.env.MAGENTO_ADMIN_USER)
      console.error('[Magento API] MAGENTO_ADMIN_PASSWORD:', !!process.env.MAGENTO_ADMIN_PASSWORD)
      return NextResponse.json(
        { error: 'Configuración de Magento incompleta. Contacte al administrador.' },
        { status: 500 }
      )
    }

    // Buscar producto en Magento
    const product = await findProductBySKU(decodedSku)

    if (!product) {
      console.log('[Magento API] Producto no encontrado:', decodedSku)
      return NextResponse.json(
        { error: `Producto con SKU "${decodedSku}" no encontrado en Magento` },
        { status: 404 }
      )
    }

    console.log('[Magento API] ✅ Producto encontrado:', product.sku)
    // Retornar datos del producto
    return NextResponse.json(product)
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Error al buscar producto en Magento'
    console.error('[Magento API] ❌ Error:', errorMessage, error)
    console.error('[Magento API] Stack:', error instanceof Error ? error.stack : 'No stack')

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}
