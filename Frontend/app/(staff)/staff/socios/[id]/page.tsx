import { SocioDetailContent } from '@/components/socios/socio-detail-content'

type Props = {
  params: Promise<{ id: string }>
}

export default async function StaffSocioDetailPage({ params }: Props) {
  const { id } = await params
  return <SocioDetailContent section="staff" socioId={id} />
}
