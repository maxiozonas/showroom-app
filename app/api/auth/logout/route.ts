import { NextResponse } from 'next/server'
import { removeAuthCookie } from '@/src/lib/auth'

export async function POST() {
  try {
    await removeAuthCookie()

    return NextResponse.json({
      success: true,
      message: 'Sesión cerrada exitosamente',
    })
  } catch (error) {
    console.error('Error en logout:', error)
    return NextResponse.json(
      { error: 'Error al cerrar sesión' },
      { status: 500 }
    )
  }
}
