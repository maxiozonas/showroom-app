import QRCode from 'qrcode'

export interface QrGeneratorOptions {
  width?: number
  margin?: number
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H'
  color?: {
    dark?: string
    light?: string
  }
}

/**
 * Genera un código QR como buffer PNG
 */
export async function generateQrBuffer(
  url: string,
  options: QrGeneratorOptions = {}
): Promise<Buffer> {
  const defaultOptions: QRCode.QRCodeToBufferOptions = {
    type: 'png',
    width: options.width || 512,
    margin: options.margin || 2,
    errorCorrectionLevel: options.errorCorrectionLevel || 'M',
    color: {
      dark: options.color?.dark || '#000000',
      light: options.color?.light || '#FFFFFF',
    },
  }

  return QRCode.toBuffer(url, defaultOptions)
}

/**
 * Genera un código QR como Data URL (base64)
 */
export async function generateQrDataUrl(
  url: string,
  options: QrGeneratorOptions = {}
): Promise<string> {
  const defaultOptions: QRCode.QRCodeToDataURLOptions = {
    type: 'image/png',
    width: options.width || 512,
    margin: options.margin || 2,
    errorCorrectionLevel: options.errorCorrectionLevel || 'M',
    color: {
      dark: options.color?.dark || '#000000',
      light: options.color?.light || '#FFFFFF',
    },
  }

  return QRCode.toDataURL(url, defaultOptions)
}

/**
 * Genera un código QR como SVG string
 */
export async function generateQrSvg(
  url: string,
  options: QrGeneratorOptions = {}
): Promise<string> {
  const defaultOptions: QRCode.QRCodeToStringOptions = {
    type: 'svg',
    width: options.width || 512,
    margin: options.margin || 2,
    errorCorrectionLevel: options.errorCorrectionLevel || 'M',
    color: {
      dark: options.color?.dark || '#000000',
      light: options.color?.light || '#FFFFFF',
    },
  }

  return QRCode.toString(url, defaultOptions)
}
