import { promises as fs } from 'fs'
import path from 'path'

/**
 * Guarda un QR code localmente en la carpeta public/qr-codes
 */
export async function saveQrLocally(
  qrBuffer: Buffer,
  sku: string
): Promise<string> {
  try {
    // Sanitizar el SKU para usarlo como nombre de carpeta
    const sanitizedSku = sku.replace(/[^a-zA-Z0-9-_]/g, '_')
    
    // Crear carpeta para el SKU si no existe
    const skuFolder = path.join(process.cwd(), 'public', 'qr-codes', sanitizedSku)
    await fs.mkdir(skuFolder, { recursive: true })
    
    // Generar nombre de archivo con timestamp
    const timestamp = Date.now()
    const filename = `qr-${timestamp}.png`
    const filepath = path.join(skuFolder, filename)
    
    // Guardar el archivo
    await fs.writeFile(filepath, qrBuffer)
    
    // Retornar la URL pública
    const publicUrl = `/qr-codes/${sanitizedSku}/${filename}`
    
    return publicUrl
  } catch (error: any) {
    throw new Error(`Error al guardar QR localmente: ${error.message}`)
  }
}

/**
 * Elimina un QR code del almacenamiento local
 */
export async function deleteQrLocally(publicUrl: string): Promise<void> {
  try {
    const filepath = path.join(process.cwd(), 'public', publicUrl)
    await fs.unlink(filepath)
  } catch (error: any) {
    // Ignorar si el archivo no existe
    if (error.code !== 'ENOENT') {
      throw new Error(`Error al eliminar QR: ${error.message}`)
    }
  }
}

/**
 * Lista todos los QR codes de un SKU
 */
export async function listQrsBySku(sku: string): Promise<string[]> {
  try {
    const sanitizedSku = sku.replace(/[^a-zA-Z0-9-_]/g, '_')
    const skuFolder = path.join(process.cwd(), 'public', 'qr-codes', sanitizedSku)
    
    const files = await fs.readdir(skuFolder)
    return files
      .filter(file => file.endsWith('.png'))
      .map(file => `/qr-codes/${sanitizedSku}/${file}`)
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      return []
    }
    throw new Error(`Error al listar QRs: ${error.message}`)
  }
}
