'use client'

import { useEffect, useState } from 'react'
import { notFound } from 'next/navigation'
import { MapPin, Calendar, User, Loader2, MessageSquare } from 'lucide-react'
import { toast } from 'sonner'
import { DashboardHeader } from '@/components/dashboard/dashboard-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { StatusBadge } from '@/components/tickets/status-badge'
import { CategoryBadge } from '@/components/tickets/category-badge'
import { TicketAttachmentsGallery } from '@/components/tickets/ticket-attachments-gallery'
import { useAuth } from '@/hooks/use-auth'
import {
  createTicketComment,
  deleteTicketAttachment,
  fetchTicketDetail,
  getReadableErrorMessage,
  updateTicketStatus,
} from '@/lib/api'
import { TICKET_STATUSES, type Comment, type Ticket, type TicketStatus } from '@/lib/types'

interface TicketManagementDetailProps {
  ticketId: string
}

export function TicketManagementDetail({ ticketId }: TicketManagementDetailProps) {
  const { token, roles } = useAuth()
  const [ticket, setTicket] = useState<Ticket | null>(null)
  const [isMissing, setIsMissing] = useState(false)
  const [hasLoadError, setHasLoadError] = useState(false)
  const [comment, setComment] = useState('')
  const [comments, setComments] = useState<Comment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmittingComment, setIsSubmittingComment] = useState(false)
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)

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

        const response = await fetchTicketDetail(token, ticketId, roles)

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
  }, [roles, ticketId, token])

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const handleStatusChange = async (newStatus: TicketStatus) => {
    if (!token || !ticket || newStatus === ticket.status) {
      return
    }

    try {
      setIsUpdatingStatus(true)
      const updatedTicket = await updateTicketStatus(token, ticket.id, newStatus)
      setTicket(updatedTicket)
      toast.success(`Estado actualizado a ${TICKET_STATUSES.find((status) => status.value === newStatus)?.label}`)
    } catch (error) {
      toast.error(getReadableErrorMessage(error, 'No se pudo actualizar el estado'))
    } finally {
      setIsUpdatingStatus(false)
    }
  }

  const handleSubmitComment = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!token || !comment.trim() || !ticket) {
      return
    }

    try {
      setIsSubmittingComment(true)
      const newComment = await createTicketComment(token, ticket.id, comment, roles)
      setComments((currentComments) => [...currentComments, newComment])
      setComment('')
      toast.success('Respuesta agregada')
    } catch (error) {
      toast.error(getReadableErrorMessage(error, 'No se pudo agregar el comentario'))
    } finally {
      setIsSubmittingComment(false)
    }
  }

  const handleDeleteAttachment = async (attachmentUrl: string) => {
    if (!token || !ticket) {
      return
    }

    await deleteTicketAttachment(token, attachmentUrl)
    setTicket((currentTicket) => currentTicket
      ? { ...currentTicket, images: currentTicket.images.filter((imageUrl) => imageUrl !== attachmentUrl) }
      : currentTicket)
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
                  <CardTitle className="text-xl text-foreground mt-2">{ticket.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground whitespace-pre-wrap">{ticket.description}</p>
                </CardContent>
              </Card>

              <TicketAttachmentsGallery
                imageUrls={ticket.images}
                token={token}
                onDelete={handleDeleteAttachment}
              />

              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-foreground flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Comentarios ({comments.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {comments.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">No hay comentarios todavía</p>
                  ) : (
                    <div className="space-y-4">
                      {comments.map((currentComment) => (
                        <div key={currentComment.id} className="flex gap-4 rounded-lg bg-secondary/50 p-4">
                          <Avatar className="h-10 w-10 shrink-0">
                            <AvatarFallback className="bg-primary text-primary-foreground">
                              {getInitials(currentComment.userName)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="mb-1 flex items-center gap-2">
                              <span className="font-medium text-foreground">{currentComment.userName}</span>
                              <span className="text-xs text-muted-foreground">
                                {new Date(currentComment.createdAt).toLocaleDateString('es-AR')}
                              </span>
                            </div>
                            <p className="text-muted-foreground">{currentComment.content}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <form onSubmit={handleSubmitComment} className="space-y-4">
                    <Textarea
                      placeholder="Escribe una respuesta al vecino..."
                      value={comment}
                      onChange={(event) => setComment(event.target.value)}
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
                          'Enviar Respuesta'
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
                  <CardTitle className="text-sm text-foreground">Acciones</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="mb-2 block text-sm text-muted-foreground">Estado</label>
                    <Select value={ticket.status} onValueChange={(value) => void handleStatusChange(value as TicketStatus)}>
                      <SelectTrigger className="bg-secondary border-border" disabled={isUpdatingStatus}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-popover border-border">
                        {TICKET_STATUSES.map((status) => (
                          <SelectItem key={status.value} value={status.value}>
                            {status.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-sm text-foreground">Información</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3">
                    <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Ubicación</p>
                      <p className="text-foreground">{ticket.location}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <User className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Reportado por</p>
                      <p className="text-foreground">{ticket.createdByName}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Calendar className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Fecha</p>
                      <p className="text-foreground">
                        {new Date(ticket.createdAt).toLocaleDateString('es-AR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </main>
    </>
  )
}
