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
import { createCategorySchema, type CreateCategoryInput } from '../schemas/category.schema'
import { toast } from 'sonner'

interface Category {
  id: number
  name: string
  slug: string
}

interface CategoryFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
  category?: Category | null
}

export function CategoryFormDialog({
  open,
  onOpenChange,
  onSuccess,
  category,
}: CategoryFormDialogProps) {
  const isEditing = !!category

  const form = useForm<CreateCategoryInput>({
    resolver: zodResolver(createCategorySchema),
    defaultValues: {
      name: '',
      slug: '',
    },
  })

  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen) {
      if (category) {
        form.reset({
          name: category.name,
          slug: category.slug,
        })
      } else {
        form.reset({
          name: '',
          slug: '',
        })
      }
    } else {
      form.reset({
        name: '',
        slug: '',
      })
    }

    onOpenChange(newOpen)
  }

  const [isPending, startTransition] = useTransition()

  const onSubmit = (data: CreateCategoryInput) => {
    startTransition(async () => {
      try {
        const url = category ? `/api/categories/${category.id}` : '/api/categories'
        const method = category ? 'PUT' : 'POST'

        const response = await fetch(url, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || 'Error al guardar categoría')
        }

        toast.success(category ? '✅ Categoría actualizada exitosamente' : '✅ Categoría creada exitosamente')
        form.reset()
        onOpenChange(false)
        onSuccess()
      } catch (error: any) {
        toast.error(`❌ ${error.message}`)
      }
    })
  }

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Editar Categoría' : 'Crear Categoría'}
          </DialogTitle>
          <DialogDescription>
            {isEditing ? 'Modifica los datos de la categoría' : 'Completa los datos de la nueva categoría'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Nombre de la categoría"
                      {...field}
                      onChange={(e) => {
                        field.onChange(e)
                        if (!isEditing) {
                          form.setValue('slug', generateSlug(e.target.value))
                        }
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Slug</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="url-de-la-categoria"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
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
                {isPending ? 'Guardando...' : isEditing ? 'Actualizar' : 'Crear'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
