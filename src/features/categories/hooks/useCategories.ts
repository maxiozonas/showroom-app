'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import type { CategoryQuery } from '../schemas/category.schema'

async function fetchCategories(query: CategoryQuery) {
  const params = new URLSearchParams()
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined) {
      params.append(key, String(value))
    }
  })

  const response = await fetch(`/api/categories?${params}`)
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Error al obtener categorías')
  }

  return response.json()
}

async function fetchCategoryById(id: number) {
  const response = await fetch(`/api/categories/${id}`)
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Error al obtener categoría')
  }

  return response.json()
}

async function createCategory(data: { name: string; slug: string }) {
  const response = await fetch('/api/categories', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Error al crear categoría')
  }

  return response.json()
}

async function updateCategory(id: number, data: { name?: string; slug?: string }) {
  const response = await fetch(`/api/categories/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Error al actualizar categoría')
  }

  return response.json()
}

async function deleteCategory(id: number) {
  const response = await fetch(`/api/categories/${id}`, {
    method: 'DELETE',
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Error al eliminar categoría')
  }

  return response.json()
}

async function fetchAllCategories() {
  const response = await fetch('/api/categories?all=true')
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Error al obtener categorías')
  }

  return response.json()
}

export function useCategories(query: CategoryQuery) {
  return useQuery({
    queryKey: ['categories', query],
    queryFn: () => fetchCategories(query),
    staleTime: 5 * 60 * 1000,
  })
}

export function useCategoryById(id: number) {
  return useQuery({
    queryKey: ['category', id],
    queryFn: () => fetchCategoryById(id),
    enabled: !!id,
  })
}

export function useAllCategories() {
  return useQuery({
    queryKey: ['categories', 'all'],
    queryFn: fetchAllCategories,
    staleTime: 10 * 60 * 1000,
  })
}

export function useCreateCategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      toast.success('✅ Categoría creada exitosamente')
    },
    onError: (error: Error) => {
      toast.error(`❌ ${error.message}`)
    },
  })
}

export function useUpdateCategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: { name?: string; slug?: string } }) =>
      updateCategory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      toast.success('✅ Categoría actualizada exitosamente')
    },
    onError: (error: Error) => {
      toast.error(`❌ ${error.message}`)
    },
  })
}

export function useDeleteCategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      toast.success('✅ Categoría eliminada exitosamente')
    },
    onError: (error: Error) => {
      toast.error(`❌ ${error.message}`)
    },
  })
}
