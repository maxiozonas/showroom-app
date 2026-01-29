'use client'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

export function ErrorFallback({ error }: { error: Error | unknown }) {
  const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
  
  return (
    <div className="p-8">
      <Alert variant="destructive">
        <AlertTitle>Algo salió mal</AlertTitle>
        <AlertDescription className="mt-2">
          Hubo un error inesperado. Por favor, intenta recargar la página.
          <details className="mt-4">
            <summary className="cursor-pointer font-medium">Detalles del error</summary>
            <p className="mt-2 text-sm font-mono bg-muted p-2 rounded">
              {errorMessage}
            </p>
          </details>
        </AlertDescription>
      </Alert>
    </div>
  )
}
