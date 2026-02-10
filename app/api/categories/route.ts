import { NextRequest, NextResponse } from 'next/server'
import { getCategories, createCategory, getAllCategories } from '@/src/features/categories/lib/category.service'
import { createCategorySchema, categoryQuerySchema } from '@/src/features/categories/schemas/category.schema'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams

    if (searchParams.get('all') === 'true') {
      const categories = await getAllCategories()
      return NextResponse.json(categories)
    }

    const queryParams = {
      page: searchParams.get('page'),
      limit: searchParams.get('limit'),
      search: searchParams.get('search'),
      sortBy: searchParams.get('sortBy'),
      sortOrder: searchParams.get('sortOrder'),
    }

    const validatedQuery = categoryQuerySchema.parse(queryParams)
    const result = await getCategories(validatedQuery)

    return NextResponse.json(result)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Error al obtener categorías' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = createCategorySchema.parse(body)
    const category = await createCategory(validatedData)

    return NextResponse.json(category, { status: 201 })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Error al crear categoría' },
      { status: 400 }
    )
  }
}
