import QRCode from 'qrcode'
import sharp from 'sharp'

/**
 * Escapa caracteres especiales para XML/SVG
 */
function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

export interface ProductInfo {
  sku: string
  name: string
  brand?: string | null
  url: string
}

export interface QrWithInfoOptions {
  qrSize?: number // Tamaño del QR en píxeles (945px = 8cm a 300 DPI)
  padding?: number
}

/**
 * Genera una imagen que contiene el QR code con nombre arriba y SKU abajo.
 * Tamaño optimizado para impresión (8cm x 8cm a 300 DPI)
 */
export async function generateQrWithProductInfo(
  productInfo: ProductInfo,
  options: QrWithInfoOptions = {}
): Promise<Buffer> {
  const {
    qrSize = 945, // 8cm a 300 DPI = 945px
    padding = 30,
  } = options

  // Generar el QR code como buffer PNG
  const qrBuffer = await QRCode.toBuffer(productInfo.url, {
    type: 'png',
    width: qrSize,
    margin: 1,
    errorCorrectionLevel: 'M', // Medium: balance entre capacidad y corrección de errores
  })

  // Crear texto superior (nombre del producto)
  const nameHeight = 60
  const nameSvg = `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<svg width="${qrSize}" height="${nameHeight}" xmlns="http://www.w3.org/2000/svg">
  <text 
    x="${qrSize / 2}" 
    y="40" 
    font-family="Arial, sans-serif" 
    font-size="28" 
    font-weight="bold" 
    text-anchor="middle" 
    fill="#000000"
  >${escapeXml(productInfo.name)}</text>
</svg>`
  const nameBuffer = Buffer.from(nameSvg, 'utf8')

  // Crear texto inferior (SKU)
  const skuHeight = 50
  const skuSvg = `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<svg width="${qrSize}" height="${skuHeight}" xmlns="http://www.w3.org/2000/svg">
  <text 
    x="${qrSize / 2}" 
    y="35" 
    font-family="Arial, sans-serif" 
    font-size="24" 
    font-weight="normal" 
    text-anchor="middle" 
    fill="#000000"
  >SKU: ${escapeXml(productInfo.sku)}</text>
</svg>`
  const skuBuffer = Buffer.from(skuSvg, 'utf8')

  // Calcular dimensiones totales
  const totalHeight = nameHeight + qrSize + skuHeight + padding * 2
  const totalWidth = qrSize + padding * 2

  // Combinar todos los elementos (sin logo)
  const finalImage = await sharp({
    create: {
      width: totalWidth,
      height: totalHeight,
      channels: 4,
      background: { r: 255, g: 255, b: 255, alpha: 1 }
    }
  })
    .composite([
      // Nombre del producto (arriba)
      {
        input: nameBuffer,
        top: padding,
        left: padding,
      },
      // QR code
      {
        input: qrBuffer,
        top: nameHeight + padding,
        left: padding,
      },
      // SKU (abajo)
      {
        input: skuBuffer,
        top: nameHeight + qrSize + padding,
        left: padding,
      },
    ])
    .png()
    .toBuffer()

  return finalImage
}

/**
 * Versión simplificada para generar solo el QR sin información adicional
 */
export async function generateSimpleQr(url: string, size: number = 512): Promise<Buffer> {
  return QRCode.toBuffer(url, {
    type: 'png',
    width: size,
    margin: 2,
    errorCorrectionLevel: 'M',
  })
}
