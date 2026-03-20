import { ComprobantePrintView } from '@/components/comprobantes/comprobante-print-view'

export default async function NeighborPagoComprobantePage({
  params,
}: {
  params: Promise<{ cuotaId: string }>
}) {
  const { cuotaId } = await params

  return <ComprobantePrintView comprobanteId={cuotaId} mode="neighbor" />
}
