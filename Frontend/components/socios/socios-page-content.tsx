'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
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
import { createSocio, fetchSociosPage, getReadableErrorMessage, updateSocio } from '@/lib/api'
import { SOCIO_ESTADOS, SOCIO_TIPOS, type Socio, type SocioEstado, type SocioTipo } from '@/lib/types'
import { AlertCircle, ChevronLeft, ChevronRight, Link2, Loader2, Pencil, Plus, Search, UserRound } from 'lucide-react'
import { toast } from 'sonner'

type Props = {
  section: 'admin' | 'staff'
}

const tipoLabelMap = Object.fromEntries(SOCIO_TIPOS.map((tipo) => [tipo.value, tipo.label])) as Record<SocioTipo, string>
const estadoLabelMap = Object.fromEntries(SOCIO_ESTADOS.map((estado) => [estado.value, estado.label])) as Record<SocioEstado, string>

function estadoBadgeClass(estado: SocioEstado): string {
  switch (estado) {
    case 'activo':
      return 'border-green-500/40 text-green-400'
    case 'baja':
      return 'border-gray-500/40 text-gray-300'
    case 'moroso':
      return 'border-amber-500/40 text-amber-400'
  }
}

export function SociosPageContent({ section }: Props) {
  const { token, initialized } = useAuth()
  const router = useRouter()
  const canCreate = section === 'admin'
  const basePath = section === 'admin' ? '/admin/socios' : '/staff/socios'
  const [search, setSearch] = useState('')
  const [estadoFilter, setEstadoFilter] = useState<SocioEstado | 'all'>('all')
  const [tipoFilter, setTipoFilter] = useState<SocioTipo | 'all'>('all')
  const [vinculadoFilter, setVinculadoFilter] = useState<'all' | 'yes' | 'no'>('all')
  const [socios, setSocios] = useState<Socio[]>([])
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [isPageLoading, setIsPageLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [pageError, setPageError] = useState<string | null>(null)
  const [reloadKey, setReloadKey] = useState(0)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingSocio, setEditingSocio] = useState<Socio | null>(null)

  const [formNombre, setFormNombre] = useState('')
  const [formApellido, setFormApellido] = useState('')
  const [formDni, setFormDni] = useState('')
  const [formDomicilio, setFormDomicilio] = useState('')
  const [formFechaAlta, setFormFechaAlta] = useState(new Date().toISOString().split('T')[0])
  const [formTipo, setFormTipo] = useState<SocioTipo>('aportante')
  const [formObservaciones, setFormObservaciones] = useState('')

  const pageSize = 10

  const title = section === 'admin' ? 'Gestión de Socios' : 'Registro de Socios'
  const description = section === 'admin'
    ? 'Administra el libro de vecinos asociados y sus datos principales.'
    : 'Consulta y actualiza el libro de vecinos asociados.'

  useEffect(() => {
    setPage(0)
  }, [search, estadoFilter, tipoFilter, vinculadoFilter])

  useEffect(() => {
    if (!initialized || !token) {
      return
    }

    let cancelled = false

    async function loadSocios() {
      try {
        setIsPageLoading(true)
        setPageError(null)
        const data = await fetchSociosPage(token, {
          q: search,
          estado: estadoFilter,
          tipo: tipoFilter,
          vinculado: vinculadoFilter,
          page,
          size: pageSize,
        })

        if (cancelled) {
          return
        }

        setSocios(data.content)
        setTotalPages(data.totalPages)
        setTotalElements(data.totalElements)
      } catch (error) {
        if (!cancelled) {
          const message = getReadableErrorMessage(error, 'No se pudieron cargar los socios')
          setPageError(message)
          toast.error(message)
        }
      } finally {
        if (!cancelled) {
          setIsPageLoading(false)
        }
      }
    }

    void loadSocios()

    return () => {
      cancelled = true
    }
  }, [estadoFilter, initialized, page, reloadKey, search, tipoFilter, token, vinculadoFilter])

  const filteredSummary = useMemo(() => {
    const activos = socios.filter((socio) => socio.estado === 'activo').length
    const vinculados = socios.filter((socio) => Boolean(socio.userId)).length
    return { activos, vinculados }
  }, [socios])

  function resetForm() {
    setFormNombre('')
    setFormApellido('')
    setFormDni('')
    setFormDomicilio('')
    setFormFechaAlta(new Date().toISOString().split('T')[0])
    setFormTipo('aportante')
    setFormObservaciones('')
  }

  function openCreateDialog() {
    setEditingSocio(null)
    resetForm()
    setIsDialogOpen(true)
  }

  function openEditDialog(socio: Socio) {
    setEditingSocio(socio)
    setFormNombre(socio.nombre)
    setFormApellido(socio.apellido)
    setFormDni(socio.dni)
    setFormDomicilio(socio.domicilio)
    setFormFechaAlta(socio.fechaAlta)
    setFormTipo(socio.tipo)
    setFormObservaciones(socio.observaciones ?? '')
    setIsDialogOpen(true)
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!token) {
      toast.error('La sesion no esta disponible')
      return
    }

    setIsSaving(true)
    try {
      if (editingSocio) {
        await updateSocio(token, editingSocio.id, {
          nombre: formNombre,
          apellido: formApellido,
          dni: formDni,
          domicilio: formDomicilio,
          fechaAlta: formFechaAlta,
          tipo: formTipo,
          observaciones: formObservaciones,
        })
        toast.success('Socio actualizado correctamente')
      } else {
        await createSocio(token, {
          nombre: formNombre,
          apellido: formApellido,
          dni: formDni,
          domicilio: formDomicilio,
          fechaAlta: formFechaAlta,
          tipo: formTipo,
          observaciones: formObservaciones,
        })
        setPage(0)
        toast.success('Socio creado correctamente')
      }

      setIsDialogOpen(false)
      setReloadKey((current) => current + 1)
    } catch (error) {
      toast.error(getReadableErrorMessage(error, 'No se pudo guardar el socio'))
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <>
      <DashboardHeader title={title} description={description} />
      <main className="flex-1 p-4 md:p-6">
        <div className="mb-6 grid gap-4 md:grid-cols-3">
          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total socios</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{totalElements}</div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Activos en esta página</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{filteredSummary.activos}</div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Vinculados en esta página</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{filteredSummary.vinculados}</div>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-card border-border">
          <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <CardTitle className="text-foreground">Listado de socios</CardTitle>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              {canCreate && (
                <DialogTrigger asChild>
                  <Button onClick={openCreateDialog} className="w-full md:w-auto">
                    <Plus className="mr-2 h-4 w-4" />
                    Nuevo socio
                  </Button>
                </DialogTrigger>
              )}
              <DialogContent className="max-h-[90vh] overflow-y-auto bg-card border-border">
                <DialogHeader>
                  <DialogTitle>{editingSocio ? 'Editar socio' : 'Nuevo socio'}</DialogTitle>
                  <DialogDescription>
                    {editingSocio ? 'Actualiza los datos administrativos del socio.' : 'Carga un nuevo vecino asociado.'}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                  <FieldGroup>
                    <Field>
                      <FieldLabel htmlFor="nombre">Nombre</FieldLabel>
                      <Input id="nombre" value={formNombre} onChange={(event) => setFormNombre(event.target.value)} required className="bg-secondary border-border" />
                    </Field>
                    <Field>
                      <FieldLabel htmlFor="apellido">Apellido</FieldLabel>
                      <Input id="apellido" value={formApellido} onChange={(event) => setFormApellido(event.target.value)} required className="bg-secondary border-border" />
                    </Field>
                    <Field>
                      <FieldLabel htmlFor="dni">DNI</FieldLabel>
                      <Input id="dni" value={formDni} onChange={(event) => setFormDni(event.target.value)} required className="bg-secondary border-border" />
                    </Field>
                    <Field>
                      <FieldLabel htmlFor="domicilio">Domicilio</FieldLabel>
                      <Input id="domicilio" value={formDomicilio} onChange={(event) => setFormDomicilio(event.target.value)} required className="bg-secondary border-border" />
                    </Field>
                    <Field>
                      <FieldLabel htmlFor="fechaAlta">Fecha de alta</FieldLabel>
                      <Input id="fechaAlta" type="date" value={formFechaAlta} onChange={(event) => setFormFechaAlta(event.target.value)} required className="bg-secondary border-border" />
                    </Field>
                    <Field>
                      <FieldLabel htmlFor="tipo">Tipo de socio</FieldLabel>
                      <Select value={formTipo} onValueChange={(value) => setFormTipo(value as SocioTipo)}>
                        <SelectTrigger id="tipo" className="bg-secondary border-border">
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
                      <FieldLabel htmlFor="observaciones">Observaciones</FieldLabel>
                      <Input id="observaciones" value={formObservaciones} onChange={(event) => setFormObservaciones(event.target.value)} className="bg-secondary border-border" />
                    </Field>
                  </FieldGroup>
                  <DialogFooter className="mt-6">
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button type="submit" disabled={isSaving}>
                      {isSaving ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {editingSocio ? 'Actualizando...' : 'Creando...'}
                        </>
                      ) : editingSocio ? 'Actualizar' : 'Crear'}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Buscar por nombre, apellido o DNI..."
                  className="bg-secondary border-border pl-10"
                />
              </div>
              <Select value={estadoFilter} onValueChange={(value) => setEstadoFilter(value as SocioEstado | 'all')}>
                <SelectTrigger className="w-full bg-secondary border-border md:w-[180px]">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  <SelectItem value="all">Todos los estados</SelectItem>
                  {SOCIO_ESTADOS.map((estado) => (
                    <SelectItem key={estado.value} value={estado.value}>
                      {estado.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={tipoFilter} onValueChange={(value) => setTipoFilter(value as SocioTipo | 'all')}>
                <SelectTrigger className="w-full bg-secondary border-border md:w-[180px]">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  <SelectItem value="all">Todos los tipos</SelectItem>
                  {SOCIO_TIPOS.map((tipo) => (
                    <SelectItem key={tipo.value} value={tipo.value}>
                      {tipo.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={vinculadoFilter} onValueChange={(value) => setVinculadoFilter(value as 'all' | 'yes' | 'no')}>
                <SelectTrigger className="w-full bg-secondary border-border md:w-[180px]">
                  <SelectValue placeholder="Vinculo" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="yes">Vinculados</SelectItem>
                  <SelectItem value="no">Sin vinculo</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {pageError && (
              <div className="mb-6 flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{pageError}</span>
              </div>
            )}

            {isPageLoading ? (
              <div className="flex items-center justify-center py-16 text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin" />
              </div>
            ) : socios.length === 0 ? (
              <Empty className="border border-dashed border-border">
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <UserRound />
                  </EmptyMedia>
                  <EmptyTitle>No hay socios</EmptyTitle>
                  <EmptyDescription>No se encontraron socios con los filtros aplicados.</EmptyDescription>
                </EmptyHeader>
                <EmptyContent>
                  {canCreate && <Button onClick={openCreateDialog}>Cargar primer socio</Button>}
                </EmptyContent>
              </Empty>
            ) : (
              <div className="rounded-lg border border-border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border hover:bg-transparent">
                      <TableHead>Socio</TableHead>
                      <TableHead className="hidden md:table-cell">DNI</TableHead>
                      <TableHead className="hidden lg:table-cell">Alta</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Vinculo</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {socios.map((socio) => (
                      <TableRow
                        key={socio.id}
                        className="cursor-pointer border-border hover:bg-secondary/30"
                        onClick={() => router.push(`${basePath}/${socio.id}`)}
                      >
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium text-foreground">{socio.nombreCompleto}</span>
                            <span className="text-sm text-muted-foreground">{socio.domicilio}</span>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-muted-foreground">{socio.dni}</TableCell>
                        <TableCell className="hidden lg:table-cell text-muted-foreground">{socio.fechaAlta}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-foreground">
                            {tipoLabelMap[socio.tipo]}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={estadoBadgeClass(socio.estado)}>
                            {estadoLabelMap[socio.estado]}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={socio.userId ? 'default' : 'secondary'}>
                            {socio.userId ? 'Vinculado' : 'Sin vinculo'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button asChild variant="ghost" size="sm">
                              <Link
                                href={`${basePath}/${socio.id}`}
                                onClick={(event) => event.stopPropagation()}
                              >
                                <Link2 className="h-4 w-4" />
                              </Link>
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(event) => {
                                event.stopPropagation()
                                openEditDialog(socio)
                              }}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            {!isPageLoading && socios.length > 0 && (
              <div className="mt-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <p className="text-sm text-muted-foreground">
                  Mostrando {(page * pageSize) + 1} a {Math.min((page + 1) * pageSize, totalElements)} de {totalElements} socios
                </p>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage((current) => Math.max(0, current - 1))}>
                    <ChevronLeft className="mr-1 h-4 w-4" />
                    Anterior
                  </Button>
                  <span className="min-w-20 text-center text-sm text-muted-foreground">
                    Pagina {page + 1} de {Math.max(totalPages, 1)}
                  </span>
                  <Button variant="outline" size="sm" disabled={page + 1 >= totalPages} onClick={() => setPage((current) => current + 1)}>
                    Siguiente
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </>
  )
}
