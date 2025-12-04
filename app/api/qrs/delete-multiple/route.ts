import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { UTApi } from 'uploadthing/server'
import { z } from 'zod'

const utapi = new UTApi()

const deleteMultipleQrSchema = z.object({
  productIds: z.array(z.number()).min(1, 'Debe seleccionar al menos un producto'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { productIds } = deleteMultipleQrSchema.parse(body)

    // 1. Obtener todos los QRs de los productos seleccionados
    const qrsToDelete = await prisma.qRHistory.findMany({
      where: {
        productId: { in: productIds },
      },
      select: {
        id: true,
        qrUrl: true,
        productId: true,
      },
    })

    if (qrsToDelete.length === 0) {
      return NextResponse.json({
        message: 'No hay QRs para eliminar',
        deleted: 0,
      })
    }

    // 2. Extraer las keys de UploadThing
    const uploadThingKeys: string[] = []
    for (const qr of qrsToDelete) {
      try {
        const urlParts = qr.qrUrl.split('/')
        const key = urlParts[urlParts.length - 1]
        if (key) {
          uploadThingKeys.push(key)
        }
      } catch (error) {
        console.warn(`No se pudo extraer key de URL: ${qr.qrUrl}`)
      }
    }

    // 3. Eliminar archivos de UploadThing
    let deletedFromCloud = 0
    if (uploadThingKeys.length > 0) {
      try {
        await utapi.deleteFiles(uploadThingKeys)
        deletedFromCloud = uploadThingKeys.length
      } catch (error: any) {
        console.error('Error eliminando archivos de UploadThing:', error.message)
      }
    }

    // 4. Eliminar registros de la base de datos
    const deleteResult = await prisma.qRHistory.deleteMany({
      where: {
        productId: { in: productIds },
      },
    })

    return NextResponse.json({
      message: `${deleteResult.count} QR(s) eliminados exitosamente`,
      deleted: deleteResult.count,
      deletedFromCloud,
      productIds,
    })
  } catch (error: any) {
    console.error('Error deleting QRs:', error)

    if (error.name === 'ZodError') {
      const firstError = error.errors?.[0]
      return NextResponse.json(
        { error: firstError?.message || 'Error de validación' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: error.message || 'Error al eliminar QRs' },
      { status: 500 }
    )
  }
}
