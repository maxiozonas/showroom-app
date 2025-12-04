'use client'

import { HistoryTable } from '@/src/features/history/components'

export default function HistoryPage() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Historial de QR</h1>
        <p className="text-muted-foreground mt-2">
          Todos los códigos QR generados para productos del showroom
        </p>
      </div>

      <HistoryTable />
    </div>
  )
}
