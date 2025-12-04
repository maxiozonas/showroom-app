/**
 * Script para eliminar todos los QRs de la base de datos y UploadThing
 * 
 * Uso:
 * pnpm delete-qrs
 * o
 * pnpm tsx scripts/delete-all-qrs.ts
 */

import { prisma } from '@/lib/prisma'
import { UTApi } from 'uploadthing/server'

const utapi = new UTApi()

async function deleteAllQrs() {
  console.log('🚀 Iniciando limpieza de QRs...\n')

  try {
    // 1. Obtener todos los QRs de la base de datos
    console.log('📊 Obteniendo QRs de la base de datos...')
    const allQrs = await prisma.qRHistory.findMany({
      select: {
        id: true,
        qrUrl: true,
        productId: true,
      },
    })

    console.log(`✅ Encontrados ${allQrs.length} QRs en la base de datos\n`)

    if (allQrs.length === 0) {
      console.log('ℹ️  No hay QRs para eliminar')
      return
    }

    // 2. Extraer las URLs y keys de UploadThing
    console.log('🔍 Extrayendo keys de UploadThing...')
    const qrUrls = allQrs.map(qr => qr.qrUrl)
    const uploadThingKeys: string[] = []

    for (const url of qrUrls) {
      try {
        // Extraer la key del final de la URL
        // Formato: https://utfs.io/f/[KEY]
        const urlParts = url.split('/')
        const key = urlParts[urlParts.length - 1]
        if (key) {
          uploadThingKeys.push(key)
        }
      } catch (error) {
        console.warn(`⚠️  No se pudo extraer key de URL: ${url}`)
      }
    }

    console.log(`✅ Extraídas ${uploadThingKeys.length} keys de UploadThing\n`)

    // 3. Eliminar archivos de UploadThing en lotes
    if (uploadThingKeys.length > 0) {
      console.log('🗑️  Eliminando archivos de UploadThing...')
      
      // UploadThing permite eliminar hasta 100 archivos por request
      const batchSize = 100
      let deletedCount = 0

      for (let i = 0; i < uploadThingKeys.length; i += batchSize) {
        const batch = uploadThingKeys.slice(i, i + batchSize)
        
        try {
          await utapi.deleteFiles(batch)
          deletedCount += batch.length
          console.log(`   ✓ Eliminados ${deletedCount}/${uploadThingKeys.length} archivos`)
        } catch (error: any) {
          console.error(`   ✗ Error eliminando lote ${i / batchSize + 1}:`, error.message)
        }
      }

      console.log(`✅ Eliminados ${deletedCount} archivos de UploadThing\n`)
    }

    // 4. Eliminar registros de la base de datos
    console.log('🗑️  Eliminando registros de la base de datos...')
    const deleteResult = await prisma.qRHistory.deleteMany({})
    console.log(`✅ Eliminados ${deleteResult.count} registros de la base de datos\n`)

    // 5. Resumen final
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('✅ LIMPIEZA COMPLETADA')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log(`📊 QRs encontrados:        ${allQrs.length}`)
    console.log(`🗑️  Archivos eliminados:   ${uploadThingKeys.length}`)
    console.log(`💾 Registros eliminados:   ${deleteResult.count}`)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  } catch (error: any) {
    console.error('❌ Error durante la limpieza:', error.message)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Ejecutar script
deleteAllQrs()
  .then(() => {
    console.log('✅ Script finalizado exitosamente')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Script finalizado con errores:', error)
    process.exit(1)
  })
