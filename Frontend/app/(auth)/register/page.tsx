'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { Loader2, MapPinned } from 'lucide-react'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/hooks/use-auth'

export default function RegisterPage() {
  const { initialized, isAuthenticated, register } = useAuth()
  const hasTriggeredRegisterRef = useRef(false)

  useEffect(() => {
    if (!initialized || isAuthenticated || hasTriggeredRegisterRef.current) {
      return
    }

    hasTriggeredRegisterRef.current = true
    void register('/dashboard')
  }, [initialized, isAuthenticated, register])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md bg-card border-border">
        <CardHeader className="text-center">
          <Link href="/" className="flex items-center justify-center gap-2 mb-4">
            <MapPinned className="h-10 w-10 text-primary" />
          </Link>
          <CardTitle className="text-2xl text-foreground">Redirigiendo</CardTitle>
          <CardDescription className="text-muted-foreground">
            Te estamos enviando al registro seguro de Keycloak.
          </CardDescription>
          <div className="mt-6 flex justify-center">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
          </div>
        </CardHeader>
      </Card>
    </div>
  )
}
