import { PublicFooter } from '@/components/layout/public-footer'
import { PublicNavbar } from '@/components/layout/public-navbar'
import { EventCards } from '@/components/home/event-cards'
import { fetchPublicEvents } from '@/lib/api'
import { CalendarDays } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function EventsPage() {
  const events = await fetchPublicEvents()

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <PublicNavbar />
      <main className="container mx-auto flex-1 px-4 py-16">
        <div className="mb-10 flex items-center gap-3">
          <CalendarDays className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">Todos los eventos</h1>
            <p className="mt-2 text-muted-foreground">Agenda de actividades y encuentros del barrio.</p>
          </div>
        </div>
        <EventCards items={events} />
      </main>
      <PublicFooter />
    </div>
  )
}
