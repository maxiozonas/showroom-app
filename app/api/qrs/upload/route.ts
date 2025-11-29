import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { UTApi } from 'uploadthing/server'

const utapi = new UTApi()

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    
    const file = formData.get('file') as File
    const productId = formData.get('productId') as string
    const url = formData.get('url') as string

    if (!file || !productId || !url) {
      return NextResponse.json(
        { error: 'Faltan parámetros requeridos' },
        { status: 400 }
      )
    }

    // Verificar si ya existe un QR para este producto
    const existingQr = await prisma.qRHistory.findFirst({
      where: { productId: parseInt(productId) },
      orderBy: { createdAt: 'desc' },
    })

    if (existingQr) {
      // Si ya existe, retornar el existente
      return NextResponse.json({
        qrUrl: existingQr.qrUrl,
        id: existingQr.id,
        isNew: false,
      })
    }

    // Subir archivo a UploadThing
    const uploadResponse = await utapi.uploadFiles([file])
    
    if (!uploadResponse || uploadResponse.length === 0 || !uploadResponse[0].data) {
      throw new Error('Error al subir el archivo')
    }

    const qrUrl = uploadResponse[0].data.url

    // Guardar en la base de datos
    const qrHistory = await prisma.qRHistory.create({
      data: {
        productId: parseInt(productId),
        url,
        qrUrl,
      },
    })

    return NextResponse.json({
      qrUrl: qrHistory.qrUrl,
      id: qrHistory.id,
      isNew: true,
    })
  } catch (error: any) {
    console.error('Error uploading QR:', error)
    return NextResponse.json(
      { error: error.message || 'Error al subir QR' },
      { status: 500 }
    )
  }
}
