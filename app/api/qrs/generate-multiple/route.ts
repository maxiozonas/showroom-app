import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { QrService } from '@/src/features/qr/lib/qr.service'

const generateMultipleQrSchema = z.object({
  products: z.array(z.object({
    id: z.number().int().positive(),
    sku: z.string(),
    name: z.string(),
    brand: z.string().nullable().optional(),
    urlKey: z.string(),
  })).min(1).max(4, 'Máximo 4 productos por vez'),
})

const BASE_URL = 'https://giliycia.com.ar'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validar datos
    const { products } = generateMultipleQrSchema.parse(body)
    
    // Generar QRs para cada producto
    const results = await Promise.all(
      products.map(async (product) => {
        const productUrl = `${BASE_URL}/${product.urlKey}.html`
        
        try {
          const result = await QrService.generateQr({
            productId: product.id,
            url: productUrl,
          })
          
          return {
            success: true,
            productId: product.id,
            sku: product.sku,
            name: product.name,
            qrUrl: result.qrUrl,
          }
        } catch (error: any) {
          return {
            success: false,
            productId: product.id,
            sku: product.sku,
            name: product.name,
            error: error.message,
          }
        }
      })
    )
    
    return NextResponse.json({ results }, { status: 201 })
  } catch (error: any) {
    console.error('Error generating multiple QRs:', error)
    
    // Manejar errores de validación de Zod
    if (error.name === 'ZodError') {
      const firstError = error.errors?.[0]
      return NextResponse.json(
        { error: firstError?.message || 'Error de validación' },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: error.message || 'Error al generar códigos QR' },
      { status: 400 }
    )
  }
}
