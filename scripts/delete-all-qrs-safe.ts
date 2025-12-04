/**
 * Script SEGURO para eliminar todos los QRs (con confirmación)
 * 
 * Uso:
 * pnpm delete-qrs-safe
 * o
 * pnpm tsx scripts/delete-all-qrs-safe.ts
 */

import { prisma } from '@/lib/prisma'
import { UTApi } from 'uploadthing/server'
import * as readline from 'readline'

const utapi = new UTApi()

// Crear interfaz para leer input del usuario
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

function askQuestion(question: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer)
    })
  })
}

async function deleteAllQrs() {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('⚠️  ADVERTENCIA: ELIMINACIÓN DE TODOS LOS QRs')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  try {
    // 1. Obtener conteo de QRs
    console.log('📊 Consultando base de datos...')
    const qrCount = await prisma.qRHistory.count()
    
    if (qrCount === 0) {
      console.log('ℹ️  No hay QRs para eliminar\n')
      rl.close()
      return
    }

    console.log(`\n⚠️  Se encontraron ${qrCount} QRs que serán eliminados`)
    console.log('   - Se eliminarán de la base de datos')
    console.log('   - Se eliminarán de UploadThing')
    console.log('   - Esta acción NO se puede deshacer\n')

    // 2. Pedir confirmación
    const answer1 = await askQuestion('¿Estás seguro de que quieres continuar? (escribe "SI" para confirmar): ')
    
    if (answer1.toUpperCase() !== 'SI') {
      console.log('\n❌ Operación cancelada por el usuario\n')
      rl.close()
      return
    }

    const answer2 = await askQuestion(`\n⚠️  Última confirmación: Se eliminarán ${qrCount} QRs. Escribe "ELIMINAR" para continuar: `)
    
    if (answer2.toUpperCase() !== 'ELIMINAR') {
      console.log('\n❌ Operación cancelada por el usuario\n')
      rl.close()
      return
    }

    console.log('\n🚀 Iniciando eliminación...\n')

    // 3. Obtener todos los QRs
    console.log('📊 Obteniendo QRs de la base de datos...')
    const allQrs = await prisma.qRHistory.findMany({
      select: {
        id: true,
        qrUrl: true,
        productId: true,
      },
    })

    console.log(`✅ Obtenidos ${allQrs.length} QRs\n`)

    // 4. Extraer keys de UploadThing
    console.log('🔍 Extrayendo keys de UploadThing...')
    const uploadThingKeys: string[] = []

    for (const qr of allQrs) {
      try {
        const urlParts = qr.qrUrl.split('/')
        const key = urlParts[urlParts.length - 1]
        if (key) {
          uploadThingKeys.push(key)
        }
      } catch (error) {
        console.warn(`⚠️  No se pudo extraer key de URL: ${qr.qrUrl}`)
      }
    }

    console.log(`✅ Extraídas ${uploadThingKeys.length} keys\n`)

    // 5. Eliminar de UploadThing
    if (uploadThingKeys.length > 0) {
      console.log('🗑️  Eliminando archivos de UploadThing...')
      
      const batchSize = 100
      let deletedCount = 0
      let errorCount = 0

      for (let i = 0; i < uploadThingKeys.length; i += batchSize) {
        const batch = uploadThingKeys.slice(i, i + batchSize)
        
        try {
          await utapi.deleteFiles(batch)
          deletedCount += batch.length
          console.log(`   ✓ Progreso: ${deletedCount}/${uploadThingKeys.length} archivos`)
        } catch (error: any) {
          errorCount += batch.length
          console.error(`   ✗ Error en lote ${Math.floor(i / batchSize) + 1}:`, error.message)
        }
      }

      console.log(`✅ Eliminados ${deletedCount} archivos de UploadThing`)
      if (errorCount > 0) {
        console.log(`⚠️  Errores en ${errorCount} archivos\n`)
      } else {
        console.log('')
      }
    }

    // 6. Eliminar de la base de datos
    console.log('🗑️  Eliminando registros de la base de datos...')
    const deleteResult = await prisma.qRHistory.deleteMany({})
    console.log(`✅ Eliminados ${deleteResult.count} registros\n`)

    // 7. Resumen final
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('✅ LIMPIEZA COMPLETADA EXITOSAMENTE')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log(`📊 QRs encontrados:        ${allQrs.length}`)
    console.log(`🗑️  Archivos eliminados:   ${uploadThingKeys.length}`)
    console.log(`💾 Registros eliminados:   ${deleteResult.count}`)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  } catch (error: any) {
    console.error('\n❌ Error durante la limpieza:', error.message)
    console.error(error)
    throw error
  } finally {
    rl.close()
    await prisma.$disconnect()
  }
}

// Ejecutar script
deleteAllQrs()
  .then(() => {
    console.log('✅ Script finalizado exitosamente\n')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Script finalizado con errores:', error)
    process.exit(1)
  })
