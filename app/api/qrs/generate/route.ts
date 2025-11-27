import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { QrService } from '@/src/features/qr/lib/qr.service'

const generateQrSchema = z.object({
  productId: z.number().int().positive(),
  url: z.string().url('Debe ser una URL válida'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validar datos
    const validatedData = generateQrSchema.parse(body)
    
    // Generar QR
    const result = await QrService.generateQr(validatedData)
    
    return NextResponse.json(result, { status: 201 })
  } catch (error: any) {
    console.error('Error generating QR:', error)
    
    // Manejar errores de validación de Zod
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: error.message || 'Error al generar código QR' },
      { status: 400 }
    )
  }
}
