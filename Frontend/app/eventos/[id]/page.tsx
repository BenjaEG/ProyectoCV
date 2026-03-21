import { notFound } from 'next/navigation'
import { PublicFooter } from '@/components/layout/public-footer'
import { PublicNavbar } from '@/components/layout/public-navbar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { fetchPublicEventDetail, fetchPublicInstitutionSettings } from '@/lib/api'
import { CalendarDays, Clock, MapPin } from 'lucide-react'

export const dynamic = 'force-dynamic'

type EventDetailPageProps = {
  params: Promise<{ id: string }>
}

export default async function EventDetailPage({ params }: EventDetailPageProps) {
  const { id } = await params

  try {
    const [event, institutionSettings] = await Promise.all([
      fetchPublicEventDetail(id),
      fetchPublicInstitutionSettings(),
    ])

    return (
      <div className="flex min-h-screen flex-col bg-background text-foreground">
        <PublicNavbar centerName={institutionSettings.nombreCentroVecinal} />
        <main className="container mx-auto flex-1 px-4 py-16">
          <Card className="mx-auto max-w-4xl border-border bg-card">
            <CardHeader className="space-y-5">
              <CardTitle className="text-3xl font-semibold tracking-tight md:text-4xl">{event.title}</CardTitle>
              <p className="text-lg leading-relaxed text-muted-foreground">{event.copete}</p>
              <div className="grid gap-3 text-sm text-muted-foreground md:grid-cols-3">
                <div className="flex items-center gap-2">
                  <CalendarDays className="h-4 w-4" />
                  <span>
                    {new Date(`${event.date}T00:00:00`).toLocaleDateString('es-AR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>{event.time} hs</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span>{event.location}</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="whitespace-pre-line text-[15px] leading-8 text-foreground/95">{event.description}</div>
            </CardContent>
          </Card>
        </main>
        <PublicFooter centerName={institutionSettings.nombreCentroVecinal} />
      </div>
    )
  } catch {
    notFound()
  }
}
