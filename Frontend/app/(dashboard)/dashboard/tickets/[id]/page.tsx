'use client'

import { useEffect, useState, use } from 'react'
import { DashboardHeader } from '@/components/dashboard/dashboard-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { StatusBadge } from '@/components/tickets/status-badge'
import { CategoryBadge } from '@/components/tickets/category-badge'
import { TicketAttachmentsGallery } from '@/components/tickets/ticket-attachments-gallery'
import { MapPin, Calendar, User, Loader2, MessageSquare } from 'lucide-react'
import { toast } from 'sonner'
import { notFound } from 'next/navigation'
import type { Comment, Ticket } from '@/lib/types'
import { createTicketComment, fetchNeighborTicketDetail, getReadableErrorMessage } from '@/lib/api'
import { useAuth } from '@/hooks/use-auth'

export default function TicketDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { token, roles } = useAuth()
  const { id } = use(params)
  const [ticket, setTicket] = useState<Ticket | null>(null)
  const [isMissing, setIsMissing] = useState(false)
  const [hasLoadError, setHasLoadError] = useState(false)
  const [comment, setComment] = useState('')
  const [comments, setComments] = useState<Comment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmittingComment, setIsSubmittingComment] = useState(false)

  useEffect(() => {
    if (!token) {
      return
    }

    let cancelled = false

    async function loadTicket() {
      try {
        setIsLoading(true)
        setHasLoadError(false)
        setIsMissing(false)
        const response = await fetchNeighborTicketDetail(token, id, roles)

        if (cancelled) {
          return
        }

        setTicket(response.ticket)
        setComments(response.comments)
        } catch (error) {
        if (!cancelled) {
          const message = getReadableErrorMessage(error, 'No se pudo cargar el reclamo')

          const missing = message.toLowerCase().includes('not found') || message.toLowerCase().includes('no encontrado')
          setIsMissing(missing)
          setHasLoadError(!missing)
          toast.error(message)
          setTicket(null)
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    void loadTicket()

    return () => {
      cancelled = true
    }
  }, [id, roles, token])

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!token) {
      toast.error('No hay una sesión activa')
      return
    }

    if (!comment.trim()) return

    try {
      setIsSubmittingComment(true)
      const newComment = await createTicketComment(token, id, comment, roles)
      setComments((currentComments) => [...currentComments, newComment])
      setComment('')
      toast.success('Comentario agregado')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'No se pudo agregar el comentario')
    } finally {
      setIsSubmittingComment(false)
    }
  }

  if (isMissing) {
    notFound()
  }

  return (
    <>
      <DashboardHeader title={ticket?.ticketCode ?? 'Reclamo'} description={ticket?.title} />
      <main className="flex-1 p-4 md:p-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-16 text-muted-foreground">
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Cargando detalle del reclamo...
          </div>
        ) : hasLoadError || !ticket ? (
          <div className="rounded-lg border border-dashed border-border py-12 text-center text-muted-foreground">
            No se pudo cargar el reclamo.
          </div>
        ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-card border-border">
              <CardHeader>
                <div className="flex flex-wrap items-center gap-3">
                  <StatusBadge status={ticket.status} />
                  <CategoryBadge category={ticket.category} />
                </div>
                <CardTitle className="text-xl text-foreground mt-2">
                  {ticket.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-invert max-w-none">
                  <p className="text-muted-foreground whitespace-pre-wrap">
                    {ticket.description}
                  </p>
                </div>
              </CardContent>
            </Card>

            <TicketAttachmentsGallery imageUrls={ticket.images} token={token} />

            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Comentarios ({comments.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Comment List */}
                {comments.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">
                    No hay comentarios todavía
                  </p>
                ) : (
                  <div className="space-y-4">
                    {comments.map((c) => (
                      <div key={c.id} className="flex gap-4 p-4 bg-secondary/50 rounded-lg">
                        <Avatar className="h-10 w-10 shrink-0">
                          <AvatarFallback className="bg-primary text-primary-foreground">
                            {getInitials(c.userName)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-foreground">{c.userName}</span>
                            <span className="text-xs text-muted-foreground">
                              {new Date(c.createdAt).toLocaleDateString('es-AR')}
                            </span>
                          </div>
                          <p className="text-muted-foreground">{c.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <form onSubmit={handleSubmitComment} className="space-y-4">
                  <Textarea
                    placeholder="Escribe un comentario..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={3}
                    className="bg-secondary border-border resize-none"
                  />
                  <div className="flex justify-end">
                    <Button type="submit" disabled={isSubmittingComment || !comment.trim()}>
                      {isSubmittingComment ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Enviando...
                        </>
                      ) : (
                        'Agregar Comentario'
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-sm text-foreground">Información</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Ubicación</p>
                    <p className="text-foreground">{ticket.location}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <User className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Creado por</p>
                    <p className="text-foreground">{ticket.createdByName}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Fecha de creación</p>
                    <p className="text-foreground">
                      {new Date(ticket.createdAt).toLocaleDateString('es-AR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
                {ticket.assignedToName && (
                  <div className="flex items-start gap-3">
                    <User className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Asignado a</p>
                      <p className="text-foreground">{ticket.assignedToName}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
        )}
      </main>
    </>
  )
}
