'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { FileText, LogIn } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'

export function HeroSection() {
  const { isAuthenticated, hasRole, login } = useAuth()

  const dashboardLink = hasRole('ROLE_ADMIN')
    ? { href: '/admin', label: 'Ir al panel admin' }
    : hasRole('ROLE_OPERADOR')
      ? { href: '/staff', label: 'Ir al panel operativo' }
      : { href: '/dashboard/tickets', label: 'Mi Vecino' }

  return (
    <section className="relative py-20 md:py-32 overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent" />
      
      <div className="container mx-auto px-4 relative">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-foreground mb-8">
            Centro Vecinal Barrio Inaudi
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-10 text-pretty max-w-2xl mx-auto">
            Portal comunitario para reclamos, noticias y comunicación vecinal. 
            Trabajamos juntos por un barrio mejor.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/dashboard/tickets/new">
              <Button size="lg" className="w-full sm:w-auto gap-2">
                <FileText className="h-5 w-5" />
                Crear Reclamo
              </Button>
            </Link>
            {isAuthenticated ? (
              <Link href={dashboardLink.href}>
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto gap-2"
                >
                  <LogIn className="h-5 w-5" />
                  {dashboardLink.label}
                </Button>
              </Link>
            ) : (
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto gap-2"
                onClick={() => void login()}
              >
                <LogIn className="h-5 w-5" />
                Iniciar sesion
              </Button>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
