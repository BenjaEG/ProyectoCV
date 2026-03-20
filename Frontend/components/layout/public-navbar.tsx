'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet'
import { LogOut, MapPinned, Menu } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'

const navLinks = [
  { href: '/', label: 'Inicio' },
  { href: '/noticias', label: 'Noticias' },
  { href: '/eventos', label: 'Eventos' },
  { href: '/#contacto', label: 'Contacto' },
]

export function PublicNavbar() {
  const [open, setOpen] = useState(false)
  const { isAuthenticated, hasRole, login, logout } = useAuth()

  const dashboardLink = hasRole('ROLE_ADMIN')
    ? { href: '/admin', label: 'Panel Admin' }
    : hasRole('ROLE_OPERADOR')
      ? { href: '/staff', label: 'Panel Operativo' }
      : { href: '/dashboard/tickets', label: 'Mi Vecino' }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-3">
          <MapPinned className="h-8 w-8 text-primary" />
          <span className="text-lg font-semibold tracking-tight text-foreground">Centro Vecinal</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-[15px] font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-4">
          {isAuthenticated ? (
            <>
              <Link href={dashboardLink.href}>
                <Button variant="ghost">{dashboardLink.label}</Button>
              </Link>
              <Button
                variant="ghost"
                size="sm"
                className="gap-2 text-muted-foreground hover:text-foreground"
                onClick={() => void logout()}
              >
                <LogOut className="h-4 w-4" />
                Cerrar sesion
              </Button>
            </>
          ) : (
            <Button variant="ghost" onClick={() => void login()}>
              Iniciar sesion
            </Button>
          )}
          <Link href="/dashboard/tickets/new">
            <Button>Crear Reclamo</Button>
          </Link>
        </div>

        {/* Mobile Navigation */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Abrir menú</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[300px] bg-card">
            <SheetTitle className="sr-only">Menú de navegación</SheetTitle>
            <nav className="flex flex-col gap-4 mt-8">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="text-lg font-medium text-foreground hover:text-primary transition-colors"
                >
                  {link.label}
                </Link>
              ))}
              <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-border">
                {isAuthenticated ? (
                  <>
                    <Link href={dashboardLink.href} onClick={() => setOpen(false)}>
                      <Button variant="outline" className="w-full">
                        {dashboardLink.label}
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-muted-foreground"
                      onClick={() => {
                        setOpen(false)
                        void logout()
                      }}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Cerrar sesion
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      setOpen(false)
                      void login()
                    }}
                  >
                    Iniciar sesion
                  </Button>
                )}
                <Link href="/dashboard/tickets/new" onClick={() => setOpen(false)}>
                  <Button className="w-full">Crear Reclamo</Button>
                </Link>
              </div>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
}
