'use client'

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
const CONTENT_WIDTH = Math.round(9 * CM_TO_PX)   // ~1169px
const CONTENT_HEIGHT = Math.round(11 * CM_TO_PX) // ~1465px

// Margen para las líneas de corte punteadas
const CUT_LINE_MARGIN = Math.round(0.1 * CM_TO_PX) // 0.3cm de margen
const CUT_LINE_WIDTH = 1 // Grosor de la línea
const DASH_LENGTH = 10 // Largo del guión
const DASH_GAP = 8 // Espacio entre guiones

// Logo en el centro del QR
const LOGO_PATH = '/gili-logo.png'
const LOGO_SIZE_RATIO = 0.22 // El logo ocupa 22% del QR

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
  const padding = Math.round(0.05 * CM_TO_PX) // 0.15cm de padding interno (reducido)
  const nameAreaHeight = Math.round(1.6 * CM_TO_PX) // 1.6cm para el nombre
  const skuAreaHeight = Math.round(0.5 * CM_TO_PX)  // 1.0cm para el SKU
  
  // El QR ocupa el 70% del espacio disponible (reducido para que sea más pequeño)
  const maxQrSize = Math.min(
    CONTENT_WIDTH - padding * 2,
    CONTENT_HEIGHT - nameAreaHeight - skuAreaHeight - padding * 2
  )
  const qrSize = Math.round(maxQrSize * 0.85) // Reducir al 70% del tamaño original

  // Centrar el QR horizontal y verticalmente
  const qrX = contentX + (CONTENT_WIDTH - qrSize) / 2
  // Centrar verticalmente entre el área del nombre y el área del SKU
  const availableVerticalSpace = CONTENT_HEIGHT - nameAreaHeight - skuAreaHeight
  const qrY = contentY + nameAreaHeight + (availableVerticalSpace - qrSize) / 2

  // Generar QR code con nivel de corrección alto (permite logo en el centro)
  const qrCanvas = document.createElement('canvas')
  const QRCode = (await import('qrcode')).default
  await QRCode.toCanvas(qrCanvas, productInfo.url, {
    width: qrSize,
    margin: 1,
    errorCorrectionLevel: 'H', // Alto - permite hasta 30% de oclusión para el logo
    color: {
      dark: '#000000',
      light: '#FFFFFF',
    },
  })

  // Dibujar QR en el canvas principal
  ctx.drawImage(qrCanvas, qrX, qrY)

  // Dibujar logo en el centro del QR
  await drawLogoOnQr(ctx, qrX, qrY, qrSize)

  // Configurar texto
  ctx.fillStyle = '#000000'
  ctx.textAlign = 'center'

  // Dibujar nombre del producto (arriba del QR) - MAYÚSCULAS, BOLD, MÁS GRANDE
  const nameCenterX = contentX + CONTENT_WIDTH / 2
  const nameTopMargin = Math.round(0.4 * CM_TO_PX) // Margen superior del título (0.4cm)
  const nameCenterY = contentY + nameTopMargin + (nameAreaHeight - nameTopMargin) / 2
  const nameMargin = Math.round(0.5 * CM_TO_PX) // Mayor margen lateral para el título (0.5cm)
  drawWrappedText(ctx, productInfo.name.toUpperCase(), nameCenterX, nameCenterY, CONTENT_WIDTH - nameMargin * 2, 'bold', 48)

  // Dibujar SKU (pegado a la parte inferior de la tarjeta) - MAYÚSCULAS, BOLD, MÁS GRANDE
  const skuCenterX = contentX + CONTENT_WIDTH / 2
  const skuCenterY = contentY + CONTENT_HEIGHT - padding - 30 // 30px desde el borde inferior
  ctx.font = 'bold 48px Arial, sans-serif'
  ctx.textBaseline = 'middle'
  ctx.fillText(`SKU: ${productInfo.sku.toUpperCase()}`, skuCenterX, skuCenterY)

  // Convertir canvas a data URL (PNG)
  return canvas.toDataURL('image/png', 1.0)
}

/**
 * Carga y dibuja el logo en el centro del QR
 */
async function drawLogoOnQr(
  ctx: CanvasRenderingContext2D,
  qrX: number,
  qrY: number,
  qrSize: number
): Promise<void> {
  return new Promise((resolve) => {
    const logo = new Image()
    logo.crossOrigin = 'anonymous'
    
    logo.onload = () => {
      // Calcular tamaño del logo manteniendo aspect ratio
      const logoMaxSize = Math.round(qrSize * LOGO_SIZE_RATIO)
      const aspectRatio = logo.width / logo.height
      
      let logoWidth: number
      let logoHeight: number
      
      if (aspectRatio > 1) {
        // Logo más ancho que alto
        logoWidth = logoMaxSize
        logoHeight = Math.round(logoMaxSize / aspectRatio)
      } else {
        // Logo más alto que ancho
        logoHeight = logoMaxSize
        logoWidth = Math.round(logoMaxSize * aspectRatio)
      }
      
      // Calcular posición centrada
      const logoX = qrX + (qrSize - logoWidth) / 2
      const logoY = qrY + (qrSize - logoHeight) / 2
      
      // Dibujar fondo blanco para el logo (con padding)
      const padding = Math.round(Math.max(logoWidth, logoHeight) * 0.15)
      ctx.fillStyle = '#FFFFFF'
      ctx.fillRect(
        logoX - padding,
        logoY - padding,
        logoWidth + padding * 2,
        logoHeight + padding * 2
      )
      
      // Crear canvas temporal para invertir colores del logo (blanco → negro)
      const tempCanvas = document.createElement('canvas')
      tempCanvas.width = logo.width
      tempCanvas.height = logo.height
      const tempCtx = tempCanvas.getContext('2d')
      
      if (tempCtx) {
        // Dibujar logo original
        tempCtx.drawImage(logo, 0, 0)
        
        // Obtener datos de imagen e invertir colores
        const imageData = tempCtx.getImageData(0, 0, logo.width, logo.height)
        const data = imageData.data
        
        for (let i = 0; i < data.length; i += 4) {
          // Invertir RGB (blanco → negro, negro → blanco)
          data[i] = 255 - data[i]       // R
          data[i + 1] = 255 - data[i + 1] // G
          data[i + 2] = 255 - data[i + 2] // B
          // Alpha se mantiene igual
        }
        
        tempCtx.putImageData(imageData, 0, 0)
        
        // Dibujar logo invertido
        ctx.drawImage(tempCanvas, logoX, logoY, logoWidth, logoHeight)
      } else {
        // Fallback: dibujar logo sin invertir
        ctx.drawImage(logo, logoX, logoY, logoWidth, logoHeight)
      }
      
      resolve()
    }
    
    logo.onerror = () => {
      // Si falla la carga del logo, continuar sin él
      console.warn('No se pudo cargar el logo del QR')
      resolve()
    }
    
    logo.src = LOGO_PATH
  })
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
