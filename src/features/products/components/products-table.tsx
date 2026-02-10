'use client'

import { useState, useEffect, lazy, Suspense } from 'react'
import { useDebounce } from '@/src/hooks/useDebounce'
import { useProducts, useDeleteProduct } from '../hooks/useProducts'
import { useProductSelection } from '../hooks/useProductSelection'
import { useAllCategories } from '@/src/features/categories/hooks/useCategories'
import type { Product } from '../types'
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
import { Plus, Search, Info, X } from 'lucide-react'
import { toast } from 'sonner'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Skeleton } from '@/components/ui/skeleton'
import { Checkbox } from '@/components/ui/checkbox'
import ProductRow from './product-row'

const ProductFormDialog = lazy(() => import('./product-form-dialog').then(m => ({ default: m.ProductFormDialog })))

interface ProductsTableProps {
  onGenerateQR?: (product: Product) => void
  selectedProducts?: number[]
  onSelectionChange?: (selectedIds: number[], selectedProductsData: Product[]) => void
  onProductsLoaded?: (products: Product[]) => void
}

export function ProductsTable({ onGenerateQR, onSelectionChange, onProductsLoaded }: ProductsTableProps) {
  const [page, setPage] = useState(1)
  const [limit] = useState(10)
  const [search, setSearch] = useState('')
  const [brandFilter, setBrandFilter] = useState('')
  const [brandInput, setBrandInput] = useState('')
  const [enabledFilter, setEnabledFilter] = useState<string>('')
  const [categoryFilter, setCategoryFilter] = useState<string>('')

  const { data: categories } = useAllCategories()

  const {
    selectedIds,
    selectedProducts: internalSelectedProducts,
    toggleProduct,
    toggleAll,
    isSelected,
  } = useProductSelection()

  const debouncedSearch = useDebounce(search, 500)
  const debouncedBrand = useDebounce(brandInput, 500)

  useEffect(() => {
    setBrandFilter(debouncedBrand)
  }, [debouncedBrand])

  const getActiveFiltersList = () => {
    const active: string[] = []
    if (search) active.push('Búsqueda')
    if (brandFilter) active.push('Marca')
    if (categoryFilter) active.push('Categoría')
    if (enabledFilter) active.push('Estado')
    return active
  }

  const hasActiveFilters = !!(search || brandFilter || enabledFilter || categoryFilter)

  const handleClearFilters = () => {
    setSearch('')
    setBrandInput('')
    setEnabledFilter('')
    setCategoryFilter('')
    setPage(1)
  }

  const [formDialogOpen, setFormDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)

  const handleSearchChange = (value: string) => {
    setSearch(value)
    setPage(1)
  }

  const handleBrandFilterChange = (value: string) => {
    setBrandInput(value)
    setPage(1)
  }

  const handleEnabledFilterChange = (value: string) => {
    setEnabledFilter(value)
    setPage(1)
  }

  const handleCategoryFilterChange = (value: string) => {
    setCategoryFilter(value)
    setPage(1)
  }

  const handleToggleProduct = (productId: number) => {
    const product = products.find(p => p.id === productId)
    if (!product || !onSelectionChange) return

    const wasSelected = isSelected(productId)

    toggleProduct(productId, product)

    onSelectionChange(
      wasSelected
        ? selectedIds.filter(id => id !== productId)
        : [...selectedIds, productId],
      wasSelected
        ? internalSelectedProducts.filter(p => p.id !== productId)
        : [...internalSelectedProducts, product]
    )
  }

  const handleToggleAll = () => {
    if (!onSelectionChange) return

    const allSelected = products.every(p => isSelected(p.id))

    toggleAll(products)

    onSelectionChange(
      allSelected
        ? selectedIds.filter(id => !products.some(p => p.id === id))
        : [...new Set([...selectedIds, ...products.map(p => p.id)])],
      allSelected
        ? internalSelectedProducts.filter(p => !products.some(prod => prod.id === p.id))
        : [...new Set([...internalSelectedProducts, ...products])]
    )
  }

  const { data, isLoading, error } = useProducts({
    page,
    limit,
    search: debouncedSearch || undefined,
    brand: brandFilter || undefined,
    enabled: enabledFilter ? enabledFilter === 'true' : undefined,
    categoryId: categoryFilter ? parseInt(categoryFilter) : undefined,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  })

  const deleteMutation = useDeleteProduct()

  const currentProducts = data?.products || []
  const pagination = data?.pagination || { page: 1, limit: 10, total: 0, totalPages: 0 }

  useEffect(() => {
    if (currentProducts.length > 0 && onProductsLoaded) {
      onProductsLoaded(currentProducts)
    }
  }, [currentProducts, onProductsLoaded])

  const products = currentProducts

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

  const handleFormSuccess = () => {}

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-1 flex-wrap gap-2">
          <TooltipProvider>
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por SKU o nombre..."
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-8 pr-8"
              />
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="absolute right-2.5 top-2.5 h-4 w-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-sm">Busca productos por su código SKU o nombre de producto</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </TooltipProvider>

          <TooltipProvider>
            <div className="flex items-center gap-1 max-w-[200px]">
              <Input
                placeholder="Filtrar por marca..."
                value={brandInput}
                onChange={(e) => handleBrandFilterChange(e.target.value)}
                className="flex-1"
              />
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-4 w-4 text-muted-foreground cursor-help flex-shrink-0" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-sm">Filtra productos por nombre de marca</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </TooltipProvider>

          <TooltipProvider>
            <div className="flex items-center gap-1">
              <Select value={categoryFilter || 'all'} onValueChange={(value) => {
                handleCategoryFilterChange(value === 'all' ? '' : value)
              }}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Categoría" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  {categories && categories.map((cat: any) => (
                    <SelectItem key={cat.id} value={cat.id.toString()}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-4 w-4 text-muted-foreground cursor-help flex-shrink-0" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-sm">Filtra productos por categoría asignada</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </TooltipProvider>

          <TooltipProvider>
            <div className="flex items-center gap-1">
              <Select value={enabledFilter || 'all'} onValueChange={(value) => {
                handleEnabledFilterChange(value === 'all' ? '' : value)
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
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-4 w-4 text-muted-foreground cursor-help flex-shrink-0" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-sm">Muestra solo productos habilitados o deshabilitados</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </TooltipProvider>
        </div>

        <Button onClick={handleCreateNew}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Producto
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 rounded-lg border p-3 bg-muted/50">
        <div className="text-sm">
          {getActiveFiltersList().length > 0 ? (
            <p className="text-muted-foreground">
              {getActiveFiltersList().length} filtro{getActiveFiltersList().length !== 1 ? 's' : ''} aplicado{getActiveFiltersList().length !== 1 ? 's' : ''}:{' '}
              <span className="font-medium text-foreground">{getActiveFiltersList().join(', ')}</span>
            </p>
          ) : (
            <p className="text-muted-foreground">No hay filtros aplicados</p>
          )}
        </div>
        <Button 
          variant="outline" 
          size="sm"
          onClick={handleClearFilters}
          disabled={!hasActiveFilters}
          className="shrink-0"
        >
          <X className="mr-2 h-4 w-4" />
          Limpiar todos los filtros
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {onSelectionChange && (
                <TableHead className="w-[50px]">
                  <Checkbox
                    checked={products.length > 0 && products.every(p => isSelected(p.id))}
                    onCheckedChange={handleToggleAll}
                    aria-label="Seleccionar todos"
                  />
                </TableHead>
              )}
              <TableHead>SKU</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>Categoría</TableHead>
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
                <TableCell colSpan={onSelectionChange ? 8 : 7} className="text-center">
                  No se encontraron productos
                </TableCell>
              </TableRow>
            ) : (
              products.map((product) => (
                <ProductRow
                  key={product.id}
                  product={product}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onGenerateQR={onGenerateQR}
                  selected={isSelected(product.id)}
                  onToggleSelect={onSelectionChange ? handleToggleProduct : undefined}
                  canSelect={!!onSelectionChange}
                />
              ))
            )}
          </TableBody>
        </Table>
      </div>

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

      <Suspense fallback={<Skeleton className="h-[500px] w-[500px]" />}>
        <ProductFormDialog
          open={formDialogOpen}
          onOpenChange={handleFormClose}
          onSuccess={handleFormSuccess}
          product={editingProduct}
        />
      </Suspense>
    </div>
  )
}
