'use client'

import QRCode from 'qrcode'

export interface ProductInfo {
  sku: string
  name: string
  brand?: string | null
  url: string
}

/**
 * Genera un QR code en el cliente (navegador) usando Canvas.
 * Incluye nombre del producto arriba y SKU abajo.
 * Tamaño optimizado para impresión: 8cm x 8cm a 300 DPI
 */
export async function generateQrWithProductInfoClient(
  productInfo: ProductInfo
): Promise<string> {
  const qrSize = 945 // 8cm a 300 DPI
  const padding = 30
  const nameHeight = 80
  const skuHeight = 60

  // Calcular dimensiones totales
  const totalWidth = qrSize + padding * 2
  const totalHeight = nameHeight + qrSize + skuHeight + padding * 2

  // Crear canvas
  const canvas = document.createElement('canvas')
  canvas.width = totalWidth
  canvas.height = totalHeight
  const ctx = canvas.getContext('2d')

  if (!ctx) {
    throw new Error('No se pudo crear el contexto del canvas')
  }

  // Fondo blanco
  ctx.fillStyle = '#FFFFFF'
  ctx.fillRect(0, 0, totalWidth, totalHeight)

  // Generar QR code
  const qrCanvas = document.createElement('canvas')
  await QRCode.toCanvas(qrCanvas, productInfo.url, {
    width: qrSize,
    margin: 1,
    errorCorrectionLevel: 'M',
    color: {
      dark: '#000000',
      light: '#FFFFFF',
    },
  })

  // Dibujar QR en el canvas principal
  ctx.drawImage(qrCanvas, padding, nameHeight + padding)

  // Configurar texto
  ctx.fillStyle = '#000000'
  ctx.textAlign = 'center'

  // Dibujar nombre del producto (arriba)
  ctx.font = 'bold 36px Arial, sans-serif'
  const nameY = padding + 50
  
  // Dividir texto si es muy largo
  const maxWidth = qrSize
  const words = productInfo.name.split(' ')
  let line = ''
  let lineY = nameY
  
  for (const word of words) {
    const testLine = line + word + ' '
    const metrics = ctx.measureText(testLine)
    
    if (metrics.width > maxWidth && line !== '') {
      ctx.fillText(line.trim(), totalWidth / 2, lineY)
      line = word + ' '
      lineY += 40
    } else {
      line = testLine
    }
  }
  ctx.fillText(line.trim(), totalWidth / 2, lineY)

  // Dibujar SKU (abajo)
  ctx.font = '28px Arial, sans-serif'
  const skuY = nameHeight + qrSize + padding + 40
  ctx.fillText(`SKU: ${productInfo.sku}`, totalWidth / 2, skuY)

  // Convertir canvas a data URL (PNG)
  return canvas.toDataURL('image/png', 1.0)
}

/**
 * Descarga el QR generado como archivo PNG
 */
export function downloadQrImage(dataUrl: string, filename: string) {
  const link = document.createElement('a')
  link.download = filename
  link.href = dataUrl
  link.click()
}

/**
 * Convierte data URL a Blob para subir al servidor
 */
export async function dataUrlToBlob(dataUrl: string): Promise<Blob> {
  const response = await fetch(dataUrl)
  return response.blob()
}
