import { NextRequest, NextResponse } from 'next/server'
import { getProducts, createProduct, updateProduct, deleteProduct } from '@/src/features/products/lib/product.service'
import { createProductSchema, productQuerySchema } from '@/src/features/products/schemas/product.schema'

// GET /api/products - Listar productos con filtros y paginación
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const queryParams = {
      page: searchParams.get('page'),
      limit: searchParams.get('limit'),
      search: searchParams.get('search'),
      brand: searchParams.get('brand'),
      enabled: searchParams.get('enabled'),
      printed: searchParams.get('printed'),
      categoryId: searchParams.get('categoryId'),
      sortBy: searchParams.get('sortBy'),
      sortOrder: searchParams.get('sortOrder'),
    }

    // Validar query params
    const validatedQuery = productQuerySchema.parse(queryParams)
    
    const result = await getProducts(validatedQuery)
    
    return NextResponse.json(result)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Error al obtener productos' },
      { status: 500 }
    )
  }
}

// POST /api/products - Crear un producto
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validar datos
    const validatedData = createProductSchema.parse(body)
    
    const product = await createProduct(validatedData)
    
    return NextResponse.json(product, { status: 201 })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Error al crear producto' },
      { status: 400 }
    )
  }
}
