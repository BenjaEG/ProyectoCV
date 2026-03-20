'use client'

import Link from 'next/link'
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
import { Textarea } from '@/components/ui/textarea'
import { useAuth } from '@/hooks/use-auth'
import {
  anularComprobante,
  createComprobante,
  fetchComprobanteById,
  fetchComprobantesPage,
  fetchSociosPage,
  getReadableErrorMessage,
  updateComprobante,
} from '@/lib/api'
import {
  COMPROBANTE_ESTADOS,
  COMPROBANTE_ORIGENES,
  COMPROBANTE_TIPOS,
  type Comprobante,
  type EstadoComprobante,
  type OrigenComprobante,
  type Socio,
  type TipoComprobanteDoc,
} from '@/lib/types'
import {
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  FilePenLine,
  FileText,
  Link2,
  Loader2,
  Pencil,
  Plus,
  Printer,
  Search,
} from 'lucide-react'
import { toast } from 'sonner'

type Props = {
  section: 'admin' | 'staff'
}

const tipoLabelMap = Object.fromEntries(COMPROBANTE_TIPOS.map((item) => [item.value, item.label])) as Record<TipoComprobanteDoc, string>
const estadoLabelMap = Object.fromEntries(COMPROBANTE_ESTADOS.map((item) => [item.value, item.label])) as Record<EstadoComprobante, string>
const origenLabelMap = Object.fromEntries(COMPROBANTE_ORIGENES.map((item) => [item.value, item.label])) as Record<OrigenComprobante, string>

