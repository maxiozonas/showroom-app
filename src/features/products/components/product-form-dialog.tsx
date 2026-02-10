'use client'

import { useState, useTransition, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { createProductSchema, updateProductSchema, type CreateProductInput, type UpdateProductInput } from '../schemas/product.schema'
import { toast } from 'sonner'
import type { Product } from '../types'
import { useSaveProduct } from '../hooks/useProducts'
import { useAllCategories } from '@/src/features/categories/hooks/useCategories'

interface ProductFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
  product?: Product | null
  initialData?: CreateProductInput | null
}

export function ProductFormDialog({
  open,
  onOpenChange,
  onSuccess,
  product,
  initialData,
}: ProductFormDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const isEditing = !!product
  const { data: categories, isLoading: categoriesLoading } = useAllCategories()

  // Schema dinámico que funciona para ambos casos
  const productFormSchema = z.object({
    sku: z.string().min(1, 'SKU es requerido').optional(),
    name: z.string().min(1, 'Nombre es requerido').optional(),
    brand: z.string().nullable().optional(),
    urlKey: z.string().nullable().optional(),
    enabled: z.boolean().optional(),
    categoryId: z.number().nullable().optional(),
  }).refine(
    (data) => {
      // Si es creación, sku y name son requeridos
      if (!isEditing) {
        return !!data.sku && !!data.name && data.sku.trim() !== '' && data.name.trim() !== ''
      }
      return true
    },
    {
      message: 'SKU y Nombre son requeridos para crear un producto',
      path: isEditing ? [] : ['submit'],
    }
  )

  const form = useForm<CreateProductInput | UpdateProductInput>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      sku: '',
      name: '',
      brand: '',
      urlKey: '',
      enabled: true,
      categoryId: null,
    },
    mode: 'onSubmit',
  })

  // Resetear formulario cuando cambia el producto (creación -> edición o viceversa)
  useEffect(() => {
    if (open) {
      if (initialData) {
        form.reset({
          sku: initialData.sku,
          name: initialData.name,
          brand: initialData.brand || '',
          urlKey: initialData.urlKey || '',
          enabled: initialData.enabled,
          categoryId: initialData.categoryId || null,
        })
      } else if (product) {
        form.reset({
          sku: product.sku,
          name: product.name,
          brand: product.brand || '',
          urlKey: product.urlKey || '',
          enabled: product.enabled,
          categoryId: product.categoryId || null,
        })
      } else {
        form.reset({
          sku: '',
          name: '',
          brand: '',
          urlKey: '',
          enabled: true,
          categoryId: null,
        })
      }
    }
  }, [product, initialData, open, form])

  // Limpiar errores cuando cambia entre modo crear/editar
  useEffect(() => {
    form.clearErrors()
  }, [isEditing, form])

  const handleOpenChange = (newOpen: boolean) => {
    onOpenChange(newOpen)
  }

  const [isPending, startTransition] = useTransition()
  const saveMutation = useSaveProduct()

  const onSubmit = (data: CreateProductInput | UpdateProductInput) => {
    startTransition(async () => {
      try {
        // Si es edición, enviar solo los campos modificados (no undefined)
        const dataToSend = isEditing
          ? Object.fromEntries(
              Object.entries(data).filter(([_, v]) => v !== undefined)
            )
          : data

        await saveMutation.mutateAsync({
          id: product?.id,
          data: dataToSend
        })

        toast.success(product ? '✅ Producto actualizado exitosamente' : '✅ Producto creado exitosamente')
        form.reset()
        onOpenChange(false)
        onSuccess()
      } catch (error: any) {
        toast.error(`❌ ${error.message}`)
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {initialData
              ? 'Importar Producto desde Magento'
              : isEditing
              ? 'Editar Producto'
              : 'Crear Producto'}
          </DialogTitle>
          <DialogDescription>
            {initialData
              ? 'Revisa y ajusta los datos del producto importado'
              : isEditing
              ? 'Modifica los datos del producto'
              : 'Completa los datos del nuevo producto'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="sku"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>SKU</FormLabel>
                  <FormControl>
                    <Input placeholder="ABC-123" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre</FormLabel>
                  <FormControl>
                    <Input placeholder="Nombre del producto" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoría</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(value ? parseInt(value) : null)}
                    value={field.value?.toString() || ''}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar categoría" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categoriesLoading ? (
                        <div className="px-2 py-1 text-sm text-muted-foreground">Cargando categorías...</div>
                      ) : categories && categories.length > 0 ? (
                        categories.map((cat: any) => (
                          <SelectItem key={cat.id} value={cat.id.toString()}>
                            {cat.name}
                          </SelectItem>
                        ))
                      ) : (
                        <div className="px-2 py-1 text-sm text-muted-foreground">No hay categorías disponibles</div>
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="brand"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Marca (opcional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Marca del producto"
                      {...field}
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="urlKey"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL Key (opcional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="url-del-producto"
                      {...field}
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="enabled"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Habilitado</FormLabel>
                    <div className="text-sm text-muted-foreground">
                      El producto estará visible en el showroom
                    </div>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isPending}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending
                  ? 'Guardando...'
                  : initialData
                  ? 'Importar'
                  : isEditing
                  ? 'Actualizar'
                  : 'Crear'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
