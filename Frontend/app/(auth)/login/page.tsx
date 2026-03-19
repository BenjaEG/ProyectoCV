'use client'

import { Suspense, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Loader2, MapPinned } from 'lucide-react'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/hooks/use-auth'

function LoginPageContent() {
  const { initialized, isAuthenticated, login } = useAuth()
  const searchParams = useSearchParams()
  const hasTriggeredLoginRef = useRef(false)

  useEffect(() => {
    if (!initialized || isAuthenticated || hasTriggeredLoginRef.current) {
      return
    }

    hasTriggeredLoginRef.current = true
    const next = searchParams.get('next')
    void login(next ?? undefined)
  }, [initialized, isAuthenticated, login, searchParams])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md bg-card border-border">
        <CardHeader className="text-center pb-6">
          <Link href="/" className="flex items-center justify-center gap-2 mb-6">
            <MapPinned className="h-10 w-10 text-primary" />
          </Link>
          <CardTitle className="text-2xl font-semibold tracking-tight text-foreground">Redirigiendo</CardTitle>
          <CardDescription className="mt-2 text-[15px] text-muted-foreground">
            Te estamos enviando al acceso seguro de Keycloak.
          </CardDescription>
          <div className="mt-6 flex justify-center">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
          </div>
        </CardHeader>
      </Card>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
          <Card className="w-full max-w-md bg-card border-border">
            <CardHeader className="text-center pb-6">
              <Link href="/" className="flex items-center justify-center gap-2 mb-6">
                <MapPinned className="h-10 w-10 text-primary" />
              </Link>
              <CardTitle className="text-2xl font-semibold tracking-tight text-foreground">Redirigiendo</CardTitle>
              <CardDescription className="mt-2 text-[15px] text-muted-foreground">
                Te estamos enviando al acceso seguro de Keycloak.
              </CardDescription>
              <div className="mt-6 flex justify-center">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
              </div>
            </CardHeader>
          </Card>
        </div>
      }
    >
      <LoginPageContent />
    </Suspense>
  )
}
