'use client'

import { useState, useMemo, useEffect } from 'react'
import { useDebounce } from '@/src/hooks/useDebounce'
import { useProducts, useDeleteProduct } from '../hooks/useProducts'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MoreHorizontal, Pencil, Trash2, QrCode, Plus, Search, Loader2 } from 'lucide-react'
import { ProductFormDialog } from './product-form-dialog'
import { toast } from 'sonner'
import type { ProductQuery } from '../schemas/product.schema'
import { Skeleton } from '@/components/ui/skeleton'
import { Checkbox } from '@/components/ui/checkbox'

interface Product {
  id: number
  sku: string
  name: string
  brand: string | null
  urlKey: string | null
  enabled: boolean
  hasQrs?: boolean
  createdAt: string
  updatedAt: string
}

interface ProductsTableProps {
  onGenerateQR?: (product: Product) => void
  selectedProducts?: number[]
  onSelectionChange?: (selectedIds: number[]) => void
  onProductsLoaded?: (products: Product[]) => void
}

export function ProductsTable({ onGenerateQR, selectedProducts = [], onSelectionChange, onProductsLoaded }: ProductsTableProps) {
  // Paginación y filtros
  const [page, setPage] = useState(1)
  const [limit] = useState(10)
  const [search, setSearch] = useState('')
  const [brandFilter, setBrandFilter] = useState('')
  const [enabledFilter, setEnabledFilter] = useState<string>('')
  
  // Debounced search para evitar llamadas excesivas
  const debouncedSearch = useDebounce(search, 500)
  
  // Dialogs
  const [formDialogOpen, setFormDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)

  // Manejar selección de productos
  const handleToggleProduct = (productId: number) => {
    if (!onSelectionChange) return
    
    const newSelection = selectedProducts.includes(productId)
      ? selectedProducts.filter(id => id !== productId)
      : [...selectedProducts, productId]
    
    onSelectionChange(newSelection)
  }

  const handleToggleAll = () => {
    if (!onSelectionChange) return
    
    if (selectedProducts.length === products.length) {
      onSelectionChange([])
    } else {
      onSelectionChange(products.map(p => p.id))
    }
  }

  // Resetear página cuando cambian los filtros
  useEffect(() => {
    setPage(1)
  }, [debouncedSearch, brandFilter, enabledFilter])

  // React Query - Fetch products con caché automático
  const { data, isLoading, error } = useProducts({
    page,
    limit,
    search: debouncedSearch || undefined,
    brand: brandFilter || undefined,
    enabled: enabledFilter ? enabledFilter === 'true' : undefined,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  })

  // React Query - Delete mutation
  const deleteMutation = useDeleteProduct()

  const products = data?.products || []
  const pagination = data?.pagination || { page: 1, limit: 10, total: 0, totalPages: 0 }

  // Notificar cuando se cargan los productos
  useEffect(() => {
    if (products.length > 0 && onProductsLoaded) {
      onProductsLoaded(products)
    }
  }, [products, onProductsLoaded])

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de eliminar este producto?')) return

    try {
      await deleteMutation.mutateAsync(id)
      toast.success('✅ Producto eliminado exitosamente')
    } catch (error: any) {
      toast.error(`❌ ${error.message}`)
    }
  }

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
    setFormDialogOpen(true)
  }

  const handleCreateNew = () => {
    setEditingProduct(null)
    setFormDialogOpen(true)
  }

  const handleFormClose = () => {
    setFormDialogOpen(false)
    setEditingProduct(null)
  }

  const handleFormSuccess = () => {
    // React Query invalidará automáticamente la caché
  }

  return (
    <div className="space-y-4">
      {/* Filtros y acciones */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-1 gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por SKU o nombre..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8"
            />
          </div>
          
          <Input
            placeholder="Filtrar por marca..."
            value={brandFilter}
            onChange={(e) => setBrandFilter(e.target.value)}
            className="max-w-[200px]"
          />
          
          <Select value={enabledFilter || 'all'} onValueChange={(value) => {
            setEnabledFilter(value === 'all' ? '' : value)
          }}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="true">Habilitados</SelectItem>
              <SelectItem value="false">Deshabilitados</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button onClick={handleCreateNew}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Producto
        </Button>
      </div>

      {/* Tabla */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {onSelectionChange && (
                <TableHead className="w-[50px]">
                  <Checkbox
                    checked={selectedProducts.length === products.length && products.length > 0}
                    onCheckedChange={handleToggleAll}
                    aria-label="Seleccionar todos"
                  />
                </TableHead>
              )}
              <TableHead>SKU</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>Marca</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Fecha Creación</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              [...Array(5)].map((_, i) => (
                <TableRow key={i}>
                  {onSelectionChange && <TableCell><Skeleton className="h-4 w-4" /></TableCell>}
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Skeleton className="h-8 w-8" />
                      <Skeleton className="h-8 w-8" />
                      <Skeleton className="h-8 w-28" />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={onSelectionChange ? 7 : 6} className="text-center">
                  No se encontraron productos
                </TableCell>
              </TableRow>
            ) : (
              products.map((product) => (
                <TableRow key={product.id}>
                  {onSelectionChange && (
                    <TableCell>
                      <Checkbox
                        checked={selectedProducts.includes(product.id)}
                        onCheckedChange={() => handleToggleProduct(product.id)}
                        disabled={!product.urlKey}
                        aria-label={`Seleccionar ${product.sku}`}
                      />
                    </TableCell>
                  )}
                  <TableCell className="font-medium">{product.sku}</TableCell>
                  <TableCell>{product.name}</TableCell>
                  <TableCell>{product.brand || '-'}</TableCell>
                  <TableCell>
                    <Badge variant={product.enabled ? 'default' : 'secondary'}>
                      {product.enabled ? 'Habilitado' : 'Deshabilitado'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(product.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(product)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(product.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant={product.hasQrs ? "outline" : "default"}
                        size="sm"
                        onClick={() => onGenerateQR?.(product)}
                      >
                        <QrCode className="h-4 w-4 mr-2" />
                        {product.hasQrs ? 'Detalles QR' : 'Generar QR'}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Paginación */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Mostrando {products.length} de {pagination.total} productos
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

      {/* Dialog de formulario */}
      <ProductFormDialog
        open={formDialogOpen}
        onOpenChange={handleFormClose}
        onSuccess={handleFormSuccess}
        product={editingProduct}
      />
    </div>
  )
}
