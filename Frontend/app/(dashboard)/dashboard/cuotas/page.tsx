'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { DashboardHeader } from '@/components/dashboard/dashboard-header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useAuth } from '@/hooks/use-auth'
import { fetchMyCuotasSocioPage, fetchMySocio, getReadableErrorMessage } from '@/lib/api'
import { CUOTA_ESTADOS, type CuotaSocio, type Socio } from '@/lib/types'
import { AlertCircle, ChevronLeft, ChevronRight, CreditCard, ExternalLink, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

const cuotaEstadoLabelMap = Object.fromEntries(CUOTA_ESTADOS.map((estado) => [estado.value, estado.label])) as Record<CuotaSocio['estadoPago'], string>

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

export default function DashboardCuotasPage() {
  const { token } = useAuth()
  const [socio, setSocio] = useState<Socio | null>(null)
  const [cuotas, setCuotas] = useState<CuotaSocio[]>([])
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [pageError, setPageError] = useState<string | null>(null)
  const pageSize = 10

  useEffect(() => {
    if (!token) {
      return
    }

    let cancelled = false

    async function loadData() {
      try {
        setIsLoading(true)
        setPageError(null)
        const [nextSocio, cuotasPage] = await Promise.all([
          fetchMySocio(token),
          fetchMyCuotasSocioPage(token, page, pageSize),
        ])

        if (cancelled) {
          return
        }

        setSocio(nextSocio)
        setCuotas(cuotasPage.content)
        setTotalPages(cuotasPage.totalPages)
        setTotalElements(cuotasPage.totalElements)
      } catch (error) {
        if (!cancelled) {
          const message = getReadableErrorMessage(error, 'No se pudieron cargar tus pagos')
          setPageError(message)
          toast.error(message)
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    void loadData()

    return () => {
      cancelled = true
    }
  }, [page, token])

  const summary = useMemo(() => {
    return {
      pendientes: cuotas.filter((cuota) => cuota.estadoPago === 'pendiente' || cuota.estadoPago === 'vencida').length,
      pagadas: cuotas.filter((cuota) => cuota.estadoPago === 'pagada').length,
    }
  }, [cuotas])

  return (
    <>
      <DashboardHeader
        title="Mis Pagos"
        description={socio ? `Estado de pagos del socio ${socio.nombreCompleto}` : 'Consulta tus pagos registrados por el Centro Vecinal'}
      />
      <main className="flex-1 p-6 md:p-8">
        {pageError && (
          <div className="mb-6 flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{pageError}</span>
          </div>
        )}

        <div className="mb-6 grid gap-4 md:grid-cols-3">
          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Socio vinculado</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-semibold text-foreground">{socio?.nombreCompleto ?? 'Sin vinculo'}</div>
              <p className="mt-1 text-sm text-muted-foreground">{socio ? `DNI ${socio.dni}` : 'Pide al centro vecinal que vincule tu cuenta.'}</p>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pendientes o vencidos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{summary.pendientes}</div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pagados en esta página</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{summary.pagadas}</div>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Detalle de pagos</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-16 text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin" />
              </div>
            ) : cuotas.length === 0 ? (
              <Empty className="border border-dashed border-border">
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <CreditCard />
                  </EmptyMedia>
                  <EmptyTitle>No hay pagos registrados</EmptyTitle>
                  <EmptyDescription>
                    {socio ? 'Todavía no hay pagos asociados a tu registro.' : 'Tu cuenta aún no está vinculada a un socio.'}
                  </EmptyDescription>
                </EmptyHeader>
                <EmptyContent />
              </Empty>
            ) : (
              <>
                <div className="rounded-lg border border-border overflow-hidden">
                  <Table>
                    <TableHeader>
                        <TableRow className="border-border hover:bg-transparent">
                          <TableHead>Periodo</TableHead>
                          <TableHead>Monto</TableHead>
                          <TableHead className="hidden md:table-cell">Vencimiento</TableHead>
                          <TableHead>Estado</TableHead>
                          <TableHead className="hidden lg:table-cell">Pago</TableHead>
                          <TableHead className="hidden lg:table-cell">Comprobante</TableHead>
                          <TableHead className="w-[140px] text-right">Acciones</TableHead>
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
                          <TableCell className="hidden lg:table-cell text-muted-foreground">{cuota.fechaPago ?? 'Pendiente'}</TableCell>
                          <TableCell className="hidden lg:table-cell text-muted-foreground">
                            {cuota.numeroComprobante || cuota.tipoComprobante
                              ? `${cuota.tipoComprobante ?? ''} ${cuota.numeroComprobante ?? ''}`.trim()
                              : 'Sin comprobante'}
                          </TableCell>
                          <TableCell className="text-right">
                            {cuota.numeroComprobante ? (
                              <Button asChild variant="outline" size="sm">
                                <Link href={`/dashboard/cuotas/${cuota.id}/comprobante`} target="_blank">
                                  <ExternalLink className="mr-2 h-4 w-4" />
                                  Ver comprobante
                                </Link>
                              </Button>
                            ) : (
                              <span className="text-sm text-muted-foreground">No disponible</span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                <div className="mt-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <p className="text-sm text-muted-foreground">
                    Mostrando {(page * pageSize) + 1} a {Math.min((page + 1) * pageSize, totalElements)} de {totalElements} pagos
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
              </>
            )}
          </CardContent>
        </Card>
      </main>
    </>
  )
}