function estadoBadgeClass(estado: EstadoComprobante): string {
  switch (estado) {
    case 'emitido':
      return 'border-green-500/40 text-green-400'
    case 'anulado':
      return 'border-red-500/40 text-red-400'
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

export function ComprobantesPageContent({ section }: Props) {
  const { token, initialized } = useAuth()
  const basePath = section === 'admin' ? '/admin/comprobantes' : '/staff/comprobantes'

  const [search, setSearch] = useState('')
  const [estadoFilter, setEstadoFilter] = useState<EstadoComprobante | 'all'>('all')
  const [tipoFilter, setTipoFilter] = useState<TipoComprobanteDoc | 'all'>('all')
  const [origenFilter, setOrigenFilter] = useState<OrigenComprobante | 'all'>('all')
  const [comprobantes, setComprobantes] = useState<Comprobante[]>([])
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [isPageLoading, setIsPageLoading] = useState(true)
  const [pageError, setPageError] = useState<string | null>(null)
  const [reloadKey, setReloadKey] = useState(0)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [editingComprobante, setEditingComprobante] = useState<Comprobante | null>(null)
  const [loadingEditComprobanteId, setLoadingEditComprobanteId] = useState<string | null>(null)

  const [tipo, setTipo] = useState<TipoComprobanteDoc>('recibo')
  const [origen, setOrigen] = useState<OrigenComprobante>('pago_socio')
  const [fechaEmision, setFechaEmision] = useState(new Date().toISOString().split('T')[0])
  const [concepto, setConcepto] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [monto, setMonto] = useState('')
  const [medioPago, setMedioPago] = useState('')
  const [nombrePagador, setNombrePagador] = useState('')
  const [dniPagador, setDniPagador] = useState('')
  const [referenciaOrigenId, setReferenciaOrigenId] = useState('')
  const [observaciones, setObservaciones] = useState('')
  const [selectedSocio, setSelectedSocio] = useState<Socio | null>(null)
  const [socioSearch, setSocioSearch] = useState('')
  const [sociosEncontrados, setSociosEncontrados] = useState<Socio[]>([])
  const [isSearchingSocios, setIsSearchingSocios] = useState(false)

  const pageSize = 10

  const title = section === 'admin' ? 'Comprobantes' : 'Comprobantes'
  const description = section === 'admin'
    ? 'Genera, administra e imprime comprobantes del Centro Vecinal.'
    : 'Emite y consulta comprobantes operativos e imprimibles.'

  useEffect(() => {
    setPage(0)
  }, [search, estadoFilter, tipoFilter, origenFilter])

  useEffect(() => {
    if (!initialized || !token) {
      return
    }

    let cancelled = false

    async function loadComprobantes() {
      try {
        setIsPageLoading(true)
        setPageError(null)
        const response = await fetchComprobantesPage(token, {
          q: search,
          estado: estadoFilter,
          tipo: tipoFilter,
          origen: origenFilter,
          page,
          size: pageSize,
        })

        if (cancelled) return

        setComprobantes(response.content)
        setTotalPages(response.totalPages)
        setTotalElements(response.totalElements)
      } catch (error) {
        if (!cancelled) {
          const message = getReadableErrorMessage(error, 'No se pudieron cargar los comprobantes')
          setPageError(message)
          toast.error(message)
        }
      } finally {
        if (!cancelled) {
          setIsPageLoading(false)
        }
      }
    }

    void loadComprobantes()
    return () => {
      cancelled = true
    }
  }, [estadoFilter, initialized, origenFilter, page, reloadKey, search, tipoFilter, token])

  useEffect(() => {
    if (!token || !isDialogOpen) {
      return
    }

    let cancelled = false

    async function loadSocios() {
      try {
        setIsSearchingSocios(true)
        const response = await fetchSociosPage(token, {
          q: socioSearch,
          page: 0,
          size: 8,
        })

        if (!cancelled) {
          setSociosEncontrados(response.content)
        }
      } catch {
        if (!cancelled) {
          setSociosEncontrados([])
        }
      } finally {
        if (!cancelled) {
          setIsSearchingSocios(false)
        }
      }
    }

    void loadSocios()
    return () => {
      cancelled = true
    }
  }, [isDialogOpen, socioSearch, token])

  const summary = useMemo(() => {
    return {
      emitidos: comprobantes.filter((item) => item.estado === 'emitido').length,
      anulados: comprobantes.filter((item) => item.estado === 'anulado').length,
      totalMonto: comprobantes.filter((item) => item.estado === 'emitido').reduce((acc, item) => acc + item.monto, 0),
    }
  }, [comprobantes])

  function resetForm() {
    setTipo('recibo')
    setOrigen('pago_socio')
    setFechaEmision(new Date().toISOString().split('T')[0])
    setConcepto('')
    setDescripcion('')
    setMonto('')
    setMedioPago('')
    setNombrePagador('')
    setDniPagador('')
    setReferenciaOrigenId('')
    setObservaciones('')
    setSelectedSocio(null)
    setSocioSearch('')
    setSociosEncontrados([])
  }

  function openCreateDialog() {
    setEditingComprobante(null)
    resetForm()
    setIsDialogOpen(true)
  }

  function fillForm(comprobante: Comprobante) {
    setTipo(comprobante.tipo)
    setOrigen(comprobante.origen)
    setFechaEmision(comprobante.fechaEmision)
    setConcepto(comprobante.concepto)
    setDescripcion(comprobante.descripcion ?? '')
    setMonto(String(comprobante.monto))
    setMedioPago(comprobante.medioPago ?? '')
    setNombrePagador(comprobante.nombrePagador)
    setDniPagador(comprobante.dniPagador ?? '')
    setReferenciaOrigenId(comprobante.referenciaOrigenId ?? '')
    setObservaciones(comprobante.observaciones ?? '')
    setSelectedSocio(
      comprobante.socioId
        ? {
            id: comprobante.socioId,
            nombre: '',
            apellido: '',
            nombreCompleto: comprobante.socioNombreCompleto ?? 'Socio vinculado',
            dni: comprobante.socioDni ?? '',
            domicilio: '',
            fechaAlta: '',
            tipo: 'aportante',
            estado: 'activo',
          }
        : null
    )
    setSocioSearch('')
    setSociosEncontrados([])
  }

  async function openEditDialog(comprobanteId: string) {
    if (!token) {
      toast.error('La sesión no está disponible')
      return
    }

    setLoadingEditComprobanteId(comprobanteId)
    try {
      const comprobante = await fetchComprobanteById(token, comprobanteId)
      setEditingComprobante(comprobante)
      fillForm(comprobante)
      setIsDialogOpen(true)
    } catch (error) {
      toast.error(getReadableErrorMessage(error, 'No se pudo cargar el comprobante'))
    } finally {
      setLoadingEditComprobanteId(null)
    }
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!token) {
      toast.error('La sesión no está disponible')
      return
    }

    setIsSaving(true)

    try {
      const payload = {
        socioId: selectedSocio?.id,
        tipo,
        origen,
        fechaEmision,
        concepto,
        descripcion,
        monto: Number(monto),
        medioPago,
        nombrePagador,
        dniPagador,
        referenciaOrigenId,
        observaciones,
      }

      if (editingComprobante) {
        await updateComprobante(token, editingComprobante.id, payload)
        toast.success('Comprobante actualizado correctamente')
      } else {
        await createComprobante(token, payload)
        toast.success('Comprobante emitido correctamente')
      }

      setIsDialogOpen(false)
      setReloadKey((current) => current + 1)
    } catch (error) {
      toast.error(getReadableErrorMessage(error, 'No se pudo guardar el comprobante'))
    } finally {
      setIsSaving(false)
    }
  }

  async function handleAnular(comprobanteId: string) {
    if (!token) {
      toast.error('La sesión no está disponible')
      return
    }

    try {
      await anularComprobante(token, comprobanteId)
      toast.success('Comprobante anulado correctamente')
      setReloadKey((current) => current + 1)
    } catch (error) {
      toast.error(getReadableErrorMessage(error, 'No se pudo anular el comprobante'))
    }
  }

  return (
    <>
      <DashboardHeader title={title} description={description} />
      <main className="flex-1 p-4 md:p-6">
        {pageError && (
          <div className="mb-6 flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{pageError}</span>
          </div>
        )}

        <div className="mb-6 grid gap-4 md:grid-cols-3">
          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total comprobantes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{totalElements}</div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Emitidos en esta página</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{summary.emitidos}</div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Monto emitido en esta página</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{formatCurrency(summary.totalMonto)}</div>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-card border-border">
          <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <CardTitle className="text-foreground">Listado de comprobantes</CardTitle>
            <Dialog
              open={isDialogOpen}
              onOpenChange={(open) => {
                setIsDialogOpen(open)
                if (!open) {
                  setEditingComprobante(null)
                }
              }}
            >
              <DialogTrigger asChild>
                <Button onClick={openCreateDialog} className="w-full md:w-auto">
                  <Plus className="mr-2 h-4 w-4" />
                  Nuevo comprobante
                </Button>
              </DialogTrigger>
              <DialogContent className="max-h-[90vh] overflow-y-auto bg-card border-border">
                <DialogHeader>
                  <DialogTitle>{editingComprobante ? 'Editar comprobante' : 'Emitir comprobante'}</DialogTitle>
                  <DialogDescription>
                    Crea un comprobante imprimible, con vínculo opcional a un socio.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                  <FieldGroup>
                    <Field>
                      <FieldLabel htmlFor="comprobante-tipo">Tipo</FieldLabel>
                      <Select value={tipo} onValueChange={(value) => setTipo(value as TipoComprobanteDoc)}>
                        <SelectTrigger id="comprobante-tipo" className="bg-secondary border-border">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-popover border-border">
                          {COMPROBANTE_TIPOS.map((item) => (
                            <SelectItem key={item.value} value={item.value}>
                              {item.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </Field>
                    <Field>
                      <FieldLabel htmlFor="comprobante-origen">Origen</FieldLabel>
                      <Select value={origen} onValueChange={(value) => setOrigen(value as OrigenComprobante)}>
                        <SelectTrigger id="comprobante-origen" className="bg-secondary border-border">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-popover border-border">
                          {COMPROBANTE_ORIGENES.map((item) => (
                            <SelectItem key={item.value} value={item.value}>
                              {item.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </Field>
                    <Field>
                      <FieldLabel htmlFor="comprobante-fecha">Fecha de emisión</FieldLabel>
                      <Input id="comprobante-fecha" type="date" value={fechaEmision} onChange={(event) => setFechaEmision(event.target.value)} required className="bg-secondary border-border" />
                    </Field>
                    <Field>
                      <FieldLabel htmlFor="comprobante-monto">Monto</FieldLabel>
                      <Input id="comprobante-monto" type="number" min="0.01" step="0.01" value={monto} onChange={(event) => setMonto(event.target.value)} required className="bg-secondary border-border" />
                    </Field>
                    <Field className="md:col-span-2">
                      <FieldLabel htmlFor="comprobante-concepto">Concepto</FieldLabel>
                      <Input id="comprobante-concepto" value={concepto} onChange={(event) => setConcepto(event.target.value)} required className="bg-secondary border-border" />
                    </Field>
                    <Field className="md:col-span-2">
                      <FieldLabel htmlFor="comprobante-descripcion">Descripción</FieldLabel>
                      <Textarea id="comprobante-descripcion" value={descripcion} onChange={(event) => setDescripcion(event.target.value)} className="min-h-24 bg-secondary border-border" />
                    </Field>
                    <Field>
                      <FieldLabel htmlFor="comprobante-medio-pago">Medio de pago</FieldLabel>
                      <Input id="comprobante-medio-pago" value={medioPago} onChange={(event) => setMedioPago(event.target.value)} className="bg-secondary border-border" />
                    </Field>
                    <Field>
                      <FieldLabel htmlFor="comprobante-referencia">Referencia de origen</FieldLabel>
                      <Input id="comprobante-referencia" value={referenciaOrigenId} onChange={(event) => setReferenciaOrigenId(event.target.value)} className="bg-secondary border-border" />
                    </Field>
                    <Field className="md:col-span-2">
                      <FieldLabel htmlFor="buscar-socio-comprobante">Socio vinculado (opcional)</FieldLabel>
                      <Input
                        id="buscar-socio-comprobante"
                        value={socioSearch}
                        onChange={(event) => setSocioSearch(event.target.value)}
                        placeholder="Buscar socio por nombre o DNI"
                        className="bg-secondary border-border"
                      />
                    </Field>
                    <Field className="md:col-span-2">
                      <FieldLabel>Socio seleccionado</FieldLabel>
                      <div className="rounded-lg border border-border bg-secondary/40 p-3 text-sm">
                        {selectedSocio ? (
                          <div className="space-y-1">
                            <p className="font-medium text-foreground">{selectedSocio.nombreCompleto}</p>
                            <p className="text-muted-foreground">DNI {selectedSocio.dni || 'Sin DNI'}</p>
                          </div>
                        ) : (
                          <p className="text-muted-foreground">Este comprobante no quedará vinculado a ningún socio.</p>
                        )}
                      </div>
                    </Field>
                    <Field className="md:col-span-2">
                      <FieldLabel>Resultados de socios</FieldLabel>
                      <div className="max-h-56 space-y-2 overflow-y-auto rounded-lg border border-border bg-secondary/20 p-2">
                        {isSearchingSocios ? (
                          <div className="flex items-center justify-center py-6 text-sm text-muted-foreground">
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Buscando socios...
                          </div>
                        ) : sociosEncontrados.length === 0 ? (
                          <p className="py-6 text-center text-sm text-muted-foreground">No se encontraron socios.</p>
                        ) : (
                          sociosEncontrados.map((socio) => (
                            <button
                              key={socio.id}
                              type="button"
                              onClick={() => setSelectedSocio(socio)}
                              className={`w-full rounded-lg border p-3 text-left transition-colors ${
                                selectedSocio?.id === socio.id
                                  ? 'border-primary bg-primary/10'
                                  : 'border-border bg-background hover:bg-secondary/60'
                              }`}
                            >
                              <p className="font-medium text-foreground">{socio.nombreCompleto}</p>
                              <p className="text-sm text-muted-foreground">DNI {socio.dni}</p>
                            </button>
                          ))
                        )}
                      </div>
                      {selectedSocio && (
                        <Button type="button" variant="ghost" size="sm" className="mt-2" onClick={() => setSelectedSocio(null)}>
                          <Link2 className="mr-2 h-4 w-4" />
                          Quitar socio vinculado
                        </Button>
                      )}
                    </Field>
                    <Field>
                      <FieldLabel htmlFor="comprobante-pagador">Nombre del pagador</FieldLabel>
                      <Input id="comprobante-pagador" value={nombrePagador} onChange={(event) => setNombrePagador(event.target.value)} className="bg-secondary border-border" />
                    </Field>
                    <Field>
                      <FieldLabel htmlFor="comprobante-dni">DNI del pagador</FieldLabel>
                      <Input id="comprobante-dni" value={dniPagador} onChange={(event) => setDniPagador(event.target.value)} className="bg-secondary border-border" />
                    </Field>
                    <Field className="md:col-span-2">
                      <FieldLabel htmlFor="comprobante-observaciones">Observaciones</FieldLabel>
                      <Textarea id="comprobante-observaciones" value={observaciones} onChange={(event) => setObservaciones(event.target.value)} className="min-h-24 bg-secondary border-border" />
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
                          Guardando...
                        </>
                      ) : editingComprobante ? 'Actualizar comprobante' : 'Emitir comprobante'}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            <div className="mb-6 grid gap-3 md:grid-cols-4">
              <div className="relative md:col-span-2">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Buscar por número, concepto, pagador o socio"
                  className="pl-9 bg-secondary border-border"
                />
              </div>
              <Select value={estadoFilter} onValueChange={(value) => setEstadoFilter(value as EstadoComprobante | 'all')}>
                <SelectTrigger className="bg-secondary border-border">
                  <SelectValue placeholder="Todos los estados" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  <SelectItem value="all">Todos los estados</SelectItem>
                  {COMPROBANTE_ESTADOS.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={tipoFilter} onValueChange={(value) => setTipoFilter(value as TipoComprobanteDoc | 'all')}>
                <SelectTrigger className="bg-secondary border-border">
                  <SelectValue placeholder="Todos los tipos" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  <SelectItem value="all">Todos los tipos</SelectItem>
                  {COMPROBANTE_TIPOS.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={origenFilter} onValueChange={(value) => setOrigenFilter(value as OrigenComprobante | 'all')}>
                <SelectTrigger className="bg-secondary border-border">
                  <SelectValue placeholder="Todos los orígenes" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  <SelectItem value="all">Todos los orígenes</SelectItem>
                  {COMPROBANTE_ORIGENES.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {isPageLoading ? (
              <div className="flex items-center justify-center py-16 text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin" />
              </div>
            ) : comprobantes.length === 0 ? (
              <Empty className="border border-dashed border-border">
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <FileText />
                  </EmptyMedia>
                  <EmptyTitle>No hay comprobantes registrados</EmptyTitle>
                  <EmptyDescription>Emite el primer comprobante para empezar a registrar pagos e ingresos.</EmptyDescription>
                </EmptyHeader>
                <EmptyContent>
                  <Button onClick={openCreateDialog}>
                    <Plus className="mr-2 h-4 w-4" />
                    Emitir primer comprobante
                  </Button>
                </EmptyContent>
              </Empty>
            ) : (
              <>
                <div className="rounded-lg border border-border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-border hover:bg-transparent">
                        <TableHead>Número</TableHead>
                        <TableHead>Fecha</TableHead>
                        <TableHead>Concepto</TableHead>
                        <TableHead>Pagador</TableHead>
                        <TableHead className="hidden md:table-cell">Origen</TableHead>
                        <TableHead>Monto</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {comprobantes.map((comprobante) => (
                        <TableRow key={comprobante.id} className="border-border">
                          <TableCell className="font-medium text-foreground">{comprobante.numero}</TableCell>
                          <TableCell className="text-muted-foreground">{comprobante.fechaEmision}</TableCell>
                          <TableCell className="text-foreground">{comprobante.concepto}</TableCell>
                          <TableCell className="text-muted-foreground">
                            {comprobante.socioNombreCompleto ?? comprobante.nombrePagador}
                          </TableCell>
                          <TableCell className="hidden md:table-cell text-muted-foreground">{origenLabelMap[comprobante.origen]}</TableCell>
                          <TableCell className="text-muted-foreground">{formatCurrency(comprobante.monto)}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className={estadoBadgeClass(comprobante.estado)}>
                              {estadoLabelMap[comprobante.estado]}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex flex-wrap items-center justify-end gap-2">
                              <Button variant="ghost" size="sm" asChild>
                                <Link href={`${basePath}/${comprobante.id}`}>
                                  <FileText className="h-4 w-4" />
                                </Link>
                              </Button>
                              <Button variant="ghost" size="sm" asChild>
                                <Link href={`/comprobantes/${comprobante.id}/print`} target="_blank">
                                  <Printer className="h-4 w-4" />
                                </Link>
                              </Button>
                              {comprobante.estado !== 'anulado' && (
                                <Button variant="ghost" size="sm" onClick={() => void openEditDialog(comprobante.id)} disabled={loadingEditComprobanteId === comprobante.id}>
                                  {loadingEditComprobanteId === comprobante.id ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <Pencil className="h-4 w-4" />
                                  )}
                                </Button>
                              )}
                              {comprobante.estado !== 'anulado' && (
                                <Button variant="ghost" size="sm" onClick={() => void handleAnular(comprobante.id)}>
                                  <FilePenLine className="mr-1 h-4 w-4" />
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

                <div className="mt-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <p className="text-sm text-muted-foreground">
                    Mostrando {(page * pageSize) + 1} a {Math.min((page + 1) * pageSize, totalElements)} de {totalElements} comprobantes
                  </p>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage((current) => Math.max(0, current - 1))}>
                      <ChevronLeft className="mr-1 h-4 w-4" />
                      Anterior
                    </Button>
                    <span className="min-w-20 text-center text-sm text-muted-foreground">
                      Página {page + 1} de {Math.max(totalPages, 1)}
                    </span>
                    <Button variant="outline" size="sm" disabled={page + 1 >= totalPages} onClick={() => setPage((current) => current + 1)}>
                      Siguiente
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </main>
    </>
  )
}
