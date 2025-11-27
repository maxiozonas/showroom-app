import { prisma } from '@/lib/prisma'
import { generateQrWithProductInfo } from './qr-with-info-generator'
import { QrStorageService } from './qr-storage.service'

export interface GenerateQrInput {
  productId: number
  url: string
}

export interface GenerateQrResult {
  id: number
  productId: number
  url: string
  qrUrl: string
  createdAt: Date
}

export class QrService {
  /**
   * Obtiene el QR existente de un producto o genera uno nuevo si no existe
   */
  static async generateQr(input: GenerateQrInput): Promise<GenerateQrResult> {
    try {
      // Verificar si ya existe un QR para este producto
      const existingQr = await prisma.qRHistory.findFirst({
        where: { productId: input.productId },
        orderBy: { createdAt: 'desc' },
      })

      // Si ya existe un QR, retornarlo
      if (existingQr) {
        return {
          id: existingQr.id,
          productId: existingQr.productId,
          url: existingQr.url,
          qrUrl: existingQr.qrUrl,
          createdAt: existingQr.createdAt,
        }
      }

      // Si no existe, generar uno nuevo
      // Obtener información del producto
      const product = await prisma.product.findUnique({
        where: { id: input.productId },
      })

      if (!product) {
        throw new Error('Producto no encontrado')
      }

      // Generar QR con información del producto
      const qrBuffer = await generateQrWithProductInfo({
        sku: product.sku,
        name: product.name,
        brand: product.brand,
        url: input.url,
      })

      // Subir a UploadThing
      const cloudUrl = await QrStorageService.uploadQr(product.sku, qrBuffer)

      // Guardar en historial
      const qrHistory = await prisma.qRHistory.create({
        data: {
          productId: input.productId,
          url: input.url,
          qrUrl: cloudUrl, // URL de UploadThing
        },
      })

      return {
        id: qrHistory.id,
        productId: qrHistory.productId,
        url: qrHistory.url,
        qrUrl: qrHistory.qrUrl,
        createdAt: qrHistory.createdAt,
      }
    } catch (error: any) {
      throw new Error(`Error al generar QR: ${error.message}`)
    }
  }

  /**
   * Obtiene el historial de QRs de un producto
   */
  static async getProductQrHistory(productId: number) {
    return prisma.qRHistory.findMany({
      where: { productId },
      orderBy: { createdAt: 'desc' },
    })
  }

  /**
   * Obtiene un QR por ID
   */
  static async getQrById(id: number) {
    return prisma.qRHistory.findUnique({
      where: { id },
      include: {
        product: true,
      },
    })
  }
}
