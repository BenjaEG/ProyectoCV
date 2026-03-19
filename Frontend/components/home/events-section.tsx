import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { EventCards } from '@/components/home/event-cards'
import type { Event } from '@/lib/types'
import { CalendarDays } from 'lucide-react'

type EventsSectionProps = {
  items: Event[]
}

export function EventsSection({ items }: EventsSectionProps) {
  return (
    <section id="eventos" className="py-20">
      <div className="container mx-auto px-4">
        <div className="mb-10 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <CalendarDays className="h-8 w-8 text-primary" />
            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-foreground">Próximos Eventos</h2>
          </div>
          <Link href="/eventos">
            <Button variant="outline">Ver todos</Button>
          </Link>
        </div>

        <EventCards items={items} />
      </div>
    </section>
  )
}
