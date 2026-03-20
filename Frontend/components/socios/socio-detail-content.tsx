'use client'

import { useEffect, useMemo, useState } from 'react'
import { DashboardHeader } from '@/components/dashboard/dashboard-header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useAuth } from '@/hooks/use-auth'
import {
  anularCuotaSocio,
  createCuotaSocio,
  fetchCuotasSocioPage,
  fetchSocioById,
  fetchUserLookupPage,
  getReadableErrorMessage,
  pagarCuotaSocio,
  updateCuotaSocio,
  updateSocio,
  updateSocioEstado,
  updateSocioVinculoUsuario,
} from '@/lib/api'
import { CUOTA_ESTADOS, SOCIO_ESTADOS, SOCIO_TIPOS, type CuotaSocio, type Socio, type SocioEstado, type SocioTipo } from '@/lib/types'
import { AlertCircle, CalendarClock, CreditCard, Link2, Loader2, Pencil, ReceiptText, UserRound } from 'lucide-react'
import { toast } from 'sonner'

type Props = {
  section: 'admin' | 'staff'
  socioId: string
}

const socioTipoLabelMap = Object.fromEntries(SOCIO_TIPOS.map((tipo) => [tipo.value, tipo.label])) as Record<SocioTipo, string>
const socioEstadoLabelMap = Object.fromEntries(SOCIO_ESTADOS.map((estado) => [estado.value, estado.label])) as Record<SocioEstado, string>
const cuotaEstadoLabelMap = Object.fromEntries(CUOTA_ESTADOS.map((estado) => [estado.value, estado.label])) as Record<CuotaSocio['estadoPago'], string>

function socioEstadoBadgeClass(estado: SocioEstado): string {
  switch (estado) {
    case 'activo':
      return 'border-green-500/40 text-green-400'
    case 'baja':
      return 'border-gray-500/40 text-gray-300'
    case 'moroso':
      return 'border-amber-500/40 text-amber-400'
  }
}

function cuotaEstadoBadgeClass(estado: CuotaSocio['estadoPago']): string {
  switch (estado) {
    case 'pagada':
      return 'border-green-500/40 text-green-400'
    case 'anulada':
      return 'border-gray-500/40 text-gray-300'
    case 'vencida':
      return 'border-red-500/40 text-red-400'
    case 'pendiente':
      return 'border-blue-500/40 text-blue-400'
  }
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount)
}

