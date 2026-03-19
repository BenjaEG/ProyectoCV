import { MapPinned } from 'lucide-react'

export function PublicFooter() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="container mx-auto px-4 py-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <MapPinned className="h-6 w-6 text-primary" />
            <span className="font-semibold tracking-tight text-foreground">Centro Vecinal Barrio Inaudi</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Centro Vecinal Barrio Inaudi. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  )
}
