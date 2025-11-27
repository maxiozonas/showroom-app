import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { QrStorageService } from '@/src/features/qr/lib/qr-storage.service'

// DELETE /api/history/[id] - Eliminar un QR del historial
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params
    const id = parseInt(idParam)
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'ID inválido' },
        { status: 400 }
      )
    }

    // Obtener el QR antes de eliminarlo para saber qué archivo borrar
    const qrHistory = await prisma.qRHistory.findUnique({
      where: { id },
      include: {
        product: {
          select: {
            sku: true,
          },
        },
      },
    })

    if (!qrHistory) {
      return NextResponse.json(
        { error: 'QR no encontrado' },
        { status: 404 }
      )
    }

    // Eliminar el archivo de UploadThing
    try {
      await QrStorageService.deleteQr(qrHistory.qrUrl)
    } catch (error) {
      console.error('Error deleting QR from UploadThing:', error)
      // Continuamos aunque falle el borrado del archivo
    }

    // Eliminar el registro de la base de datos
    await prisma.qRHistory.delete({
      where: { id },
    })
    
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error deleting QR history:', error)
    return NextResponse.json(
      { error: error.message || 'Error al eliminar QR' },
      { status: 400 }
    )
  }
}
