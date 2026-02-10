import 'dotenv/config'
import { prisma } from '@/lib/prisma'

// Lista de SKUs a verificar
const skusToCheck = [
  '59831', '59832', '59836', '104235', '104239', '34369', '113045', '113057',
  '113067', '113075', '113079', '113088', '33244', '34367', '34368', '51413',
  '109237', '109239', '109241', '109243', '109245', '106155', '106157', '106159',
  '106161', '106163', '106165', '109249', '106033', '106036', '106040', '106044',
  '106046', '106048', '106072', '109443', '110593', '42451', '45430', '45696',
  '46166', '46171', '47610', '50136', '50187', '51674', '53951', '59641', '59644',
  '59645', '59647', '59649', '60218', '101839', '105874', '110404', '110412',
  '113690', '60298', '60314', '60330'
]

async function checkSkus() {
  console.log('Verificando SKUs en la base de datos...\n')
  
  try {
    // Buscar todos los productos que coincidan con los SKUs
    const existingProducts = await prisma.product.findMany({
      where: {
        sku: {
          in: skusToCheck
        }
      },
      select: {
        sku: true,
        name: true,
        brand: true,
        enabled: true
      },
      orderBy: {
        sku: 'asc'
      }
    })

    // Crear un Set de SKUs encontrados para comparación rápida
    const foundSkus = new Set(existingProducts.map(p => p.sku))
    
    // Separar SKUs encontrados y no encontrados
    const found = skusToCheck.filter(sku => foundSkus.has(sku))
    const notFound = skusToCheck.filter(sku => !foundSkus.has(sku))

    console.log('=== RESUMEN ===\n')
    console.log(`Total de SKUs verificados: ${skusToCheck.length}`)
    console.log(`SKUs encontrados: ${found.length}`)
    console.log(`SKUs NO encontrados: ${notFound.length}\n`)

    console.log('=== SKUs CARGADOS EN LA APLICACIÓN ===\n')
    if (existingProducts.length > 0) {
      existingProducts.forEach(product => {
        const status = product.enabled ? '✅ Activo' : '⚠️ Desactivado'
        console.log(`${product.sku} | ${status} | ${product.brand || 'Sin marca'} | ${product.name}`)
      })
    } else {
      console.log('Ninguno de los SKUs verificados está cargado en la base de datos.')
    }

    console.log('\n=== SKUs NO ENCONTRADOS ===\n')
    if (notFound.length > 0) {
      notFound.forEach(sku => {
        console.log(`❌ ${sku}`)
      })
    } else {
      console.log('Todos los SKUs están cargados en la base de datos.')
    }

    console.log('\n=== ESTADÍSTICAS POR MARCA ===\n')
    const brandCount = existingProducts.reduce((acc, product) => {
      const brand = product.brand || 'Sin marca'
      acc[brand] = (acc[brand] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    Object.entries(brandCount)
      .sort(([,a], [,b]) => b - a)
      .forEach(([brand, count]) => {
        console.log(`${brand}: ${count} productos`)
      })

  } catch (error) {
    console.error('Error al verificar SKUs:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

checkSkus()
