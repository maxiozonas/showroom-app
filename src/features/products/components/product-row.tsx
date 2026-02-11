'use client'

import { memo } from 'react'
import { TableCell, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Pencil, Trash2, QrCode } from 'lucide-react'
import type { Product } from '../types'

export interface ProductRowProps {
  product: Product
  onEdit: (product: Product) => void
  onDelete: (id: number) => void
  onGenerateQR?: (product: Product) => void
  selected?: boolean
  onToggleSelect?: (productId: number) => void
  canSelect?: boolean
}

function ProductRow({
  product,
  onEdit,
  onDelete,
  onGenerateQR,
  selected = false,
  onToggleSelect,
  canSelect = false,
}: ProductRowProps) {
  return (
    <TableRow>
      {canSelect && onToggleSelect && (
        <TableCell>
          <Checkbox
            checked={selected}
            onCheckedChange={() => onToggleSelect(product.id)}
            disabled={!product.urlKey}
            aria-label={`Seleccionar ${product.sku}`}
          />
        </TableCell>
      )}
      <TableCell className="font-medium">{product.sku}</TableCell>
      <TableCell>{product.name}</TableCell>
      <TableCell>
        {product.category ? (
          <Badge variant="outline">{product.category.name}</Badge>
        ) : (
          <span className="text-muted-foreground text-sm">-</span>
        )}
      </TableCell>
      <TableCell>{product.brand || '-'}</TableCell>
      <TableCell>
        <div className="flex flex-col gap-1">
          <Badge variant={product.enabled ? 'default' : 'secondary'}>
            {product.enabled ? 'Habilitado' : 'Deshabilitado'}
          </Badge>
          <Badge variant={product.printed ? 'outline' : 'secondary'}>
            {product.printed ? 'Impreso' : 'Sin imprimir'}
          </Badge>
        </div>
      </TableCell>
      <TableCell>
        {new Date(product.createdAt).toLocaleDateString()}
      </TableCell>
      <TableCell className="text-right">
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(product)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDelete(product.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
          {onGenerateQR && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onGenerateQR(product)}
              title="Generar QR"
            >
              <QrCode className="h-4 w-4" />
            </Button>
          )}
        </div>
      </TableCell>
    </TableRow>
  )
}

export default memo(ProductRow)
