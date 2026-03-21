import type { InstitutionSettings } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Phone, Mail, MapPin, Clock } from 'lucide-react'

interface ContactSectionProps {
  settings: InstitutionSettings
}

export function ContactSection({ settings }: ContactSectionProps) {
  const mapUrl = settings.direccion
    ? `https://www.google.com/maps?q=${encodeURIComponent(settings.direccion)}&output=embed`
    : null

  return (
    <section id="contacto" className="py-20 bg-secondary/30">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-foreground mb-10">Contacto</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card className="bg-card border-border">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-semibold tracking-tight text-foreground">Información de Contacto</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <p className="text-sm leading-6 text-muted-foreground">{settings.descripcionContacto}</p>
              {settings.mostrarTelefono && settings.telefono && (
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-11 h-11 rounded-lg bg-primary/10">
                    <Phone className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Teléfono</p>
                    <p className="text-[15px] text-foreground mt-0.5">{settings.telefono}</p>
                  </div>
                </div>
              )}
              {settings.mostrarEmail && settings.email && (
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-11 h-11 rounded-lg bg-primary/10">
                    <Mail className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Email</p>
                    <p className="text-[15px] text-foreground mt-0.5">{settings.email}</p>
                  </div>
                </div>
              )}
              {settings.mostrarDireccion && settings.direccion && (
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-11 h-11 rounded-lg bg-primary/10">
                    <MapPin className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Dirección</p>
                    <p className="text-[15px] text-foreground mt-0.5">{settings.direccion}</p>
                  </div>
                </div>
              )}
              {settings.mostrarHorarioAtencion && settings.horarioAtencion && (
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-11 h-11 rounded-lg bg-primary/10">
                    <Clock className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Horario de Atención</p>
                    <p className="text-[15px] text-foreground mt-0.5">{settings.horarioAtencion}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-semibold tracking-tight text-foreground">Ubicación</CardTitle>
            </CardHeader>
            <CardContent>
              {mapUrl ? (
                <div className="aspect-video overflow-hidden rounded-lg border border-border">
                  <iframe
                    title="Mapa del Centro Vecinal"
                    src={mapUrl}
                    className="h-full w-full"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
              ) : (
                <div className="aspect-video bg-secondary rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">Aún no se configuró una dirección</p>
                    <p className="text-sm text-muted-foreground">El administrador puede cargarla desde Configuración</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
