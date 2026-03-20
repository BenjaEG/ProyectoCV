import { ComprobanteDetailContent } from '@/components/comprobantes/comprobante-detail-content'

export default async function StaffComprobanteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return <ComprobanteDetailContent section="staff" comprobanteId={id} />
}
