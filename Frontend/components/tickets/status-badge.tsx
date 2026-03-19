import { Badge } from '@/components/ui/badge'
import { TICKET_STATUSES, type TicketStatus } from '@/lib/types'
import { cn } from '@/lib/utils'

interface StatusBadgeProps {
  status: TicketStatus
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const statusConfig = TICKET_STATUSES.find((s) => s.value === status)

  if (!statusConfig) return null

  return (
    <Badge
      className={cn(
        'text-white border-0',
        statusConfig.color,
        className
      )}
    >
      {statusConfig.label}
    </Badge>
  )
}
