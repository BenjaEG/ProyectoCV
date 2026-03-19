'use client'

import { DashboardHeader } from '@/components/dashboard/dashboard-header'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { FieldGroup, Field, FieldLabel } from '@/components/ui/field'
import { USER_ROLES } from '@/lib/types'
import { useAuth } from '@/hooks/use-auth'
import { mapRoleNamesToUserRole } from '@/lib/api'

export default function StaffProfilePage() {
  const { username, email, roles, manageAccount, changePassword } = useAuth()
  const displayName = username ?? 'Operador'
  const displayEmail = email ?? 'Sin email disponible'

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const role = mapRoleNamesToUserRole(roles)
  const roleLabel = USER_ROLES.find((candidate) => candidate.value === role)?.label ?? role

  return (
    <>
      <DashboardHeader title="Mi Perfil" description="Administra tu información personal" />
      <main className="flex-1 p-4 md:p-6">
        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="border-border bg-card">
            <CardContent className="flex flex-col items-center pt-6">
              <Avatar className="mb-4 h-24 w-24">
                <AvatarFallback className="bg-primary text-2xl text-primary-foreground">
                  {getInitials(displayName)}
                </AvatarFallback>
              </Avatar>
              <h2 className="text-xl font-semibold text-foreground">{displayName}</h2>
              <p className="text-muted-foreground">{displayEmail}</p>
              <div className="mt-2 rounded-full bg-primary/20 px-3 py-1 text-sm text-primary">
                {roleLabel}
              </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-card lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-foreground">Perfil actual</CardTitle>
              <CardDescription className="text-muted-foreground">
                Los datos personales, la contraseña y la seguridad de la cuenta se gestionan desde Keycloak.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="name">Nombre de usuario</FieldLabel>
                  <Input
                    id="name"
                    value={displayName}
                    readOnly
                    className="border-border bg-secondary"
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="email">Email</FieldLabel>
                  <Input
                    id="email"
                    type="email"
                    value={displayEmail}
                    readOnly
                    className="border-border bg-secondary"
                  />
                </Field>
                <p className="text-sm text-muted-foreground">
                  Usa la consola de cuenta para cambiar contraseña, revisar sesiones activas y actualizar tus datos básicos.
                </p>
                <div className="flex flex-wrap justify-end gap-3">
                  <Button variant="outline" onClick={() => void changePassword()}>
                    Cambiar contraseña
                  </Button>
                  <Button onClick={() => void manageAccount()}>
                    Gestionar cuenta
                  </Button>
                </div>
              </FieldGroup>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  )
}