export function SocioDetailContent({ section, socioId }: Props) {
  const { token, initialized } = useAuth()
  const [socio, setSocio] = useState<Socio | null>(null)
  const [cuotas, setCuotas] = useState<CuotaSocio[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [pageError, setPageError] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  const [isSavingSocio, setIsSavingSocio] = useState(false)
  const [isSavingCuota, setIsSavingCuota] = useState(false)
  const [isPayingCuota, setIsPayingCuota] = useState(false)
  const [isUpdatingEstado, setIsUpdatingEstado] = useState(false)
  const [isUpdatingVinculo, setIsUpdatingVinculo] = useState(false)

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isEstadoDialogOpen, setIsEstadoDialogOpen] = useState(false)
  const [isVinculoDialogOpen, setIsVinculoDialogOpen] = useState(false)
  const [isCuotaDialogOpen, setIsCuotaDialogOpen] = useState(false)
  const [isPagarDialogOpen, setIsPagarDialogOpen] = useState(false)

  const [editingCuota, setEditingCuota] = useState<CuotaSocio | null>(null)
  const [payingCuota, setPayingCuota] = useState<CuotaSocio | null>(null)

  const [formNombre, setFormNombre] = useState('')
  const [formApellido, setFormApellido] = useState('')
  const [formDni, setFormDni] = useState('')
  const [formDomicilio, setFormDomicilio] = useState('')
  const [formFechaAlta, setFormFechaAlta] = useState('')
  const [formTipo, setFormTipo] = useState<SocioTipo>('aportante')
  const [formObservaciones, setFormObservaciones] = useState('')

  const [estadoForm, setEstadoForm] = useState<SocioEstado>('activo')
  const [fechaBajaForm, setFechaBajaForm] = useState('')

  const [vinculoForm, setVinculoForm] = useState('')
  const [userSearch, setUserSearch] = useState('')
  const [userResults, setUserResults] = useState<Array<{ id: string; name: string; email: string; username?: string }>>([])
  const [isSearchingUsers, setIsSearchingUsers] = useState(false)

  const [cuotaPeriodo, setCuotaPeriodo] = useState('')
  const [cuotaMonto, setCuotaMonto] = useState('')
  const [cuotaFechaVencimiento, setCuotaFechaVencimiento] = useState('')
  const [cuotaTipoComprobante, setCuotaTipoComprobante] = useState('')
  const [cuotaNumeroComprobante, setCuotaNumeroComprobante] = useState('')
  const [cuotaMedioPago, setCuotaMedioPago] = useState('')
  const [cuotaObservacion, setCuotaObservacion] = useState('')

  const [pagoFecha, setPagoFecha] = useState(new Date().toISOString().split('T')[0])
  const [pagoTipoComprobante, setPagoTipoComprobante] = useState('')
  const [pagoNumeroComprobante, setPagoNumeroComprobante] = useState('')
  const [pagoMedioPago, setPagoMedioPago] = useState('')
  const [pagoObservacion, setPagoObservacion] = useState('')

  useEffect(() => {
    if (!initialized || !token) {
      return
    }

    let cancelled = false

    async function loadSocio() {
      try {
        setIsLoading(true)
        setPageError(null)
        const [nextSocio, cuotasPage] = await Promise.all([
          fetchSocioById(token, socioId),
          fetchCuotasSocioPage(token, socioId, 0, 50),
        ])

        if (cancelled) {
          return
        }

        setSocio(nextSocio)
        setCuotas(cuotasPage.content)
        hydrateSocioForm(nextSocio)
      } catch (error) {
        if (!cancelled) {
          const message = getReadableErrorMessage(error, 'No se pudo cargar el socio')
          setPageError(message)
          toast.error(message)
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    void loadSocio()

    return () => {
      cancelled = true
    }
  }, [initialized, refreshKey, socioId, token])

  useEffect(() => {
    if (!token || !isVinculoDialogOpen) {
      return
    }

    let cancelled = false

    async function loadUserResults() {
      try {
        setIsSearchingUsers(true)
        const page = await fetchUserLookupPage(token, userSearch, 0, 8)

        if (!cancelled) {
          setUserResults(
            page.content.map((user) => ({
              id: user.id,
              name: user.name,
              email: user.email,
              username: user.username,
            }))
          )
        }
      } catch (error) {
        if (!cancelled) {
          toast.error(getReadableErrorMessage(error, 'No se pudieron buscar usuarios'))
          setUserResults([])
        }
      } finally {
        if (!cancelled) {
          setIsSearchingUsers(false)
        }
      }
    }

    void loadUserResults()

    return () => {
      cancelled = true
    }
  }, [isVinculoDialogOpen, token, userSearch])

  function hydrateSocioForm(nextSocio: Socio) {
    setFormNombre(nextSocio.nombre)
    setFormApellido(nextSocio.apellido)
    setFormDni(nextSocio.dni)
    setFormDomicilio(nextSocio.domicilio)
    setFormFechaAlta(nextSocio.fechaAlta)
    setFormTipo(nextSocio.tipo)
    setFormObservaciones(nextSocio.observaciones ?? '')
    setEstadoForm(nextSocio.estado)
    setFechaBajaForm(nextSocio.fechaBaja ?? '')
    setVinculoForm(nextSocio.userId ?? '')
    setUserSearch('')
  }

  function resetCuotaForm(cuota?: CuotaSocio) {
    if (cuota) {
      setCuotaPeriodo(cuota.periodo)
      setCuotaMonto(String(cuota.monto))
      setCuotaFechaVencimiento(cuota.fechaVencimiento)
      setCuotaTipoComprobante(cuota.tipoComprobante ?? '')
      setCuotaNumeroComprobante(cuota.numeroComprobante ?? '')
      setCuotaMedioPago(cuota.medioPago ?? '')
      setCuotaObservacion(cuota.observacion ?? '')
      return
    }

    setCuotaPeriodo(new Date().toISOString().slice(0, 7))
    setCuotaMonto('')
    setCuotaFechaVencimiento(new Date().toISOString().split('T')[0])
    setCuotaTipoComprobante('')
    setCuotaNumeroComprobante('')
    setCuotaMedioPago('')
    setCuotaObservacion('')
  }

  function resetPagoForm(cuota?: CuotaSocio) {
    setPagoFecha(new Date().toISOString().split('T')[0])
    setPagoTipoComprobante(cuota?.tipoComprobante ?? '')
    setPagoNumeroComprobante(cuota?.numeroComprobante ?? '')
    setPagoMedioPago(cuota?.medioPago ?? '')
    setPagoObservacion(cuota?.observacion ?? '')
  }

  async function handleSocioSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!token || !socio) {
      return
    }

    setIsSavingSocio(true)
    try {
      const updated = await updateSocio(token, socio.id, {
        nombre: formNombre,
        apellido: formApellido,
        dni: formDni,
        domicilio: formDomicilio,
        fechaAlta: formFechaAlta,
        tipo: formTipo,
        observaciones: formObservaciones,
      })
      setSocio(updated)
      hydrateSocioForm(updated)
      setIsEditDialogOpen(false)
      setRefreshKey((current) => current + 1)
      toast.success('Socio actualizado correctamente')
    } catch (error) {
      toast.error(getReadableErrorMessage(error, 'No se pudo actualizar el socio'))
    } finally {
      setIsSavingSocio(false)
    }
  }

  async function handleEstadoSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!token || !socio) {
      return
    }

    setIsUpdatingEstado(true)
    try {
      const updated = await updateSocioEstado(token, socio.id, {
        estado: estadoForm,
        fechaBaja: estadoForm === 'baja' ? fechaBajaForm : undefined,
      })
      setSocio(updated)
      hydrateSocioForm(updated)
      setIsEstadoDialogOpen(false)
      toast.success('Estado actualizado correctamente')
    } catch (error) {
      toast.error(getReadableErrorMessage(error, 'No se pudo actualizar el estado'))
    } finally {
      setIsUpdatingEstado(false)
    }
  }

  async function handleVinculoSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!token || !socio) {
      return
    }

    setIsUpdatingVinculo(true)
    try {
      const updated = await updateSocioVinculoUsuario(token, socio.id, vinculoForm)
      setSocio(updated)
      hydrateSocioForm(updated)
      setIsVinculoDialogOpen(false)
      toast.success(updated.userId ? 'Vinculo actualizado correctamente' : 'Vinculo eliminado correctamente')
    } catch (error) {
      toast.error(getReadableErrorMessage(error, 'No se pudo actualizar el vinculo'))
    } finally {
      setIsUpdatingVinculo(false)
    }
  }

  async function handleDesvincularUsuario() {
    if (!token || !socio) {
      return
    }

    setIsUpdatingVinculo(true)
    try {
      const updated = await updateSocioVinculoUsuario(token, socio.id)
      setSocio(updated)
      hydrateSocioForm(updated)
      setIsVinculoDialogOpen(false)
      toast.success('Vinculo eliminado correctamente')
    } catch (error) {
      toast.error(getReadableErrorMessage(error, 'No se pudo actualizar el vinculo'))
    } finally {
      setIsUpdatingVinculo(false)
    }
  }

  async function handleCuotaSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!token || !socio) {
      return
    }

    setIsSavingCuota(true)
    try {
      if (editingCuota) {
        await updateCuotaSocio(token, socio.id, editingCuota.id, {
          periodo: cuotaPeriodo,
          monto: Number(cuotaMonto),
          fechaVencimiento: cuotaFechaVencimiento,
          tipoComprobante: cuotaTipoComprobante,
          numeroComprobante: cuotaNumeroComprobante,
          medioPago: cuotaMedioPago,
          observacion: cuotaObservacion,
        })
        toast.success('Cuota actualizada correctamente')
      } else {
        await createCuotaSocio(token, socio.id, {
          periodo: cuotaPeriodo,
          monto: Number(cuotaMonto),
          fechaVencimiento: cuotaFechaVencimiento,
          tipoComprobante: cuotaTipoComprobante,
          numeroComprobante: cuotaNumeroComprobante,
          medioPago: cuotaMedioPago,
          observacion: cuotaObservacion,
        })
        toast.success('Cuota registrada correctamente')
      }

      setIsCuotaDialogOpen(false)
      setEditingCuota(null)
      setRefreshKey((current) => current + 1)
    } catch (error) {
      toast.error(getReadableErrorMessage(error, 'No se pudo guardar el pago'))
    } finally {
      setIsSavingCuota(false)
    }
  }

  async function handlePagarCuotaSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!token || !socio || !payingCuota) {
      return
    }

    setIsPayingCuota(true)
    try {
      await pagarCuotaSocio(token, socio.id, payingCuota.id, {
        fechaPago: pagoFecha,
        tipoComprobante: pagoTipoComprobante,
        numeroComprobante: pagoNumeroComprobante,
        medioPago: pagoMedioPago,
        observacion: pagoObservacion,
      })
      setIsPagarDialogOpen(false)
      setPayingCuota(null)
      setRefreshKey((current) => current + 1)
      toast.success('Cuota marcada como pagada')
    } catch (error) {
      toast.error(getReadableErrorMessage(error, 'No se pudo registrar el pago'))
    } finally {
      setIsPayingCuota(false)
    }
  }

  async function handleAnularCuota(cuotaId: string) {
    if (!token || !socio) {
      return
    }

    try {
      await anularCuotaSocio(token, socio.id, cuotaId)
      setRefreshKey((current) => current + 1)
      toast.success('Cuota anulada correctamente')
    } catch (error) {
      toast.error(getReadableErrorMessage(error, 'No se pudo anular el pago'))
    }
  }

  const totalCuotasPendientes = useMemo(
    () => cuotas.filter((cuota) => cuota.estadoPago === 'pendiente' || cuota.estadoPago === 'vencida').length,
    [cuotas]
  )

  if (isLoading) {
    return (
      <>
        <DashboardHeader title="Socio" description="Cargando ficha administrativa..." />
        <main className="flex-1 p-4 md:p-6">
          <div className="flex items-center justify-center py-16 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        </main>
      </>
    )
  }

  if (!socio) {
    return (
      <>
        <DashboardHeader title="Socio" description="No se pudo cargar la ficha administrativa." />
        <main className="flex-1 p-4 md:p-6">
          <Empty className="border border-dashed border-border">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <UserRound />
              </EmptyMedia>
              <EmptyTitle>Socio no encontrado</EmptyTitle>
              <EmptyDescription>{pageError ?? 'No se pudo obtener la información solicitada.'}</EmptyDescription>
            </EmptyHeader>
          </Empty>
        </main>
      </>
    )
  }

  return (
    <>
      <DashboardHeader
        title={socio.nombreCompleto}
        description={section === 'admin' ? 'Ficha administrativa del socio y gestión de pagos.' : 'Consulta y operación sobre el registro del socio.'}
      />
      <main className="flex-1 space-y-6 p-4 md:p-6">
        {pageError && (
          <div className="flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{pageError}</span>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          <Card className="bg-card border-border">
            <CardHeader className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <CardTitle className="flex items-center gap-3 text-foreground">
                  <span>{socio.nombreCompleto}</span>
                  <Badge variant="outline" className={socioEstadoBadgeClass(socio.estado)}>
                    {socioEstadoLabelMap[socio.estado]}
                  </Badge>
                  <Badge variant="outline" className="text-foreground">
                    {socioTipoLabelMap[socio.tipo]}
                  </Badge>
                </CardTitle>
                <p className="mt-2 text-sm text-muted-foreground">DNI {socio.dni} · Alta {socio.fechaAlta}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline">
                      <Pencil className="mr-2 h-4 w-4" />
                      Editar
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-h-[90vh] overflow-y-auto bg-card border-border">
                    <DialogHeader>
                      <DialogTitle>Editar socio</DialogTitle>
                      <DialogDescription>Actualiza la ficha administrativa del socio.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSocioSubmit}>
                      <FieldGroup>
                        <Field>
                          <FieldLabel htmlFor="edit-nombre">Nombre</FieldLabel>
                          <Input id="edit-nombre" value={formNombre} onChange={(event) => setFormNombre(event.target.value)} required className="bg-secondary border-border" />
                        </Field>
                        <Field>
                          <FieldLabel htmlFor="edit-apellido">Apellido</FieldLabel>
                          <Input id="edit-apellido" value={formApellido} onChange={(event) => setFormApellido(event.target.value)} required className="bg-secondary border-border" />
                        </Field>
                        <Field>
                          <FieldLabel htmlFor="edit-dni">DNI</FieldLabel>
                          <Input id="edit-dni" value={formDni} onChange={(event) => setFormDni(event.target.value)} required className="bg-secondary border-border" />
                        </Field>
                        <Field>
                          <FieldLabel htmlFor="edit-domicilio">Domicilio</FieldLabel>
                          <Input id="edit-domicilio" value={formDomicilio} onChange={(event) => setFormDomicilio(event.target.value)} required className="bg-secondary border-border" />
                        </Field>
                        <Field>
                          <FieldLabel htmlFor="edit-fechaAlta">Fecha de alta</FieldLabel>
                          <Input id="edit-fechaAlta" type="date" value={formFechaAlta} onChange={(event) => setFormFechaAlta(event.target.value)} required className="bg-secondary border-border" />
                        </Field>
                        <Field>
                          <FieldLabel htmlFor="edit-tipo">Tipo</FieldLabel>
                          <Select value={formTipo} onValueChange={(value) => setFormTipo(value as SocioTipo)}>
                            <SelectTrigger id="edit-tipo" className="bg-secondary border-border">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-popover border-border">
                              {SOCIO_TIPOS.map((tipo) => (
                                <SelectItem key={tipo.value} value={tipo.value}>
                                  {tipo.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </Field>
                        <Field>
                          <FieldLabel htmlFor="edit-observaciones">Observaciones</FieldLabel>
                          <Input id="edit-observaciones" value={formObservaciones} onChange={(event) => setFormObservaciones(event.target.value)} className="bg-secondary border-border" />
                        </Field>
                      </FieldGroup>
                      <DialogFooter className="mt-6">
                        <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                          Cancelar
                        </Button>
                        <Button type="submit" disabled={isSavingSocio}>
                          {isSavingSocio ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Guardando...
                            </>
                          ) : 'Guardar cambios'}
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>

                <Dialog open={isEstadoDialogOpen} onOpenChange={setIsEstadoDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline">Cambiar estado</Button>
                  </DialogTrigger>
                  <DialogContent className="bg-card border-border">
                    <DialogHeader>
                      <DialogTitle>Cambiar estado</DialogTitle>
                      <DialogDescription>Actualiza el estado administrativo del socio.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleEstadoSubmit}>
                      <FieldGroup>
                        <Field>
                          <FieldLabel htmlFor="estado-socio">Estado</FieldLabel>
                          <Select value={estadoForm} onValueChange={(value) => setEstadoForm(value as SocioEstado)}>
                            <SelectTrigger id="estado-socio" className="bg-secondary border-border">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-popover border-border">
                              {SOCIO_ESTADOS.map((estado) => (
                                <SelectItem key={estado.value} value={estado.value}>
                                  {estado.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </Field>
                        {estadoForm === 'baja' && (
                          <Field>
                            <FieldLabel htmlFor="fecha-baja">Fecha de baja</FieldLabel>
                            <Input id="fecha-baja" type="date" value={fechaBajaForm} onChange={(event) => setFechaBajaForm(event.target.value)} className="bg-secondary border-border" />
                          </Field>
                        )}
                      </FieldGroup>
                      <DialogFooter className="mt-6">
                        <Button type="button" variant="outline" onClick={() => setIsEstadoDialogOpen(false)}>
                          Cancelar
                        </Button>
                        <Button type="submit" disabled={isUpdatingEstado}>
                          {isUpdatingEstado ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Guardando...
                            </>
                          ) : 'Actualizar estado'}
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>

                <Dialog open={isVinculoDialogOpen} onOpenChange={setIsVinculoDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline">
                      <Link2 className="mr-2 h-4 w-4" />
                      Vincular usuario
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-card border-border">
                    <DialogHeader>
                      <DialogTitle>Vincular usuario de Keycloak</DialogTitle>
                      <DialogDescription>Guarda o elimina el identificador del usuario digital asociado.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleVinculoSubmit}>
                      <FieldGroup>
                        <Field>
                          <FieldLabel htmlFor="buscar-usuario">Buscar cuenta</FieldLabel>
                          <Input
                            id="buscar-usuario"
                            value={userSearch}
                            onChange={(event) => setUserSearch(event.target.value)}
                            placeholder="Buscar por nombre, email o usuario"
                            className="bg-secondary border-border"
                          />
                        </Field>
                        <Field>
                          <FieldLabel>Cuenta seleccionada</FieldLabel>
                          <div className="rounded-lg border border-border bg-secondary/40 p-3 text-sm">
                            {vinculoForm ? (
                              <div className="space-y-1">
                                <p className="font-medium text-foreground">User ID: {vinculoForm}</p>
                                <p className="text-muted-foreground">La cuenta vinculada quedará asociada al socio.</p>
                              </div>
                            ) : (
                              <p className="text-muted-foreground">Todavía no hay una cuenta seleccionada.</p>
                            )}
                          </div>
                        </Field>
                        <Field>
                          <FieldLabel>Resultados</FieldLabel>
                          <div className="max-h-64 space-y-2 overflow-y-auto rounded-lg border border-border bg-secondary/20 p-2">
                            {isSearchingUsers ? (
                              <div className="flex items-center justify-center py-6 text-sm text-muted-foreground">
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Buscando usuarios...
                              </div>
                            ) : userResults.length === 0 ? (
                              <p className="py-6 text-center text-sm text-muted-foreground">No se encontraron cuentas.</p>
                            ) : (
                              userResults.map((user) => (
                                <button
                                  key={user.id}
                                  type="button"
                                  onClick={() => setVinculoForm(user.id)}
                                  className={`w-full rounded-lg border p-3 text-left transition-colors ${
                                    vinculoForm === user.id
                                      ? 'border-primary bg-primary/10'
                                      : 'border-border bg-background hover:bg-secondary/60'
                                  }`}
                                >
                                  <p className="font-medium text-foreground">{user.name}</p>
                                  <p className="text-sm text-muted-foreground">{user.email}</p>
                                  {user.username && <p className="text-xs text-muted-foreground">Usuario: {user.username}</p>}
                                </button>
                              ))
                            )}
                          </div>
                        </Field>
                      </FieldGroup>
                      <DialogFooter className="mt-6">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => void handleDesvincularUsuario()}
                          disabled={isUpdatingVinculo || !socio.userId}
                        >
                          Desvincular
                        </Button>
                        <Button type="submit" disabled={isUpdatingVinculo}>
                          {isUpdatingVinculo ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Guardando...
                            </>
                          ) : 'Guardar vinculo'}
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="rounded-lg bg-secondary/40 p-4">
                <p className="text-sm text-muted-foreground">Domicilio</p>
                <p className="mt-1 text-foreground">{socio.domicilio}</p>
              </div>
              <div className="rounded-lg bg-secondary/40 p-4">
                <p className="text-sm text-muted-foreground">Usuario vinculado</p>
                <p className="mt-1 break-all text-foreground">{socio.userId ?? 'Sin vinculo'}</p>
              </div>
              <div className="rounded-lg bg-secondary/40 p-4">
                <p className="text-sm text-muted-foreground">Fecha de baja</p>
                <p className="mt-1 text-foreground">{socio.fechaBaja ?? 'Sin baja administrativa'}</p>
              </div>
              <div className="rounded-lg bg-secondary/40 p-4">
                <p className="text-sm text-muted-foreground">Observaciones</p>
                <p className="mt-1 text-foreground">{socio.observaciones?.trim() || 'Sin observaciones'}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Resumen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg bg-secondary/40 p-4">
                <p className="text-sm text-muted-foreground">Pagos registrados</p>
                <p className="mt-1 text-3xl font-bold text-foreground">{cuotas.length}</p>
              </div>
              <div className="rounded-lg bg-secondary/40 p-4">
                <p className="text-sm text-muted-foreground">Pendientes o vencidas</p>
                <p className="mt-1 text-3xl font-bold text-foreground">{totalCuotasPendientes}</p>
              </div>
              <div className="rounded-lg bg-secondary/40 p-4">
                <p className="text-sm text-muted-foreground">Tipo de socio</p>
                <p className="mt-1 text-foreground">{socioTipoLabelMap[socio.tipo]}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-card border-border">
          <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <CardTitle className="text-foreground">Pagos</CardTitle>
            <Dialog
              open={isCuotaDialogOpen}
              onOpenChange={(open) => {
                setIsCuotaDialogOpen(open)
                if (!open) {
                  setEditingCuota(null)
                }
              }}
            >
              <DialogTrigger asChild>
                <Button
                  onClick={() => {
                    setEditingCuota(null)
                    resetCuotaForm()
                  }}
                >
                  <ReceiptText className="mr-2 h-4 w-4" />
                  Registrar pago
                </Button>
              </DialogTrigger>
              <DialogContent className="max-h-[90vh] overflow-y-auto bg-card border-border">
                <DialogHeader>
                  <DialogTitle>{editingCuota ? 'Editar pago' : 'Registrar pago'}</DialogTitle>
                  <DialogDescription>Carga el periodo, el monto y los datos del comprobante.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCuotaSubmit}>
                  <FieldGroup>
                    <Field>
                      <FieldLabel htmlFor="cuota-periodo">Periodo</FieldLabel>
                      <Input id="cuota-periodo" type="month" value={cuotaPeriodo} onChange={(event) => setCuotaPeriodo(event.target.value)} required className="bg-secondary border-border" />
                    </Field>
                    <Field>
                      <FieldLabel htmlFor="cuota-monto">Monto</FieldLabel>
                      <Input id="cuota-monto" type="number" min="0" step="0.01" value={cuotaMonto} onChange={(event) => setCuotaMonto(event.target.value)} required className="bg-secondary border-border" />
                    </Field>
                    <Field>
                      <FieldLabel htmlFor="cuota-vencimiento">Fecha de vencimiento</FieldLabel>
                      <Input id="cuota-vencimiento" type="date" value={cuotaFechaVencimiento} onChange={(event) => setCuotaFechaVencimiento(event.target.value)} required className="bg-secondary border-border" />
                    </Field>
                    <Field>
                      <FieldLabel htmlFor="cuota-tipo-comprobante">Tipo de comprobante</FieldLabel>
                      <Input id="cuota-tipo-comprobante" value={cuotaTipoComprobante} onChange={(event) => setCuotaTipoComprobante(event.target.value)} className="bg-secondary border-border" />
                    </Field>
                    <Field>
                      <FieldLabel htmlFor="cuota-numero-comprobante">Numero de comprobante</FieldLabel>
                      <Input id="cuota-numero-comprobante" value={cuotaNumeroComprobante} onChange={(event) => setCuotaNumeroComprobante(event.target.value)} className="bg-secondary border-border" />
                    </Field>
                    <Field>
                      <FieldLabel htmlFor="cuota-medio-pago">Medio de pago</FieldLabel>
                      <Input id="cuota-medio-pago" value={cuotaMedioPago} onChange={(event) => setCuotaMedioPago(event.target.value)} className="bg-secondary border-border" />
                    </Field>
                    <Field>
                      <FieldLabel htmlFor="cuota-observacion">Observacion</FieldLabel>
                      <Input id="cuota-observacion" value={cuotaObservacion} onChange={(event) => setCuotaObservacion(event.target.value)} className="bg-secondary border-border" />
                    </Field>
                  </FieldGroup>
                  <DialogFooter className="mt-6">
                    <Button type="button" variant="outline" onClick={() => setIsCuotaDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button type="submit" disabled={isSavingCuota}>
                      {isSavingCuota ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Guardando...
                        </>
                      ) : editingCuota ? 'Actualizar pago' : 'Registrar pago'}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            {cuotas.length === 0 ? (
              <Empty className="border border-dashed border-border">
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <CalendarClock />
                  </EmptyMedia>
                  <EmptyTitle>No hay pagos registrados</EmptyTitle>
                  <EmptyDescription>Este socio aun no tiene pagos cargados.</EmptyDescription>
                </EmptyHeader>
                <EmptyContent>
                  <Button
                    onClick={() => {
                      setEditingCuota(null)
                      resetCuotaForm()
                      setIsCuotaDialogOpen(true)
                    }}
                  >
                    Registrar primer pago
                  </Button>
                </EmptyContent>
              </Empty>
            ) : (
              <div className="rounded-lg border border-border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border hover:bg-transparent">
                      <TableHead>Periodo</TableHead>
                      <TableHead>Monto</TableHead>
                      <TableHead className="hidden md:table-cell">Vencimiento</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="hidden lg:table-cell">Comprobante</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cuotas.map((cuota) => (
                      <TableRow key={cuota.id} className="border-border">
                        <TableCell className="font-medium text-foreground">{cuota.periodo}</TableCell>
                        <TableCell className="text-muted-foreground">{formatCurrency(cuota.monto)}</TableCell>
                        <TableCell className="hidden md:table-cell text-muted-foreground">{cuota.fechaVencimiento}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={cuotaEstadoBadgeClass(cuota.estadoPago)}>
                            {cuotaEstadoLabelMap[cuota.estadoPago]}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell text-muted-foreground">
                          {cuota.numeroComprobante || cuota.tipoComprobante ? `${cuota.tipoComprobante ?? ''} ${cuota.numeroComprobante ?? ''}`.trim() : 'Sin comprobante'}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex flex-wrap items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setEditingCuota(cuota)
                                resetCuotaForm(cuota)
                                setIsCuotaDialogOpen(true)
                              }}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            {cuota.estadoPago !== 'pagada' && cuota.estadoPago !== 'anulada' && (
                              <Dialog
                                open={isPagarDialogOpen && payingCuota?.id === cuota.id}
                                onOpenChange={(open) => {
                                  setIsPagarDialogOpen(open)
                                  if (!open) {
                                    setPayingCuota(null)
                                  }
                                }}
                              >
                                <DialogTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      setPayingCuota(cuota)
                                      resetPagoForm(cuota)
                                      setIsPagarDialogOpen(true)
                                    }}
                                  >
                                    <CreditCard className="mr-1 h-4 w-4" />
                                    Registrar pago
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="bg-card border-border">
                                  <DialogHeader>
                                    <DialogTitle>Registrar pago</DialogTitle>
                                    <DialogDescription>Marca el pago como realizado y guarda el comprobante.</DialogDescription>
                                  </DialogHeader>
                                  <form onSubmit={handlePagarCuotaSubmit}>
                                    <FieldGroup>
                                      <Field>
                                        <FieldLabel htmlFor="pago-fecha">Fecha de pago</FieldLabel>
                                        <Input id="pago-fecha" type="date" value={pagoFecha} onChange={(event) => setPagoFecha(event.target.value)} required className="bg-secondary border-border" />
                                      </Field>
                                      <Field>
                                        <FieldLabel htmlFor="pago-tipo">Tipo de comprobante</FieldLabel>
                                        <Input id="pago-tipo" value={pagoTipoComprobante} onChange={(event) => setPagoTipoComprobante(event.target.value)} className="bg-secondary border-border" />
                                      </Field>
                                      <Field>
                                        <FieldLabel htmlFor="pago-numero">Numero de comprobante</FieldLabel>
                                        <Input id="pago-numero" value={pagoNumeroComprobante} onChange={(event) => setPagoNumeroComprobante(event.target.value)} className="bg-secondary border-border" />
                                      </Field>
                                      <Field>
                                        <FieldLabel htmlFor="pago-medio">Medio de pago</FieldLabel>
                                        <Input id="pago-medio" value={pagoMedioPago} onChange={(event) => setPagoMedioPago(event.target.value)} className="bg-secondary border-border" />
                                      </Field>
                                      <Field>
                                        <FieldLabel htmlFor="pago-observacion">Observacion</FieldLabel>
                                        <Input id="pago-observacion" value={pagoObservacion} onChange={(event) => setPagoObservacion(event.target.value)} className="bg-secondary border-border" />
                                      </Field>
                                    </FieldGroup>
                                    <DialogFooter className="mt-6">
                                      <Button type="button" variant="outline" onClick={() => setIsPagarDialogOpen(false)}>
                                        Cancelar
                                      </Button>
                                      <Button type="submit" disabled={isPayingCuota}>
                                        {isPayingCuota ? (
                                          <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Guardando...
                                          </>
                                        ) : 'Registrar pago'}
                                      </Button>
                                    </DialogFooter>
                                  </form>
                                </DialogContent>
                              </Dialog>
                            )}
                            {cuota.estadoPago !== 'anulada' && (
                              <Button variant="ghost" size="sm" onClick={() => void handleAnularCuota(cuota.id)}>
                                Anular
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </>
  )
}
