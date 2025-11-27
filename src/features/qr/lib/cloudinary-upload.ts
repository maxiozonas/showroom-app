import { v2 as cloudinary } from 'cloudinary'

// Configurar Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export interface CloudinaryUploadResult {
  url: string
  secureUrl: string
  publicId: string
  format: string
  width: number
  height: number
}

/**
 * Sube un buffer de imagen a Cloudinary
 * Organiza los QR en carpetas por SKU: showroom-app/{sku}/qr-{timestamp}
 */
export async function uploadQrToCloudinary(
  buffer: Buffer,
  productSku: string
): Promise<CloudinaryUploadResult> {
  return new Promise((resolve, reject) => {
    // Sanitizar el SKU para usarlo como nombre de carpeta
    const sanitizedSku = productSku.replace(/[^a-zA-Z0-9-_]/g, '_')
    const timestamp = Date.now()
    
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: `showroom-app/${sanitizedSku}`,
        public_id: `qr-${timestamp}`,
        resource_type: 'image',
        format: 'png',
        overwrite: false,
      },
      (error, result) => {
        if (error) {
          reject(new Error(`Error al subir a Cloudinary: ${error.message}`))
          return
        }

        if (!result) {
          reject(new Error('No se recibió respuesta de Cloudinary'))
          return
        }

        resolve({
          url: result.url,
          secureUrl: result.secure_url,
          publicId: result.public_id,
          format: result.format,
          width: result.width,
          height: result.height,
        })
      }
    )

    uploadStream.end(buffer)
  })
}

/**
 * Elimina una imagen de Cloudinary por public_id
 */
export async function deleteQrFromCloudinary(publicId: string): Promise<void> {
  try {
    await cloudinary.uploader.destroy(publicId)
  } catch (error: any) {
    throw new Error(`Error al eliminar de Cloudinary: ${error.message}`)
  }
}

/**
 * Verifica que Cloudinary esté configurado correctamente
 */
export function isCloudinaryConfigured(): boolean {
  return !!(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  )
}
