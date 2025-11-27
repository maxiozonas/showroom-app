import { NextRequest, NextResponse } from 'next/server'
import { parseCSV } from '@/src/features/imports/lib/csv-parser'
import { ImportService } from '@/src/features/imports/lib/import.service'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { error: 'No se proporcionó ningún archivo' },
        { status: 400 }
      )
    }

    // Validar que sea un CSV
    if (!file.name.endsWith('.csv')) {
      return NextResponse.json(
        { error: 'El archivo debe ser un CSV' },
        { status: 400 }
      )
    }

    // Parsear CSV
    const { validRows, errors: parseErrors } = await parseCSV(file)

    if (validRows.length === 0) {
      return NextResponse.json(
        { 
          error: 'No se encontraron filas válidas en el CSV',
          parseErrors,
        },
        { status: 400 }
      )
    }

    // Importar productos (usando método batch para mejor performance)
    const result = await ImportService.importProductsBatch(validRows)

    // Combinar errores de parseo con errores de importación
    const allErrors = [...parseErrors, ...result.errors]

    return NextResponse.json({
      success: result.success,
      created: result.created,
      updated: result.updated,
      errors: allErrors,
      totalRows: validRows.length + parseErrors.length,
    })
  } catch (error: any) {
    console.error('Error in import:', error)
    return NextResponse.json(
      { error: error.message || 'Error al procesar la importación' },
      { status: 500 }
    )
  }
}
