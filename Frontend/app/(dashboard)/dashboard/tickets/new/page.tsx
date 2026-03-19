'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { DashboardHeader } from '@/components/dashboard/dashboard-header'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { FieldGroup, Field, FieldLabel } from '@/components/ui/field'
import { createTicket, fetchTicketCategories, getReadableErrorMessage, uploadTicketAttachment } from '@/lib/api'
import { formatFileSize, optimizeImagesForUpload } from '@/lib/image-upload'
import type { TicketCategoryOption } from '@/lib/types'
import { useAuth } from '@/hooks/use-auth'
import { Loader2, Upload, X } from 'lucide-react'
import { toast } from 'sonner'

export default function NewTicketPage() {
  const router = useRouter()
  const { token } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [isProcessingImages, setIsProcessingImages] = useState(false)
  const [isLoadingCategories, setIsLoadingCategories] = useState(true)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [location, setLocation] = useState('')
  const [images, setImages] = useState<File[]>([])
  const [categories, setCategories] = useState<TicketCategoryOption[]>([])

  useEffect(() => {
    if (!token) {
      return
    }

    let cancelled = false

    async function loadCategories() {
      try {
        setIsLoadingCategories(true)
        const nextCategories = await fetchTicketCategories(token)

        if (!cancelled) {
          setCategories(nextCategories)
        }
      } catch (error) {
        if (!cancelled) {
          toast.error(error instanceof Error ? error.message : 'No se pudieron cargar las categorías')
        }
      } finally {
        if (!cancelled) {
          setIsLoadingCategories(false)
        }
      }
    }

    void loadCategories()

    return () => {
      cancelled = true
    }
  }, [token])

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) {
      return
    }

    try {
      setIsProcessingImages(true)
      const optimizedImages = await optimizeImagesForUpload(Array.from(files))
      setImages((current) => [...current, ...optimizedImages])
      toast.success('Imagenes optimizadas y listas para subir')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'No se pudieron preparar las imagenes')
    } finally {
      setIsProcessingImages(false)
      e.target.value = ''
    }
  }

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!token) {
      toast.error('No hay una sesión activa')
      return
    }

    if (!categoryId) {
      toast.error('Por favor selecciona una categoría')
      return
    }

    try {
      setIsLoading(true)

      const createdTicket = await createTicket(token, {
        title,
        description,
        location,
        categoryId: Number(categoryId),
      })

      if (images.length > 0) {
        let failedUploads = 0

        for (const image of images) {
          try {
            await uploadTicketAttachment(token, createdTicket.id, image)
          } catch (error) {
            failedUploads += 1
            toast.error(`No se pudo subir ${image.name}: ${getReadableErrorMessage(error, 'Error de carga')}`)
          }
        }

        if (failedUploads === 0) {
          toast.success('Reclamo creado con imagenes')
        } else if (failedUploads === images.length) {
          toast.warning('El reclamo se creo, pero no se pudo subir ninguna imagen.')
        } else {
          toast.warning(`El reclamo se creo, pero ${failedUploads} imagen(es) no se pudieron subir.`)
        }
      } else {
        toast.success('Reclamo creado exitosamente')
      }

      router.push('/dashboard/tickets')
      router.refresh()
    } catch (error) {
      toast.error(getReadableErrorMessage(error, 'No se pudo crear el reclamo'))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <DashboardHeader title="Crear Reclamo" description="Completa el formulario para enviar un nuevo reclamo" />
      <main className="flex-1 p-4 md:p-6">
        <Card className="bg-card border-border max-w-2xl">
          <CardHeader>
            <CardTitle className="text-foreground">Nuevo Reclamo</CardTitle>
            <CardDescription className="text-muted-foreground">
              Proporciona todos los detalles sobre el problema que deseas reportar
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="title">Título del reclamo</FieldLabel>
                  <Input
                    id="title"
                    placeholder="Ej: Farola apagada en calle principal"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    className="bg-secondary border-border"
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="category">Categoría</FieldLabel>
                  <Select value={categoryId} onValueChange={setCategoryId} disabled={isLoadingCategories}>
                    <SelectTrigger id="category" className="bg-secondary border-border">
                      <SelectValue placeholder={isLoadingCategories ? 'Cargando categorías...' : 'Selecciona una categoría'} />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border">
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={String(cat.id)}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>

                <Field>
                  <FieldLabel htmlFor="location">Ubicación</FieldLabel>
                  <Input
                    id="location"
                    placeholder="Ej: Calle San Martín 1234"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    required
                    className="bg-secondary border-border"
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="description">Descripción</FieldLabel>
                  <Textarea
                    id="description"
                    placeholder="Describe el problema con el mayor detalle posible..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                    rows={5}
                    className="bg-secondary border-border resize-none"
                  />
                </Field>

                <Field>
                  <FieldLabel>Imágenes (opcional)</FieldLabel>
                  <div className="space-y-4">
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary/50 transition-colors bg-secondary/50">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground">
                          Haz clic para subir imágenes
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Se optimizan antes de subir. Maximo 10 MB por imagen.
                        </p>
                      </div>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/jpeg,image/png,image/webp"
                        multiple
                        onChange={handleImageChange}
                      />
                    </label>

                    {isProcessingImages && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Optimizando imagenes...
                      </div>
                    )}
                    
                    {images.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {images.map((file, index) => (
                          <div
                            key={index}
                            className="relative group flex items-center gap-2 bg-secondary rounded-lg p-2 pr-8"
                          >
                            <div className="min-w-0">
                              <p className="text-sm text-foreground truncate max-w-[180px]">
                                {file.name}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {formatFileSize(file.size)}
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-destructive"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </Field>
              </FieldGroup>

              <div className="flex justify-end gap-4 mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={isLoading || isProcessingImages}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Enviando...
                    </>
                  ) : isProcessingImages ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Preparando imagenes...
                    </>
                  ) : (
                    'Crear Reclamo'
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </>
  )
}
