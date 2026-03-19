'use client'

import { useEffect, useState } from 'react'
import { DashboardHeader } from '@/components/dashboard/dashboard-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Label } from '@/components/ui/label'
import { Plus, Pencil, Trash2, Newspaper, CalendarDays, ImageIcon } from 'lucide-react'
import type { NewsItem, Event } from '@/lib/types'
import {
  createEvent,
  createNews,
  deleteEvent,
  deleteNews,
  fetchAdminEvents,
  fetchAdminNews,
  updateEvent,
  updateNews,
} from '@/lib/api'
import { useAuth } from '@/hooks/use-auth'
import { toast } from 'sonner'

type NewsFormData = Omit<NewsItem, 'id' | 'createdAt' | 'updatedAt'>
type EventFormData = Omit<Event, 'id'>

export default function ContentManagementPage() {
  const { token, initialized } = useAuth()
  const [news, setNews] = useState<NewsItem[]>([])
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const [newsDialogOpen, setNewsDialogOpen] = useState(false)
  const [editingNews, setEditingNews] = useState<NewsItem | null>(null)
  const [newsForm, setNewsForm] = useState<NewsFormData>({
    title: '',
    copete: '',
    content: '',
    image: '',
    published: false,
  })
  const [eventDialogOpen, setEventDialogOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState<Event | null>(null)
  const [eventForm, setEventForm] = useState<EventFormData>({
    title: '',
    copete: '',
    description: '',
    date: '',
    time: '',
    location: '',
    image: '',
  })
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<{ type: 'news' | 'event'; id: string } | null>(null)

  useEffect(() => {
    if (!initialized || !token) {
      return
    }

    let cancelled = false

    async function loadContent() {
      try {
        setLoading(true)
        const [newsItems, eventItems] = await Promise.all([
          fetchAdminNews(token),
          fetchAdminEvents(token),
        ])

        if (!cancelled) {
          setNews(newsItems)
          setEvents(eventItems)
        }
      } catch (error) {
        if (!cancelled) {
          toast.error(error instanceof Error ? error.message : 'No se pudo cargar el contenido')
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    void loadContent()

    return () => {
      cancelled = true
    }
  }, [initialized, token])

  const openNewsDialog = (item?: NewsItem) => {
    if (item) {
      setEditingNews(item)
      setNewsForm({
        title: item.title,
        copete: item.copete,
        content: item.content,
        image: item.image || '',
        published: item.published,
      })
    } else {
      setEditingNews(null)
      setNewsForm({ title: '', copete: '', content: '', image: '', published: false })
    }
    setNewsDialogOpen(true)
  }

  const handleNewsSubmit = async () => {
    if (!newsForm.title || !newsForm.copete || !newsForm.content) {
      toast.error('Por favor complete todos los campos requeridos')
      return
    }

    if (!token) {
      toast.error('Sesion no disponible')
      return
    }

    try {
      setSubmitting(true)

      if (editingNews) {
        const updatedItem = await updateNews(token, editingNews.id, newsForm)
        setNews(news.map((item) => (item.id === editingNews.id ? updatedItem : item)))
        toast.success('Noticia actualizada correctamente')
      } else {
        const createdItem = await createNews(token, newsForm)
        setNews([createdItem, ...news])
        toast.success('Noticia creada correctamente')
      }

      setNewsDialogOpen(false)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'No se pudo guardar la noticia')
    } finally {
      setSubmitting(false)
    }
  }

  const openEventDialog = (item?: Event) => {
    if (item) {
      setEditingEvent(item)
      setEventForm({
        title: item.title,
        copete: item.copete,
        description: item.description,
        date: item.date,
        time: item.time,
        location: item.location,
        image: item.image || '',
      })
    } else {
      setEditingEvent(null)
      setEventForm({ title: '', copete: '', description: '', date: '', time: '', location: '', image: '' })
    }
    setEventDialogOpen(true)
  }

  const handleEventSubmit = async () => {
    if (!eventForm.title || !eventForm.copete || !eventForm.description || !eventForm.date || !eventForm.time || !eventForm.location) {
      toast.error('Por favor complete todos los campos requeridos')
      return
    }

    if (!token) {
      toast.error('Sesion no disponible')
      return
    }

    try {
      setSubmitting(true)

      if (editingEvent) {
        const updatedItem = await updateEvent(token, editingEvent.id, eventForm)
        setEvents(events.map((item) => (item.id === editingEvent.id ? updatedItem : item)))
        toast.success('Evento actualizado correctamente')
      } else {
        const createdItem = await createEvent(token, eventForm)
        setEvents([createdItem, ...events])
        toast.success('Evento creado correctamente')
      }

      setEventDialogOpen(false)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'No se pudo guardar el evento')
    } finally {
      setSubmitting(false)
    }
  }

  const confirmDelete = (type: 'news' | 'event', id: string) => {
    setItemToDelete({ type, id })
    setDeleteDialogOpen(true)
  }

  const handleDelete = async () => {
    if (!itemToDelete || !token) {
      return
    }

    try {
      setSubmitting(true)

      if (itemToDelete.type === 'news') {
        await deleteNews(token, itemToDelete.id)
        setNews(news.filter((item) => item.id !== itemToDelete.id))
        toast.success('Noticia eliminada correctamente')
      } else {
        await deleteEvent(token, itemToDelete.id)
        setEvents(events.filter((item) => item.id !== itemToDelete.id))
        toast.success('Evento eliminado correctamente')
      }

      setDeleteDialogOpen(false)
      setItemToDelete(null)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'No se pudo eliminar el contenido')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <DashboardHeader 
        title="Gestión de Contenido" 
        description="Administra noticias y eventos del barrio"
      />
      <main className="flex-1 p-6 md:p-8">
        <Tabs defaultValue="news" className="space-y-6">
          <TabsList className="bg-secondary">
            <TabsTrigger value="news" className="gap-2">
              <Newspaper className="h-4 w-4" />
              Noticias
            </TabsTrigger>
            <TabsTrigger value="events" className="gap-2">
              <CalendarDays className="h-4 w-4" />
              Eventos
            </TabsTrigger>
          </TabsList>

          {/* News Tab */}
          <TabsContent value="news">
            <Card className="bg-card border-border">
              <CardHeader className="flex flex-row items-center justify-between pb-6">
                <CardTitle className="text-xl font-semibold tracking-tight text-foreground">
                  Noticias
                </CardTitle>
                <Button onClick={() => openNewsDialog()} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Nueva Noticia
                </Button>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg border border-border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-border hover:bg-transparent">
                        <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Título</TableHead>
                        <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground hidden md:table-cell">Fecha</TableHead>
                        <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Estado</TableHead>
                        <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground text-right">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {!loading && news.length === 0 ? (
                        <TableRow className="border-border">
                          <TableCell colSpan={4} className="py-10 text-center text-muted-foreground">
                            No hay noticias cargadas.
                          </TableCell>
                        </TableRow>
                      ) : null}
                      {news.map((item) => (
                        <TableRow key={item.id} className="border-border">
                          <TableCell className="py-4">
                            <div className="flex items-center gap-3">
                              {item.image ? (
                                <div className="h-10 w-10 rounded bg-secondary flex items-center justify-center overflow-hidden">
                                  <ImageIcon className="h-5 w-5 text-muted-foreground" />
                                </div>
                              ) : (
                                <div className="h-10 w-10 rounded bg-secondary flex items-center justify-center">
                                  <Newspaper className="h-5 w-5 text-muted-foreground" />
                                </div>
                              )}
                              <span className="font-medium text-[15px] text-foreground">{item.title}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground hidden md:table-cell py-4">
                            {new Date(item.createdAt).toLocaleDateString('es-AR', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </TableCell>
                          <TableCell className="py-4">
                            <Badge variant={item.published ? 'default' : 'secondary'}>
                              {item.published ? 'Publicado' : 'Borrador'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right py-4">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => openNewsDialog(item)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-destructive hover:text-destructive"
                                onClick={() => confirmDelete('news', item.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Events Tab */}
          <TabsContent value="events">
            <Card className="bg-card border-border">
              <CardHeader className="flex flex-row items-center justify-between pb-6">
                <CardTitle className="text-xl font-semibold tracking-tight text-foreground">
                  Eventos
                </CardTitle>
                <Button onClick={() => openEventDialog()} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Nuevo Evento
                </Button>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg border border-border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-border hover:bg-transparent">
                        <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Título</TableHead>
                        <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground hidden md:table-cell">Fecha</TableHead>
                        <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground hidden lg:table-cell">Ubicación</TableHead>
                        <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground text-right">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {!loading && events.length === 0 ? (
                        <TableRow className="border-border">
                          <TableCell colSpan={4} className="py-10 text-center text-muted-foreground">
                            No hay eventos cargados.
                          </TableCell>
                        </TableRow>
                      ) : null}
                      {events.map((item) => (
                        <TableRow key={item.id} className="border-border">
                          <TableCell className="py-4">
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded bg-primary/10 flex flex-col items-center justify-center">
                                <span className="text-sm font-bold text-primary leading-none">
                                  {new Date(item.date).getDate()}
                                </span>
                                <span className="text-[10px] text-primary uppercase">
                                  {new Date(item.date).toLocaleDateString('es-AR', { month: 'short' })}
                                </span>
                              </div>
                              <span className="font-medium text-[15px] text-foreground">{item.title}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground hidden md:table-cell py-4">
                            {new Date(item.date).toLocaleDateString('es-AR', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })} - {item.time} hs
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground hidden lg:table-cell py-4">
                            {item.location}
                          </TableCell>
                          <TableCell className="text-right py-4">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => openEventDialog(item)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-destructive hover:text-destructive"
                                onClick={() => confirmDelete('event', item.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* News Dialog */}
        <Dialog open={newsDialogOpen} onOpenChange={setNewsDialogOpen}>
          <DialogContent className="flex max-h-[90vh] flex-col overflow-hidden bg-card border-border sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold tracking-tight text-foreground">
                {editingNews ? 'Editar Noticia' : 'Nueva Noticia'}
              </DialogTitle>
              <DialogDescription className="text-muted-foreground">
                {editingNews ? 'Modifica los datos de la noticia.' : 'Complete los datos para crear una nueva noticia.'}
              </DialogDescription>
            </DialogHeader>
            <div className="grid max-h-[calc(90vh-11rem)] gap-5 overflow-y-auto py-4 pr-2">
              <div className="grid gap-2">
                <Label htmlFor="news-title">Título *</Label>
                <Input
                  id="news-title"
                  value={newsForm.title}
                  onChange={(e) => setNewsForm({ ...newsForm, title: e.target.value })}
                  placeholder="Título de la noticia"
                  className="bg-secondary border-border"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="news-copete">Copete *</Label>
                <Input
                  id="news-copete"
                  value={newsForm.copete}
                  onChange={(e) => setNewsForm({ ...newsForm, copete: e.target.value.slice(0, 100) })}
                  placeholder="Resumen breve de hasta 100 caracteres"
                  className="bg-secondary border-border"
                  maxLength={100}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="news-content">Contenido *</Label>
                <Textarea
                  id="news-content"
                  value={newsForm.content}
                  onChange={(e) => setNewsForm({ ...newsForm, content: e.target.value })}
                  placeholder="Contenido de la noticia..."
                  rows={5}
                  className="bg-secondary border-border resize-none"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="news-image">URL de Imagen (opcional)</Label>
                <Input
                  id="news-image"
                  value={newsForm.image}
                  onChange={(e) => setNewsForm({ ...newsForm, image: e.target.value })}
                  placeholder="https://ejemplo.com/imagen.jpg"
                  className="bg-secondary border-border"
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="news-published">Publicar</Label>
                  <p className="text-sm text-muted-foreground">
                    Hacer visible la noticia en el sitio
                  </p>
                </div>
                <Switch
                  id="news-published"
                  checked={newsForm.published}
                  onCheckedChange={(checked) => setNewsForm({ ...newsForm, published: checked })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setNewsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={() => void handleNewsSubmit()} disabled={submitting}>
                {editingNews ? 'Guardar Cambios' : 'Crear Noticia'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Event Dialog */}
        <Dialog open={eventDialogOpen} onOpenChange={setEventDialogOpen}>
          <DialogContent className="flex max-h-[90vh] flex-col overflow-hidden bg-card border-border sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold tracking-tight text-foreground">
                {editingEvent ? 'Editar Evento' : 'Nuevo Evento'}
              </DialogTitle>
              <DialogDescription className="text-muted-foreground">
                {editingEvent ? 'Modifica los datos del evento.' : 'Complete los datos para crear un nuevo evento.'}
              </DialogDescription>
            </DialogHeader>
            <div className="grid max-h-[calc(90vh-11rem)] gap-5 overflow-y-auto py-4 pr-2">
              <div className="grid gap-2">
                <Label htmlFor="event-title">Título *</Label>
                <Input
                  id="event-title"
                  value={eventForm.title}
                  onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                  placeholder="Título del evento"
                  className="bg-secondary border-border"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="event-copete">Copete *</Label>
                <Input
                  id="event-copete"
                  value={eventForm.copete}
                  onChange={(e) => setEventForm({ ...eventForm, copete: e.target.value.slice(0, 100) })}
                  placeholder="Resumen breve de hasta 100 caracteres"
                  className="bg-secondary border-border"
                  maxLength={100}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="event-description">Descripción *</Label>
                <Textarea
                  id="event-description"
                  value={eventForm.description}
                  onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                  placeholder="Descripción del evento..."
                  rows={3}
                  className="bg-secondary border-border resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="event-date">Fecha *</Label>
                  <Input
                    id="event-date"
                    type="date"
                    value={eventForm.date}
                    onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })}
                    className="bg-secondary border-border"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="event-time">Hora *</Label>
                  <Input
                    id="event-time"
                    type="time"
                    value={eventForm.time}
                    onChange={(e) => setEventForm({ ...eventForm, time: e.target.value })}
                    className="bg-secondary border-border"
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="event-location">Ubicación *</Label>
                <Input
                  id="event-location"
                  value={eventForm.location}
                  onChange={(e) => setEventForm({ ...eventForm, location: e.target.value })}
                  placeholder="Lugar del evento"
                  className="bg-secondary border-border"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="event-image">URL de Imagen (opcional)</Label>
                <Input
                  id="event-image"
                  value={eventForm.image}
                  onChange={(e) => setEventForm({ ...eventForm, image: e.target.value })}
                  placeholder="https://ejemplo.com/imagen.jpg"
                  className="bg-secondary border-border"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEventDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={() => void handleEventSubmit()} disabled={submitting}>
                {editingEvent ? 'Guardar Cambios' : 'Crear Evento'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent className="bg-card border-border">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-foreground">
                Confirmar eliminación
              </AlertDialogTitle>
              <AlertDialogDescription className="text-muted-foreground">
                ¿Estás seguro de que deseas eliminar {itemToDelete?.type === 'news' ? 'esta noticia' : 'este evento'}? 
                Esta acción no se puede deshacer.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => void handleDelete()}
                disabled={submitting}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Eliminar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </main>
    </>
  )
}
