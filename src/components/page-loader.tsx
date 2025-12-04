'use client'

import Image from 'next/image'
import { Loader2 } from 'lucide-react'

interface PageLoaderProps {
  message?: string
}

export function PageLoader({ message = 'Cargando...' }: PageLoaderProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[400px] gap-6 p-8">
      <div className="bg-[#DC2626] p-4 rounded-lg animate-pulse">
        <Image
          src="/gili-logo.png"
          alt="Gili Logo"
          width={100}
          height={52}
          priority
        />
      </div>
      <div className="flex items-center gap-2 text-gray-500">
        <Loader2 className="h-5 w-5 animate-spin" />
        <span>{message}</span>
      </div>
    </div>
  )
}
