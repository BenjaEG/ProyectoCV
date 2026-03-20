import { ComprobanteDetailContent } from '@/components/comprobantes/comprobante-detail-content'

export default async function AdminComprobanteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return <ComprobanteDetailContent section="admin" comprobanteId={id} />
}
