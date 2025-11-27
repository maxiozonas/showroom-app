import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const historyQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  search: z.string().optional().nullable().transform(val => val || undefined),
  productId: z.coerce.number().int().positive().optional().nullable().transform(val => val || undefined),
})

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const queryParams = {
      page: searchParams.get('page'),
      limit: searchParams.get('limit'),
      search: searchParams.get('search'),
      productId: searchParams.get('productId'),
    }

    // Validar query params
    const { page, limit, search, productId } = historyQuerySchema.parse(queryParams)
    const skip = (page - 1) * limit

    // Construir filtro de búsqueda
    const where: any = {}
    
    if (productId) {
      where.productId = productId
    }
    
    if (search) {
      where.product = {
        sku: {
          contains: search,
          mode: 'insensitive' as const,
        },
      }
    }

    // Obtener historial con información del producto
    const [history, total] = await Promise.all([
      prisma.qRHistory.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          product: {
            select: {
              id: true,
              sku: true,
              name: true,
              brand: true,
            },
          },
        },
      }),
      prisma.qRHistory.count({ where }),
    ])

    return NextResponse.json({
      history,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error: any) {
    console.error('Error fetching history:', error)
    return NextResponse.json(
      { error: error.message || 'Error al obtener historial' },
      { status: 400 }
    )
  }
}
