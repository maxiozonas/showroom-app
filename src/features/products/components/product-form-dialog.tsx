'use client'

import { useState, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
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
import { createProductSchema, updateProductSchema, type CreateProductInput } from '../schemas/product.schema'
import { toast } from 'sonner'
import type { Product } from '../types'
import { useSaveProduct } from '../hooks/useProducts'

interface ProductFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
  product?: Product | null // Para edición
  initialData?: CreateProductInput | null // Datos iniciales para importación
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

  const form = useForm<CreateProductInput>({
    resolver: zodResolver(createProductSchema),
    defaultValues: {
      sku: '',
      name: '',
      brand: '',
      urlKey: '',
      enabled: true,
    },
  })

  // Actualizar valores del formulario y resetear cuando cambia open/product/initialData (apply rerender-move-effect-to-event)
  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen) {
      // Resetear al abrir con valores predeterminados o datos de importación
      if (initialData) {
        form.reset({
          sku: initialData.sku,
          name: initialData.name,
          brand: initialData.brand || '',
          urlKey: initialData.urlKey || '',
          enabled: initialData.enabled,
        })
      } else if (product) {
        form.reset({
          sku: product.sku,
          name: product.name,
          brand: product.brand || '',
          urlKey: product.urlKey || '',
          enabled: product.enabled,
        })
      } else {
        form.reset({
          sku: '',
          name: '',
          brand: '',
          urlKey: '',
          enabled: true,
        })
      }
    } else {
      // Resetear al cerrar
      form.reset({
        sku: '',
        name: '',
        brand: '',
        urlKey: '',
        enabled: true,
      })
    }

    onOpenChange(newOpen)
  }

  const [isPending, startTransition] = useTransition()
  const saveMutation = useSaveProduct()

  const onSubmit = (data: CreateProductInput) => {
    startTransition(async () => {
      try {
        await saveMutation.mutateAsync({ 
          id: product?.id, 
          data 
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
