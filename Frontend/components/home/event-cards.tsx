import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { Event } from '@/lib/types'
import { Clock, MapPin } from 'lucide-react'

type EventCardsProps = {
  items: Event[]
}

export function EventCards({ items }: EventCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {items.map((event) => (
        <Link key={event.id} href={`/eventos/${event.id}`} className="block h-full">
          <Card className="flex h-full flex-col bg-card border-border transition-colors hover:border-primary/50">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-4">
                <CardTitle className="text-lg font-semibold tracking-tight text-foreground">
                  {event.title}
                </CardTitle>
                <div className="flex min-w-[64px] flex-col items-center justify-center rounded-lg bg-primary/10 p-2.5">
                  <span className="text-2xl font-bold tracking-tight text-primary">
                    {new Date(`${event.date}T00:00:00`).getDate()}
                  </span>
                  <span className="text-xs font-medium uppercase tracking-wide text-primary">
                    {new Date(`${event.date}T00:00:00`).toLocaleDateString('es-AR', { month: 'short' })}
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col gap-3">
              <p className="line-clamp-3 text-[15px] leading-relaxed text-muted-foreground">{event.copete}</p>
              <div className="mt-auto flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>{event.time} hs</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>{event.location}</span>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  )
}
