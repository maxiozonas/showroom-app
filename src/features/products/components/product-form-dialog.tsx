'use client'

import { useState, useEffect } from 'react'
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
import { createProductSchema, updateProductSchema, type CreateProductInput, type UpdateProductInput } from '../schemas/product.schema'
import { toast } from 'sonner'

interface ProductFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
  product?: any // Para edición
}

export function ProductFormDialog({
  open,
  onOpenChange,
  onSuccess,
  product,
}: ProductFormDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const isEditing = !!product

  const form = useForm<CreateProductInput>({
    resolver: zodResolver(createProductSchema),
    defaultValues: {
      sku: '',
      name: '',
      brand: '',
      enabled: true,
    },
  })

  // Actualizar valores del formulario cuando cambia el producto
  useEffect(() => {
    if (open) {
      if (product) {
        form.reset({
          sku: product.sku || '',
          name: product.name || '',
          brand: product.brand || '',
          enabled: product.enabled ?? true,
        })
      } else {
        form.reset({
          sku: '',
          name: '',
          brand: '',
          enabled: true,
        })
      }
    }
  }, [open, product, form])

  const onSubmit = async (data: CreateProductInput) => {
    setIsLoading(true)
    try {
      const url = isEditing ? `/api/products/${product.id}` : '/api/products'
      const method = isEditing ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Error al guardar producto')
      }

      toast.success(isEditing ? '✅ Producto actualizado exitosamente' : '✅ Producto creado exitosamente')
      form.reset()
      onOpenChange(false)
      onSuccess()
    } catch (error: any) {
      toast.error(`❌ ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Editar Producto' : 'Crear Producto'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
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
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Guardando...' : isEditing ? 'Actualizar' : 'Crear'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
