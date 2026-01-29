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

    // Validar que el SKU no esté vacío
    if (!decodedSku || decodedSku.trim().length === 0) {
      return NextResponse.json(
        { error: 'SKU es requerido' },
        { status: 400 }
      )
    }

    // Buscar producto en Magento
    const product = await findProductBySKU(decodedSku)

    if (!product) {
      return NextResponse.json(
        { error: `Producto con SKU "${decodedSku}" no encontrado en Magento` },
        { status: 404 }
      )
    }

    // Retornar datos del producto
    return NextResponse.json(product)
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Error al buscar producto en Magento'
    console.error('Error en API de Magento:', errorMessage)

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}
