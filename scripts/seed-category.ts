import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🔄 Creando categoría "Salon Aberturas"...')

  const category = await prisma.category.upsert({
    where: { slug: 'salon-aberturas' },
    update: {},
    create: {
      name: 'Salon Aberturas',
      slug: 'salon-aberturas',
    },
  })

  console.log(`✅ Categoría creada: ${category.name} (ID: ${category.id})`)

  console.log('🔄 Asociando productos existentes a la categoría...')

  const result = await prisma.product.updateMany({
    where: {
      categoryId: null,
    },
    data: {
      categoryId: category.id,
    },
  })

  console.log(`✅ ${result.count} productos asociados a la categoría`)

  console.log('\n✨ Proceso completado exitosamente')
}

main()
  .catch((e) => {
    console.error('❌ Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
