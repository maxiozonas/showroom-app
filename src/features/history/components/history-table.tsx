'use client'

import { useState, useEffect } from 'react'
import { useDebounce } from '@/src/hooks/useDebounce'
import { useQrHistory, useDeleteQr } from '../hooks/useQrHistory'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, History as HistoryIcon } from 'lucide-react'
import { toast } from 'sonner'
import { QrHistoryCard } from './qr-history-card'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent } from '@/components/ui/card'

interface QrHistoryItem {
  id: number
  url: string
  qrUrl: string
  createdAt: string
  product: {
    id: number
    sku: string
    name: string
    brand: string | null
  }
}

export function HistoryTable() {
  const [page, setPage] = useState(1)
  const [limit] = useState(12)
  const [search, setSearch] = useState('')
  
  // Debounced search
  const debouncedSearch = useDebounce(search, 500)
  
  // Resetear página cuando cambia la búsqueda (apply rerender-move-effect-to-event en handler)
  const handleSearchChange = (value: string) => {
    setSearch(value)
    setPage(1)
  }
  
  // React Query - Fetch history
  const { data, isLoading } = useQrHistory({
    page,
    limit,
    search: debouncedSearch || undefined,
  })
  
  // React Query - Delete mutation
  const deleteMutation = useDeleteQr()
  
  const history = data?.history || []
  const pagination = data?.pagination || { page: 1, limit: 12, total: 0, totalPages: 0 }
  
  const handleDelete = async (id: number) => {
    try {
      await deleteMutation.mutateAsync(id)
      toast.success('✅ QR eliminado exitosamente')
    } catch (error: any) {
      toast.error(`❌ ${error.message}`)
    }
  }

  return (
    <div className="space-y-6">
      {/* Búsqueda */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      {/* Cards Grid */}
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="space-y-3">
                  <Skeleton className="h-32 w-32 mx-auto" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <div className="flex gap-2 pt-2">
                    <Skeleton className="h-8 flex-1" />
                    <Skeleton className="h-8 flex-1" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : history.length === 0 ? (
        <div className="text-center py-12">
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <HistoryIcon className="h-12 w-12 opacity-20" />
            <p className="font-medium">No hay códigos QR generados</p>
            <p className="text-sm">
              Genera tu primer QR desde la tabla de productos
            </p>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {history.map((item) => (
            <QrHistoryCard 
              key={item.id} 
              item={item} 
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Paginación */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Mostrando {history.length} de {pagination.total} códigos QR
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(page - 1)}
            disabled={pagination.page === 1 || isLoading}
          >
            Anterior
          </Button>
          <span className="text-sm text-muted-foreground px-2">
            Página {pagination.page} de {pagination.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(page + 1)}
            disabled={pagination.page >= pagination.totalPages || isLoading}
          >
            Siguiente
          </Button>
        </div>
      </div>
    </div>
  )
}
