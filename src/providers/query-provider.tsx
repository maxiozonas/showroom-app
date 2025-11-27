'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useState } from 'react'

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Datos se consideran frescos por 5 minutos
            staleTime: 5 * 60 * 1000,
            // Caché se mantiene por 10 minutos
            gcTime: 10 * 60 * 1000,
            // No refetch automático al cambiar de ventana
            refetchOnWindowFocus: false,
            // Reintentar 1 vez en caso de error
            retry: 1,
          },
        },
      })
  )

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  )
}
