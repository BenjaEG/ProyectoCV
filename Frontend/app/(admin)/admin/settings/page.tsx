'use client'

import { useEffect, useMemo, useState } from 'react'
import { DashboardHeader } from '@/components/dashboard/dashboard-header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { FieldGroup, Field, FieldLabel } from '@/components/ui/field'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { USER_ROLES, type InstitutionSettings } from '@/lib/types'
import { useAuth } from '@/hooks/use-auth'
import {
  fetchAdminInstitutionSettings,
  mapRoleNamesToUserRole,
  updateAdminInstitutionSettings,
} from '@/lib/api'
import { toast } from 'sonner'

const defaultInstitutionSettings: InstitutionSettings = {
  id: '1',
  nombreCentroVecinal: '',
  descripcionHome: '',
  descripcionContacto: '',
  mostrarTelefono: true,
  telefono: '',
  mostrarEmail: true,
  email: '',
  mostrarDireccion: true,
  direccion: '',
  mostrarHorarioAtencion: true,
  horarioAtencion: '',
}

export default function AdminSettingsPage() {
  const { username, email, roles, manageAccount, changePassword, token, initialized } = useAuth()
  const displayName = username ?? 'Administrador'
  const displayEmail = email ?? 'Sin email disponible'
  const [settings, setSettings] = useState<InstitutionSettings>(defaultInstitutionSettings)
  const [loadingSettings, setLoadingSettings] = useState(true)
  const [savingSettings, setSavingSettings] = useState(false)

  const getInitials = (name: string) =>
    name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)

  const role = mapRoleNamesToUserRole(roles)
  const roleLabel = USER_ROLES.find((candidate) => candidate.value === role)?.label ?? role

  useEffect(() => {
    if (!initialized || !token) {
      return
    }

    let cancelled = false

    async function loadSettings() {
      try {
        setLoadingSettings(true)
        const response = await fetchAdminInstitutionSettings(token)
        if (!cancelled) {
          setSettings(response)
        }
      } catch (error) {
        if (!cancelled) {
          toast.error(error instanceof Error ? error.message : 'No se pudo cargar la configuración institucional')
        }
      } finally {
        if (!cancelled) {
          setLoadingSettings(false)
        }
      }
    }

    void loadSettings()

    return () => {
      cancelled = true
    }
  }, [initialized, token])

  const fullCenterName = useMemo(() => {
    return settings.nombreCentroVecinal.trim()
      ? `Centro Vecinal ${settings.nombreCentroVecinal.trim()}`
      : 'Centro Vecinal'
  }, [settings.nombreCentroVecinal])

  const mapUrl = useMemo(() => {
    if (!settings.direccion?.trim()) {
      return null
    }

    return `https://www.google.com/maps?q=${encodeURIComponent(settings.direccion.trim())}&output=embed`
  }, [settings.direccion])

  const updateField = <K extends keyof InstitutionSettings>(field: K, value: InstitutionSettings[K]) => {
    setSettings((current) => ({ ...current, [field]: value }))
  }

  const handleSaveInstitutionalSettings = async () => {
    if (!token) {
      toast.error('Sesion no disponible')
      return
    }

    if (!settings.nombreCentroVecinal.trim() || !settings.descripcionHome.trim() || !settings.descripcionContacto.trim()) {
      toast.error('Completa el nombre del centro vecinal y las descripciones obligatorias')
      return
    }

    try {
      setSavingSettings(true)
      const updated = await updateAdminInstitutionSettings(token, {
        nombreCentroVecinal: settings.nombreCentroVecinal,
        descripcionHome: settings.descripcionHome,
        descripcionContacto: settings.descripcionContacto,
        mostrarTelefono: settings.mostrarTelefono,
        telefono: settings.telefono,
        mostrarEmail: settings.mostrarEmail,
        email: settings.email,
        mostrarDireccion: settings.mostrarDireccion,
        direccion: settings.direccion,
        mostrarHorarioAtencion: settings.mostrarHorarioAtencion,
        horarioAtencion: settings.horarioAtencion,
      })
      setSettings(updated)
      toast.success('Configuración institucional actualizada')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'No se pudo guardar la configuración institucional')
    } finally {
      setSavingSettings(false)
    }
  }

  return (
    <>
      <DashboardHeader title="Configuración" description="Configuración institucional y cuenta de administrador" />
      <main className="flex-1 p-4 md:p-6">
        <div className="grid gap-6 xl:grid-cols-3">
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

          <Card className="border-border bg-card xl:col-span-2">
            <CardHeader>
              <CardTitle className="text-foreground">Cuenta de administrador</CardTitle>
              <CardDescription className="text-muted-foreground">
                La identidad, credenciales y opciones de seguridad se administran desde Keycloak.
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
                  Desde la cuenta de Keycloak puedes cambiar contraseña, revisar sesiones activas y actualizar los datos básicos del usuario.
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

          <Card className="border-border bg-card xl:col-span-2">
            <CardHeader>
              <CardTitle className="text-foreground">Identidad pública del Centro Vecinal</CardTitle>
              <CardDescription className="text-muted-foreground">
                Personaliza cómo se muestra el Centro Vecinal en el home público, la sección de contacto y el mapa.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="nombre-centro">Nombre del Centro Vecinal</FieldLabel>
                  <Input
                    id="nombre-centro"
                    value={settings.nombreCentroVecinal}
                    onChange={(event) => updateField('nombreCentroVecinal', event.target.value)}
                    placeholder="Ej.: Barrio Inaudi"
                    className="border-border"
                    disabled={loadingSettings || savingSettings}
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="descripcion-home">Texto principal del home</FieldLabel>
                  <Textarea
                    id="descripcion-home"
                    value={settings.descripcionHome}
                    onChange={(event) => updateField('descripcionHome', event.target.value)}
                    placeholder="Describe brevemente el propósito del Centro Vecinal"
                    className="min-h-28 border-border"
                    disabled={loadingSettings || savingSettings}
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="descripcion-contacto">Texto de la sección Contacto</FieldLabel>
                  <Textarea
                    id="descripcion-contacto"
                    value={settings.descripcionContacto}
                    onChange={(event) => updateField('descripcionContacto', event.target.value)}
                    placeholder="Indica qué tipo de consultas pueden realizarse"
                    className="min-h-24 border-border"
                    disabled={loadingSettings || savingSettings}
                  />
                </Field>

                <Separator className="my-2" />

                <div className="grid gap-5 md:grid-cols-2">
                  <div className="space-y-3 rounded-lg border border-border p-4">
                    <div className="flex items-center justify-between gap-4">
                      <Label htmlFor="mostrar-telefono" className="text-sm font-medium text-foreground">
                        Mostrar teléfono
                      </Label>
                      <Switch
                        id="mostrar-telefono"
                        checked={settings.mostrarTelefono}
                        onCheckedChange={(checked) => updateField('mostrarTelefono', checked)}
                        disabled={loadingSettings || savingSettings}
                      />
                    </div>
                    <Input
                      value={settings.telefono ?? ''}
                      onChange={(event) => updateField('telefono', event.target.value)}
                      placeholder="+54 351..."
                      className="border-border"
                      disabled={loadingSettings || savingSettings}
                    />
                  </div>

                  <div className="space-y-3 rounded-lg border border-border p-4">
                    <div className="flex items-center justify-between gap-4">
                      <Label htmlFor="mostrar-email" className="text-sm font-medium text-foreground">
                        Mostrar email
                      </Label>
                      <Switch
                        id="mostrar-email"
                        checked={settings.mostrarEmail}
                        onCheckedChange={(checked) => updateField('mostrarEmail', checked)}
                        disabled={loadingSettings || savingSettings}
                      />
                    </div>
                    <Input
                      value={settings.email ?? ''}
                      onChange={(event) => updateField('email', event.target.value)}
                      placeholder="contacto@centrovecinal.org"
                      className="border-border"
                      disabled={loadingSettings || savingSettings}
                    />
                  </div>

                  <div className="space-y-3 rounded-lg border border-border p-4">
                    <div className="flex items-center justify-between gap-4">
                      <Label htmlFor="mostrar-direccion" className="text-sm font-medium text-foreground">
                        Mostrar dirección
                      </Label>
                      <Switch
                        id="mostrar-direccion"
                        checked={settings.mostrarDireccion}
                        onCheckedChange={(checked) => updateField('mostrarDireccion', checked)}
                        disabled={loadingSettings || savingSettings}
                      />
                    </div>
                    <Textarea
                      value={settings.direccion ?? ''}
                      onChange={(event) => updateField('direccion', event.target.value)}
                      placeholder="Dirección completa del Centro Vecinal"
                      className="min-h-24 border-border"
                      disabled={loadingSettings || savingSettings}
                    />
                    <p className="text-xs text-muted-foreground">
                      El mapa público se genera automáticamente usando esta dirección en Google Maps.
                    </p>
                  </div>

                  <div className="space-y-3 rounded-lg border border-border p-4">
                    <div className="flex items-center justify-between gap-4">
                      <Label htmlFor="mostrar-horario" className="text-sm font-medium text-foreground">
                        Mostrar horario de atención
                      </Label>
                      <Switch
                        id="mostrar-horario"
                        checked={settings.mostrarHorarioAtencion}
                        onCheckedChange={(checked) => updateField('mostrarHorarioAtencion', checked)}
                        disabled={loadingSettings || savingSettings}
                      />
                    </div>
                    <Input
                      value={settings.horarioAtencion ?? ''}
                      onChange={(event) => updateField('horarioAtencion', event.target.value)}
                      placeholder="Lunes a Viernes: 9:00 - 18:00"
                      className="border-border"
                      disabled={loadingSettings || savingSettings}
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={() => void handleSaveInstitutionalSettings()} disabled={loadingSettings || savingSettings}>
                    {savingSettings ? 'Guardando...' : 'Guardar configuración institucional'}
                  </Button>
                </div>
              </FieldGroup>
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-foreground">Vista previa</CardTitle>
              <CardDescription className="text-muted-foreground">
                Así se verá el bloque institucional en el sitio público.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg border border-border bg-background p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-primary">Home</p>
                <h3 className="mt-2 text-xl font-semibold tracking-tight text-foreground">{fullCenterName}</h3>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  {settings.descripcionHome || 'Sin descripción configurada'}
                </p>
              </div>

              <div className="rounded-lg border border-border bg-background p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-primary">Contacto</p>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  {settings.descripcionContacto || 'Sin descripción configurada'}
                </p>
                <div className="mt-4 space-y-2 text-sm text-foreground">
                  {settings.mostrarTelefono && settings.telefono && <p>Teléfono: {settings.telefono}</p>}
                  {settings.mostrarEmail && settings.email && <p>Email: {settings.email}</p>}
                  {settings.mostrarDireccion && settings.direccion && <p>Dirección: {settings.direccion}</p>}
                  {settings.mostrarHorarioAtencion && settings.horarioAtencion && <p>Horario: {settings.horarioAtencion}</p>}
                </div>
              </div>

              <div className="rounded-lg border border-border bg-background p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-primary">Mapa</p>
                <div className="mt-3 overflow-hidden rounded-lg border border-border">
                  {mapUrl ? (
                    <iframe
                      title="Vista previa del mapa"
                      src={mapUrl}
                      className="h-56 w-full"
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    />
                  ) : (
                    <div className="flex h-56 items-center justify-center bg-secondary px-4 text-center text-sm text-muted-foreground">
                      Carga una dirección para ver la vista previa del mapa de Google Maps.
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  )
}
