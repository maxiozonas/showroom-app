'use client'

import { generateQrWithProductInfoClient, dataUrlToBlob, type ProductInfo } from './qr-client-generator'

interface GenerateQrParams {
  productId: number
  url: string
  productInfo: ProductInfo
}

/**
 * Servicio para generar QRs en el cliente y subirlos al servidor
 */
export class QrClientService {
  /**
   * Genera un QR en el cliente y lo sube al servidor
   */
  static async generateAndUploadQr(params: GenerateQrParams) {
    const { productId, url, productInfo } = params

    // 1. Generar QR en el cliente
    const qrDataUrl = await generateQrWithProductInfoClient(productInfo)

    // 2. Convertir a Blob
    const qrBlob = await dataUrlToBlob(qrDataUrl)

    // 3. Crear FormData para subir
    const formData = new FormData()
    formData.append('file', qrBlob, `qr-${productInfo.sku}.png`)
    formData.append('productId', productId.toString())
    formData.append('url', url)

    // 4. Subir al servidor
    const response = await fetch('/api/qrs/upload', {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Error al subir QR')
    }

    return response.json()
  }

  /**
   * Genera múltiples QRs en el cliente y los sube al servidor
   */
  static async generateAndUploadMultipleQrs(
    products: Array<{
      id: number
      sku: string
      name: string
      brand: string | null
      urlKey: string
    }>
  ) {
    const BASE_URL = 'https://giliycia.com.ar'

    const results = await Promise.all(
      products.map(async (product) => {
        try {
          const productUrl = `${BASE_URL}/${product.urlKey}.html`
          
          const result = await this.generateAndUploadQr({
            productId: product.id,
            url: productUrl,
            productInfo: {
              sku: product.sku,
              name: product.name,
              brand: product.brand,
              url: productUrl,
            },
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

    return results
  }
}
