import { MapPinned } from 'lucide-react'

interface PublicFooterProps {
  centerName: string
}

export function PublicFooter({ centerName }: PublicFooterProps) {
  const fullName = `Centro Vecinal ${centerName}`

  return (
    <footer className="border-t border-border bg-card">
      <div className="container mx-auto px-4 py-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <MapPinned className="h-6 w-6 text-primary" />
            <span className="font-semibold tracking-tight text-foreground">{fullName}</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} {fullName}. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  )
}
