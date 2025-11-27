import { UTApi } from "uploadthing/server"

const utapi = new UTApi()

export class QrStorageService {
  /**
   * Subir QR a UploadThing
   * @param sku - SKU del producto
   * @param qrBuffer - Buffer del QR generado
   * @returns URL pública del QR
   */
  static async uploadQr(sku: string, qrBuffer: Buffer): Promise<string> {
    try {
      // Convertir Buffer a Uint8Array para compatibilidad con Blob
      const uint8Array = new Uint8Array(qrBuffer)
      const blob = new Blob([uint8Array], { type: 'image/png' })
      const file = new File([blob], `qr-${sku}.png`, {
        type: 'image/png',
      })

      // Subir a UploadThing
      const response = await utapi.uploadFiles(file)

      if (response.error) {
        throw new Error(`Error al subir QR: ${response.error.message}`)
      }

      console.log(`✅ QR subido para SKU ${sku}:`, response.data.url)
      return response.data.url
    } catch (error: any) {
      console.error(`❌ Error subiendo QR para SKU ${sku}:`, error)
      throw new Error(`Error al subir QR: ${error.message}`)
    }
  }

  /**
   * Eliminar QR de UploadThing
   * @param url - URL del QR a eliminar
   */
  static async deleteQr(url: string): Promise<void> {
    try {
      // Extraer fileKey de la URL
      // URL ejemplo: https://utfs.io/f/abc123.png
      const fileKey = url.split('/f/')[1]
      
      if (!fileKey) {
        console.warn('⚠️ No se pudo extraer fileKey de la URL:', url)
        return
      }

      await utapi.deleteFiles(fileKey)
      console.log(`✅ QR eliminado:`, fileKey)
    } catch (error: any) {
      console.error(`❌ Error eliminando QR:`, error)
      // No lanzar error para no bloquear la eliminación de la BD
    }
  }

  /**
   * Eliminar múltiples QRs
   * @param urls - Array de URLs de QRs a eliminar
   */
  static async deleteMultipleQrs(urls: string[]): Promise<void> {
    try {
      const fileKeys = urls
        .map(url => url.split('/f/')[1])
        .filter(Boolean) as string[]

      if (fileKeys.length === 0) {
        console.warn('⚠️ No hay fileKeys válidos para eliminar')
        return
      }

      await utapi.deleteFiles(fileKeys)
      console.log(`✅ ${fileKeys.length} QRs eliminados`)
    } catch (error: any) {
      console.error(`❌ Error eliminando múltiples QRs:`, error)
    }
  }
}
