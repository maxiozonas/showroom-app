'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Package, Upload, History, ChevronLeft, ChevronRight, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

const navigation = [
  {
    name: 'Productos',
    href: '/products',
    icon: Package,
  },
  {
    name: 'Importar CSV',
    href: '/import',
    icon: Upload,
  },
  {
    name: 'Historial QR',
    href: '/history',
    icon: History,
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      toast.success('Sesión cerrada')
      router.push('/login')
      router.refresh()
    } catch (error) {
      toast.error('Error al cerrar sesión')
    } finally {
      setIsLoggingOut(false)
    }
  }

  return (
    <div className={cn(
      "relative flex h-screen flex-col bg-[#DC2626] text-white transition-all duration-300 group",
      isCollapsed ? "w-20" : "w-64"
    )}>
      {/* Logo */}
      <div className="flex h-16 items-center justify-center border-b border-red-700 px-4">
        <div className={cn(
          "relative transition-all duration-300",
          isCollapsed ? "h-8 w-8" : "h-12 w-full max-w-[200px]"
        )}>
          <Image
            src="/gili-logo.png"
            alt="Gili Logo"
            fill
            className="object-contain"
            priority
          />
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')
          return (
            <Link
              key={item.name}
              href={item.href}
              title={isCollapsed ? item.name : undefined}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-white text-[#DC2626]'
                  : 'text-white hover:bg-red-700',
                isCollapsed && 'justify-center'
              )}
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              {!isCollapsed && <span>{item.name}</span>}
            </Link>
          )
        })}
      </nav>

      {/* Toggle Button - On right border, centered vertically, visible on hover */}
      <div className="absolute top-1/2 -translate-y-1/2 -right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="h-6 w-6 rounded-full bg-red-700 hover:bg-red-800 text-white shadow-lg border border-red-600"
          title={isCollapsed ? 'Expandir sidebar' : 'Colapsar sidebar'}
        >
          {isCollapsed ? (
            <ChevronRight className="h-3 w-3" />
          ) : (
            <ChevronLeft className="h-3 w-3" />
          )}
        </Button>
      </div>

      {/* Footer with Logout */}
      <div className="border-t border-red-700 p-3">
        <Button
          variant="ghost"
          onClick={handleLogout}
          disabled={isLoggingOut}
          className={cn(
            "w-full text-white hover:bg-red-700 hover:text-white",
            isCollapsed ? "justify-center px-2" : "justify-start"
          )}
          title={isCollapsed ? 'Cerrar sesión' : undefined}
        >
          <LogOut className="h-5 w-5 flex-shrink-0" />
          {!isCollapsed && <span className="ml-3">Cerrar sesión</span>}
        </Button>
        {!isCollapsed && (
          <p className="text-xs text-red-200 mt-2 text-center">Gili Showroom v1.0</p>
        )}
      </div>
    </div>
  )
}
