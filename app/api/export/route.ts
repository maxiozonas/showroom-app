import { NextRequest, NextResponse } from 'next/server'
import { ExportService } from '@/src/features/exports/lib/export.service'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const categoryIdParam = searchParams.get('categoryId')
    const categoryId = categoryIdParam ? parseInt(categoryIdParam) : undefined

    if (categoryIdParam && isNaN(categoryId!)) {
      return NextResponse.json(
        { error: 'ID de categoría inválido' },
        { status: 400 }
      )
    }

    const csv = await ExportService.exportProductsByCategory(categoryId)
    const filename = ExportService.getExportFileName(categoryId)

    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Error al exportar productos' },
      { status: 500 }
    )
  }
}
