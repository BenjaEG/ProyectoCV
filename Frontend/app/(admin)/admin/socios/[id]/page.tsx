import { SocioDetailContent } from '@/components/socios/socio-detail-content'

type Props = {
  params: Promise<{ id: string }>
}

export default async function AdminSocioDetailPage({ params }: Props) {
  const { id } = await params
  return <SocioDetailContent section="admin" socioId={id} />
}
