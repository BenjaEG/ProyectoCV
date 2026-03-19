import { Badge } from '@/components/ui/badge'
import { TICKET_CATEGORIES, type TicketCategory } from '@/lib/types'
import { cn } from '@/lib/utils'
import { 
  Lightbulb, 
  Trash2, 
  Construction, 
  Shield, 
  HelpCircle 
} from 'lucide-react'

const categoryIcons: Record<TicketCategory, React.ReactNode> = {
  lighting: <Lightbulb className="h-3 w-3" />,
  garbage: <Trash2 className="h-3 w-3" />,
  streets: <Construction className="h-3 w-3" />,
  security: <Shield className="h-3 w-3" />,
  other: <HelpCircle className="h-3 w-3" />,
}

interface CategoryBadgeProps {
  category: TicketCategory
  className?: string
}

export function CategoryBadge({ category, className }: CategoryBadgeProps) {
  const categoryConfig = TICKET_CATEGORIES.find((c) => c.value === category)

  if (!categoryConfig) return null

  return (
    <Badge
      variant="outline"
      className={cn('gap-1', className)}
    >
      {categoryIcons[category]}
      {categoryConfig.label}
    </Badge>
  )
}
