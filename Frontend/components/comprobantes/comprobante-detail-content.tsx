'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { DashboardHeader } from '@/components/dashboard/dashboard-header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/hooks/use-auth'
import { anularComprobante, fetchComprobanteById, getReadableErrorMessage } from '@/lib/api'
import { COMPROBANTE_ESTADOS, COMPROBANTE_ORIGENES, COMPROBANTE_TIPOS, type Comprobante } from '@/lib/types'
import { AlertCircle, ArrowLeft, FileText, Loader2, Printer } from 'lucide-react'
import { toast } from 'sonner'

type Props = {
  section: 'admin' | 'staff'
  comprobanteId: string
}

const tipoLabelMap = Object.fromEntries(COMPROBANTE_TIPOS.map((item) => [item.value, item.label])) as Record<Comprobante['tipo'], string>
const estadoLabelMap = Object.fromEntries(COMPROBANTE_ESTADOS.map((item) => [item.value, item.label])) as Record<Comprobante['estado'], string>
const origenLabelMap = Object.fromEntries(COMPROBANTE_ORIGENES.map((item) => [item.value, item.label])) as Record<Comprobante['origen'], string>

function estadoBadgeClass(estado: Comprobante['estado']): string {
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

export function ComprobanteDetailContent({ section, comprobanteId }: Props) {
  const { token } = useAuth()
  const [comprobante, setComprobante] = useState<Comprobante | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAnulling, setIsAnulling] = useState(false)
  const [pageError, setPageError] = useState<string | null>(null)

  const listPath = section === 'admin' ? '/admin/comprobantes' : '/staff/comprobantes'

  useEffect(() => {
    if (!token) {
      return
    }

    let cancelled = false

    async function loadComprobante() {
      try {
        setIsLoading(true)
        setPageError(null)
        const data = await fetchComprobanteById(token, comprobanteId)
        if (!cancelled) {
          setComprobante(data)
        }
      } catch (error) {
        if (!cancelled) {
          const message = getReadableErrorMessage(error, 'No se pudo cargar el comprobante')
          setPageError(message)
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    void loadComprobante()
    return () => {
      cancelled = true
    }
  }, [comprobanteId, token])

  const printableTitle = useMemo(() => {
    if (!comprobante) {
      return 'Detalle de comprobante'
    }
    return `${comprobante.numero} · ${comprobante.concepto}`
  }, [comprobante])

  async function handleAnular() {
    if (!token || !comprobante) {
      return
    }

    setIsAnulling(true)
    try {
      const updated = await anularComprobante(token, comprobante.id)
      setComprobante(updated)
      toast.success('Comprobante anulado correctamente')
    } catch (error) {
      toast.error(getReadableErrorMessage(error, 'No se pudo anular el comprobante'))
    } finally {
      setIsAnulling(false)
    }
  }

  return (
    <>
      <DashboardHeader title="Detalle de comprobante" description={printableTitle} />
      <main className="flex-1 p-4 md:p-6">
        {pageError && (
          <div className="mb-6 flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{pageError}</span>
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-16 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        ) : !comprobante ? null : (
          <>
            <div className="mb-6 flex flex-wrap gap-3">
              <Button variant="outline" asChild>
                <Link href={listPath}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Volver
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href={`/comprobantes/${comprobante.id}/print`} target="_blank">
                  <Printer className="mr-2 h-4 w-4" />
                  Imprimir
                </Link>
              </Button>
              {comprobante.estado !== 'anulado' && (
                <Button variant="destructive" onClick={() => void handleAnular()} disabled={isAnulling}>
                  {isAnulling ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileText className="mr-2 h-4 w-4" />}
                  Anular comprobante
                </Button>
              )}
            </div>

            <div className="grid gap-6 lg:grid-cols-[1.7fr_1fr]">
              <Card className="bg-card border-border">
                <CardHeader>
                  <div className="flex flex-wrap items-center gap-3">
                    <CardTitle className="text-foreground">{comprobante.numero}</CardTitle>
                    <Badge variant="outline" className={estadoBadgeClass(comprobante.estado)}>
                      {estadoLabelMap[comprobante.estado]}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <p className="text-sm text-muted-foreground">Concepto</p>
                    <p className="mt-1 text-2xl font-semibold text-foreground">{comprobante.concepto}</p>
                  </div>
                  {comprobante.descripcion && (
                    <div>
                      <p className="text-sm text-muted-foreground">Descripción</p>
                      <p className="mt-1 whitespace-pre-wrap text-foreground">{comprobante.descripcion}</p>
                    </div>
                  )}
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-lg bg-secondary/40 p-4">
                      <p className="text-sm text-muted-foreground">Tipo</p>
                      <p className="mt-1 text-foreground">{tipoLabelMap[comprobante.tipo]}</p>
                    </div>
                    <div className="rounded-lg bg-secondary/40 p-4">
                      <p className="text-sm text-muted-foreground">Origen</p>
                      <p className="mt-1 text-foreground">{origenLabelMap[comprobante.origen]}</p>
                    </div>
                    <div className="rounded-lg bg-secondary/40 p-4">
                      <p className="text-sm text-muted-foreground">Fecha de emisión</p>
                      <p className="mt-1 text-foreground">{comprobante.fechaEmision}</p>
                    </div>
                    <div className="rounded-lg bg-secondary/40 p-4">
                      <p className="text-sm text-muted-foreground">Monto</p>
                      <p className="mt-1 text-foreground">{formatCurrency(comprobante.monto)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-6">
                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle className="text-foreground">Pagador</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Nombre</p>
                      <p className="mt-1 text-foreground">{comprobante.nombrePagador}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">DNI</p>
                      <p className="mt-1 text-foreground">{comprobante.dniPagador || 'Sin informar'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Socio vinculado</p>
                      <p className="mt-1 text-foreground">{comprobante.socioNombreCompleto || 'Sin socio asociado'}</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle className="text-foreground">Datos adicionales</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Medio de pago</p>
                      <p className="mt-1 text-foreground">{comprobante.medioPago || 'Sin informar'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Referencia de origen</p>
                      <p className="mt-1 text-foreground">{comprobante.referenciaOrigenId || 'Sin referencia'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Emitido por</p>
                      <p className="mt-1 text-foreground">{comprobante.createdByUsername}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Observaciones</p>
                      <p className="mt-1 whitespace-pre-wrap text-foreground">{comprobante.observaciones || 'Sin observaciones'}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </>
        )}
      </main>
    </>
  )
}
