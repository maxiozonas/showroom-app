import { CategoriesTable } from '@/src/features/categories/components'

export default function CategoriesPage() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Categorías</h1>
        <p className="text-muted-foreground mt-2">
          Gestiona las categorías de productos
        </p>
      </div>

      <CategoriesTable />
    </div>
  )
}
