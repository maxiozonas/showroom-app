import QRCode from 'qrcode'
import sharp from 'sharp'

export interface ProductInfo {
  sku: string
  name: string
  brand?: string | null
  url: string
}

export interface QrWithInfoOptions {
  qrSize?: number
  padding?: number
}

/**
 * Genera una imagen que contiene el QR code y la información del producto usando SVG
 */
export async function generateQrWithProductInfo(
  productInfo: ProductInfo,
  options: QrWithInfoOptions = {}
): Promise<Buffer> {
  const {
    qrSize = 400,
    padding = 40,
  } = options

  // Generar el QR code como buffer PNG
  const qrBuffer = await QRCode.toBuffer(productInfo.url, {
    type: 'png',
    width: qrSize,
    margin: 2,
    errorCorrectionLevel: 'M',
  })

  // Crear texto SVG con la información del producto
  const textLines = [
    { text: productInfo.name, fontSize: 20, bold: true, y: 0 },
    { text: `SKU: ${productInfo.sku}`, fontSize: 16, bold: false, y: 30 },
  ]

  if (productInfo.brand) {
    textLines.push({ text: `Marca: ${productInfo.brand}`, fontSize: 16, bold: false, y: 55 })
  }

  const textHeight = productInfo.brand ? 80 : 55
  const totalHeight = qrSize + textHeight + padding * 3
  const totalWidth = qrSize + padding * 2

  // Crear SVG con el texto
  const textSvg = `
    <svg width="${totalWidth}" height="${textHeight + padding}">
      ${textLines.map(line => `
        <text 
          x="${totalWidth / 2}" 
          y="${line.y + padding}" 
          font-family="Arial, sans-serif" 
          font-size="${line.fontSize}" 
          font-weight="${line.bold ? 'bold' : 'normal'}" 
          text-anchor="middle" 
          fill="#000000"
        >${line.text}</text>
      `).join('')}
    </svg>
  `

  const textBuffer = Buffer.from(textSvg)

  // Combinar QR y texto usando sharp
  const finalImage = await sharp({
    create: {
      width: totalWidth,
      height: totalHeight,
      channels: 4,
      background: { r: 255, g: 255, b: 255, alpha: 1 }
    }
  })
    .composite([
      {
        input: qrBuffer,
        top: padding,
        left: padding,
      },
      {
        input: textBuffer,
        top: qrSize + padding * 2,
        left: 0,
      }
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
