'use client'

import QRCode from 'qrcode'

export interface ProductInfo {
  sku: string
  name: string
  brand?: string | null
  url: string
}

// Constantes de dimensiones a 300 DPI
const DPI = 300
const CM_TO_PX = DPI / 2.54 // 1cm = ~118.11px a 300 DPI

// Dimensiones del área de contenido: 9.9cm x 12.4cm
const CONTENT_WIDTH = Math.round(9.9 * CM_TO_PX)   // ~1169px
const CONTENT_HEIGHT = Math.round(12.4 * CM_TO_PX) // ~1465px

// Margen para las líneas de corte punteadas
const CUT_LINE_MARGIN = Math.round(0.3 * CM_TO_PX) // 0.3cm de margen
const CUT_LINE_WIDTH = 2 // Grosor de la línea
const DASH_LENGTH = 10 // Largo del guión
const DASH_GAP = 8 // Espacio entre guiones

/**
 * Genera un QR code en el cliente (navegador) usando Canvas.
 * Incluye nombre del producto arriba, QR en el centro, y SKU abajo.
 * Dimensiones: 9.9cm x 12.4cm a 300 DPI con marcas de corte
 */
export async function generateQrWithProductInfoClient(
  productInfo: ProductInfo
): Promise<string> {
  // Dimensiones totales incluyendo márgenes para líneas de corte
  const totalWidth = CONTENT_WIDTH + CUT_LINE_MARGIN * 2
  const totalHeight = CONTENT_HEIGHT + CUT_LINE_MARGIN * 2

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

  // Dibujar líneas de corte punteadas
  drawDashedCutLines(ctx, totalWidth, totalHeight)

  // Área de contenido (dentro de las líneas de corte)
  const contentX = CUT_LINE_MARGIN
  const contentY = CUT_LINE_MARGIN

  // Calcular tamaño del QR (dejando espacio para nombre y SKU)
  const padding = Math.round(0.15 * CM_TO_PX) // 0.15cm de padding interno (reducido)
  const nameAreaHeight = Math.round(1.6 * CM_TO_PX) // 1.6cm para el nombre
  const skuAreaHeight = Math.round(1.0 * CM_TO_PX)  // 1.0cm para el SKU
  
  // El QR ocupa el espacio restante
  const qrSize = Math.min(
    CONTENT_WIDTH - padding * 2,
    CONTENT_HEIGHT - nameAreaHeight - skuAreaHeight - padding * 2
  )

  // Centrar el QR horizontalmente
  const qrX = contentX + (CONTENT_WIDTH - qrSize) / 2
  const qrY = contentY + nameAreaHeight

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
  ctx.drawImage(qrCanvas, qrX, qrY)

  // Configurar texto
  ctx.fillStyle = '#000000'
  ctx.textAlign = 'center'

  // Dibujar nombre del producto (arriba del QR) - MAYÚSCULAS, BOLD, MÁS GRANDE
  const nameCenterX = contentX + CONTENT_WIDTH / 2
  const nameCenterY = contentY + nameAreaHeight / 2
  drawWrappedText(ctx, productInfo.name.toUpperCase(), nameCenterX, nameCenterY, CONTENT_WIDTH - padding * 2, 'bold', 48)

  // Dibujar SKU (abajo del QR) - MAYÚSCULAS, BOLD, MÁS GRANDE
  const skuCenterX = contentX + CONTENT_WIDTH / 2
  const skuCenterY = contentY + nameAreaHeight + qrSize + skuAreaHeight / 2
  ctx.font = 'bold 48px Arial, sans-serif'
  ctx.textBaseline = 'middle'
  ctx.fillText(productInfo.sku.toUpperCase(), skuCenterX, skuCenterY)

  // Convertir canvas a data URL (PNG)
  return canvas.toDataURL('image/png', 1.0)
}

/**
 * Dibuja líneas de corte punteadas alrededor de todo el borde
 */
function drawDashedCutLines(ctx: CanvasRenderingContext2D, totalWidth: number, totalHeight: number) {
  ctx.strokeStyle = '#000000'
  ctx.lineWidth = CUT_LINE_WIDTH
  ctx.setLineDash([DASH_LENGTH, DASH_GAP])

  const x = CUT_LINE_MARGIN
  const y = CUT_LINE_MARGIN
  const width = CONTENT_WIDTH
  const height = CONTENT_HEIGHT

  // Dibujar rectángulo punteado completo
  ctx.beginPath()
  ctx.rect(x, y, width, height)
  ctx.stroke()

  // Restaurar línea sólida para otros elementos
  ctx.setLineDash([])
}

/**
 * Dibuja texto con ajuste de línea automático
 */
function drawWrappedText(
  ctx: CanvasRenderingContext2D,
  text: string,
  centerX: number,
  centerY: number,
  maxWidth: number,
  fontWeight: string = 'normal',
  fontSize: number = 36
) {
  ctx.font = `${fontWeight} ${fontSize}px Arial, sans-serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  const words = text.split(' ')
  const lines: string[] = []
  let currentLine = ''

  for (const word of words) {
    const testLine = currentLine + (currentLine ? ' ' : '') + word
    const metrics = ctx.measureText(testLine)

    if (metrics.width > maxWidth && currentLine) {
      lines.push(currentLine)
      currentLine = word
    } else {
      currentLine = testLine
    }
  }
  if (currentLine) {
    lines.push(currentLine)
  }

  // Calcular posición Y inicial para centrar verticalmente
  const lineHeight = fontSize * 1.2
  const totalTextHeight = lines.length * lineHeight
  let startY = centerY - totalTextHeight / 2 + lineHeight / 2

  // Dibujar cada línea
  for (const line of lines) {
    ctx.fillText(line, centerX, startY)
    startY += lineHeight
  }
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
