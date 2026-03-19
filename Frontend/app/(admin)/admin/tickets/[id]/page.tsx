import { use } from 'react'
import { TicketManagementDetail } from '@/components/tickets/ticket-management-detail'

export default function AdminTicketDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)

  return <TicketManagementDetail ticketId={id} />
}
