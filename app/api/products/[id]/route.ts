import { NextRequest, NextResponse } from 'next/server'
import { getProductById, updateProduct, deleteProduct } from '@/src/features/products/lib/product.service'
import { updateProductSchema } from '@/src/features/products/schemas/product.schema'

// GET /api/products/[id] - Obtener un producto
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params
    const id = parseInt(idParam)
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'ID inválido' },
        { status: 400 }
      )
    }

    const product = await getProductById(id)
    
    if (!product) {
      return NextResponse.json(
        { error: 'Producto no encontrado' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(product)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Error al obtener producto' },
      { status: 500 }
    )
  }
}

// PUT /api/products/[id] - Actualizar un producto
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params
    const id = parseInt(idParam)
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'ID inválido' },
        { status: 400 }
      )
    }

    const body = await request.json()
    
    // Validar datos
    const validatedData = updateProductSchema.parse(body)
    
    const product = await updateProduct(id, validatedData)
    
    return NextResponse.json(product)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Error al actualizar producto' },
      { status: 400 }
    )
  }
}

// DELETE /api/products/[id] - Eliminar un producto
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params
    const id = parseInt(idParam)
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'ID inválido' },
        { status: 400 }
      )
    }

    await deleteProduct(id)
    
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Error al eliminar producto' },
      { status: 400 }
    )
  }
}
