import { NextRequest, NextResponse } from 'next/server'
import { ProductService } from '@/src/features/products/lib/product.service'
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
      sortBy: searchParams.get('sortBy'),
      sortOrder: searchParams.get('sortOrder'),
    }

    console.log('Query params received:', queryParams)

    // Validar query params
    const validatedQuery = productQuerySchema.parse(queryParams)
    
    console.log('Validated query:', validatedQuery)
    
    const result = await ProductService.getProducts(validatedQuery)
    
    console.log('Products result:', { count: result.products.length, total: result.pagination.total })
    
    return NextResponse.json(result)
  } catch (error: any) {
    console.error('Error fetching products:', error)
    console.error('Error details:', error)
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
    
    const product = await ProductService.createProduct(validatedData)
    
    return NextResponse.json(product, { status: 201 })
  } catch (error: any) {
    console.error('Error creating product:', error)
    return NextResponse.json(
      { error: error.message || 'Error al crear producto' },
      { status: 400 }
    )
  }
}
