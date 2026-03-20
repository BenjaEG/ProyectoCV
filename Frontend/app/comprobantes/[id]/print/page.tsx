import { ComprobantePrintView } from '@/components/comprobantes/comprobante-print-view'

export default async function ComprobantePrintPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return <ComprobantePrintView comprobanteId={id} />
}
