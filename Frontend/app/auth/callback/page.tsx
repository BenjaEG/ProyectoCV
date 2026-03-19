'use client'

import { Suspense, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Loader2, MapPinned } from 'lucide-react'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/hooks/use-auth'

function AuthCallbackPageContent() {
  const { initialized, isAuthenticated } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (!initialized) {
      return
    }

    if (!isAuthenticated) {
      router.replace('/login')
      return
    }

    const next = searchParams.get('next')

    if (next) {
      router.replace(next)
      return
    }

    router.replace('/')
  }, [initialized, isAuthenticated, router, searchParams])

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md bg-card border-border">
        <CardHeader className="text-center">
          <div className="mb-4 flex justify-center">
            <MapPinned className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="text-2xl text-foreground">Procesando acceso</CardTitle>
          <CardDescription className="text-muted-foreground">
            Estamos finalizando tu sesion y redirigiendote.
          </CardDescription>
          <div className="mt-6 flex justify-center">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
          </div>
        </CardHeader>
      </Card>
    </div>
  )
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background p-4">
          <Card className="w-full max-w-md bg-card border-border">
            <CardHeader className="text-center">
              <div className="mb-4 flex justify-center">
                <MapPinned className="h-10 w-10 text-primary" />
              </div>
              <CardTitle className="text-2xl text-foreground">Procesando acceso</CardTitle>
              <CardDescription className="text-muted-foreground">
                Estamos finalizando tu sesion y redirigiendote.
              </CardDescription>
              <div className="mt-6 flex justify-center">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
              </div>
            </CardHeader>
          </Card>
        </div>
      }
    >
      <AuthCallbackPageContent />
    </Suspense>
  )
}
