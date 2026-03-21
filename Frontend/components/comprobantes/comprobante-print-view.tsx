'use client'

import { useEffect, useMemo, useState } from 'react'
import { ProtectedRoute, useAuth } from '@/components/auth/auth-provider'
import { Button } from '@/components/ui/button'
import { fetchComprobanteById, fetchMyPagoComprobante, getReadableErrorMessage } from '@/lib/api'
import { COMPROBANTE_ORIGENES, COMPROBANTE_TIPOS, type Comprobante } from '@/lib/types'
import { ArrowLeft, Download, Loader2, Printer } from 'lucide-react'

const tipoLabelMap = Object.fromEntries(COMPROBANTE_TIPOS.map((item) => [item.value, item.label])) as Record<Comprobante['tipo'], string>
const origenLabelMap = Object.fromEntries(COMPROBANTE_ORIGENES.map((item) => [item.value, item.label])) as Record<Comprobante['origen'], string>

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount)
}

type Props = {
  comprobanteId: string
  mode?: 'staff' | 'neighbor'
}

export function ComprobantePrintView({ comprobanteId, mode = 'staff' }: Props) {
  const { token } = useAuth()
  const [comprobante, setComprobante] = useState<Comprobante | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [pageError, setPageError] = useState<string | null>(null)

  useEffect(() => {
    if (!token) {
      return
    }

    let cancelled = false

    async function loadComprobante() {
      try {
        setIsLoading(true)
        setPageError(null)
        const data = mode === 'neighbor'
          ? await fetchMyPagoComprobante(token, comprobanteId)
          : await fetchComprobanteById(token, comprobanteId)
        if (!cancelled) {
          setComprobante(data)
        }
      } catch (error) {
        if (!cancelled) {
          setPageError(getReadableErrorMessage(error, 'No se pudo cargar el comprobante'))
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
  }, [comprobanteId, mode, token])

  const title = useMemo(() => (comprobante ? `${comprobante.numero} · ${comprobante.concepto}` : 'Comprobante'), [comprobante])

  return (
    <ProtectedRoute allowedRoles={mode === 'neighbor' ? ['ROLE_VECINO'] : ['ROLE_ADMIN', 'ROLE_OPERADOR']}>
      <div className="min-h-screen bg-zinc-100 print:bg-white">
        <style jsx global>{`
          @page {
            size: A4;
            margin: 8mm;
          }

          @media print {
            html,
            body {
              background: white !important;
            }

            * {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
          }
        `}</style>
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-4 print:hidden">
          <div>
            <p className="text-sm text-muted-foreground">Vista imprimible</p>
            <h1 className="text-lg font-semibold text-foreground">{title}</h1>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => window.close()}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Cerrar
            </Button>
            <Button variant="outline" onClick={() => window.print()}>
              <Printer className="mr-2 h-4 w-4" />
              Imprimir
            </Button>
            <Button onClick={() => window.print()}>
              <Download className="mr-2 h-4 w-4" />
              Guardar PDF
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex min-h-[70vh] items-center justify-center text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : pageError ? (
          <div className="mx-auto max-w-3xl px-4 py-12">
            <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {pageError}
            </div>
          </div>
        ) : !comprobante ? null : (
          <div className="mx-auto max-w-4xl p-4 print:max-w-none print:p-0">
            <div className="rounded-2xl border border-zinc-300 bg-white p-8 shadow-sm print:rounded-none print:border-0 print:p-3 print:shadow-none">
              <header className="border-b border-zinc-300 pb-6 print:pb-2">
                <div className="flex items-start justify-between gap-6">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.35em] text-sky-700">Centro Vecinal</p>
                    <h2 className="mt-2 text-3xl font-bold tracking-tight text-zinc-900 print:text-lg">Comprobante</h2>
                    <p className="mt-2 max-w-xl text-sm text-zinc-600 print:mt-1 print:text-[10px] print:leading-4">
                      Documento interno emitido por el Centro Vecinal para registrar pagos, ingresos y operaciones administrativas.
                    </p>
                  </div>
                  <div className="min-w-52 rounded-xl border border-zinc-300 bg-zinc-50 p-4 text-right print:min-w-40 print:p-2">
                    <p className="text-xs uppercase tracking-[0.25em] text-zinc-500">Número</p>
                    <p className="mt-2 text-2xl font-semibold text-zinc-900 print:text-lg">{comprobante.numero}</p>
                    <p className="mt-3 text-sm text-zinc-600 print:mt-1 print:text-[10px]">Emitido: {comprobante.fechaEmision}</p>
                  </div>
                </div>
              </header>

              <section className="mt-8 grid gap-6 md:grid-cols-[1.4fr_1fr] print:mt-3 print:gap-3">
                <div className="space-y-6 print:space-y-2">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.25em] text-zinc-500">Concepto</p>
                    <p className="mt-2 text-2xl font-semibold text-zinc-900 print:mt-1 print:text-base">{comprobante.concepto}</p>
                  </div>
                  {comprobante.descripcion && (
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-zinc-500">Descripción</p>
                      <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-zinc-700 print:mt-1 print:text-[10px] print:leading-4">{comprobante.descripcion}</p>
                    </div>
                  )}
                </div>
                <div className="rounded-xl border border-zinc-300 bg-zinc-50 p-5 print:p-2.5">
                  <p className="text-xs font-semibold uppercase tracking-[0.25em] text-zinc-500">Resumen</p>
                  <dl className="mt-4 space-y-3 text-sm print:mt-2 print:space-y-1.5 print:text-[10px]">
                    <div className="flex items-center justify-between gap-3">
                      <dt className="text-zinc-500">Tipo</dt>
                      <dd className="font-medium text-zinc-900">{tipoLabelMap[comprobante.tipo]}</dd>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <dt className="text-zinc-500">Origen</dt>
                      <dd className="font-medium text-zinc-900">{origenLabelMap[comprobante.origen]}</dd>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <dt className="text-zinc-500">Estado</dt>
                      <dd className="font-medium text-zinc-900">{comprobante.estado === 'emitido' ? 'Emitido' : 'Anulado'}</dd>
                    </div>
                    <div className="flex items-center justify-between gap-3 border-t border-zinc-300 pt-3 print:pt-2">
                      <dt className="text-zinc-500">Monto</dt>
                      <dd className="text-xl font-bold text-zinc-950 print:text-base">{formatCurrency(comprobante.monto)}</dd>
                    </div>
                  </dl>
                </div>
              </section>

              <section className="mt-8 grid gap-6 md:grid-cols-2 print:mt-3 print:gap-3">
                <div className="rounded-xl border border-zinc-300 p-5 print:p-2.5">
                  <p className="text-xs font-semibold uppercase tracking-[0.25em] text-zinc-500">Pagador</p>
                  <div className="mt-4 space-y-3 text-sm print:mt-2 print:space-y-1.5 print:text-[10px]">
                    <div>
                      <p className="text-zinc-500">Nombre</p>
                      <p className="mt-1 font-medium text-zinc-900">{comprobante.nombrePagador}</p>
                    </div>
                    <div>
                      <p className="text-zinc-500">DNI</p>
                      <p className="mt-1 font-medium text-zinc-900">{comprobante.dniPagador || 'Sin informar'}</p>
                    </div>
                    <div>
                      <p className="text-zinc-500">Socio vinculado</p>
                      <p className="mt-1 font-medium text-zinc-900">{comprobante.socioNombreCompleto || 'Sin socio asociado'}</p>
                    </div>
                  </div>
                </div>
                <div className="rounded-xl border border-zinc-300 p-5 print:p-2.5">
                  <p className="text-xs font-semibold uppercase tracking-[0.25em] text-zinc-500">Datos administrativos</p>
                  <div className="mt-4 space-y-3 text-sm print:mt-2 print:space-y-1.5 print:text-[10px]">
                    <div>
                      <p className="text-zinc-500">Medio de pago</p>
                      <p className="mt-1 font-medium text-zinc-900">{comprobante.medioPago || 'Sin informar'}</p>
                    </div>
                    <div>
                      <p className="text-zinc-500">Referencia</p>
                      <p className="mt-1 font-medium text-zinc-900">{comprobante.referenciaOrigenId || 'Sin referencia'}</p>
                    </div>
                    <div>
                      <p className="text-zinc-500">Emitido por</p>
                      <p className="mt-1 font-medium text-zinc-900">{comprobante.createdByUsername}</p>
                    </div>
                  </div>
                </div>
              </section>

              <section className="mt-8 rounded-xl border border-zinc-300 bg-zinc-50 p-5 print:mt-3 print:p-2.5">
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-zinc-500">Observaciones</p>
                <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-zinc-700 print:mt-1 print:text-[10px] print:leading-4">
                  {comprobante.observaciones || 'Sin observaciones adicionales.'}
                </p>
              </section>

              <footer className="mt-12 grid gap-8 border-t border-zinc-300 pt-8 print:mt-3 print:gap-4 print:pt-2 md:grid-cols-2">
                <div>
                  <div className="h-8 border-b-2 border-zinc-500" />
                  <p className="mt-1 text-sm text-zinc-600 print:text-[10px]">Firma responsable</p>
                </div>
                <div>
                  <div className="h-8 border-b-2 border-zinc-500" />
                  <p className="mt-1 text-sm text-zinc-600 print:text-[10px]">Aclaración / recepción</p>
                </div>
              </footer>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  )
}
