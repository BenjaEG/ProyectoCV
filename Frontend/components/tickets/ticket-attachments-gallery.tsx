'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { Loader2, Image as ImageIcon, Trash2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { getReadableErrorMessage } from '@/lib/api'
import { toast } from 'sonner'

type TicketAttachmentsGalleryProps = {
  imageUrls: string[]
  token?: string
  onDelete?: (imageUrl: string) => Promise<void>
}

type AttachmentPreview = {
  src: string
  label: string
  attachmentUrl: string
}

export function TicketAttachmentsGallery({ imageUrls, token, onDelete }: TicketAttachmentsGalleryProps) {
  const [previews, setPreviews] = useState<AttachmentPreview[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [deletingUrl, setDeletingUrl] = useState<string | null>(null)

  useEffect(() => {
    if (!token || imageUrls.length === 0) {
      setPreviews([])
      return
    }

    let cancelled = false
    const objectUrls: string[] = []

    const loadImages = async () => {
      try {
        setIsLoading(true)

        const loadedPreviews = await Promise.all(
          imageUrls.map(async (url, index) => {
            const response = await fetch(url, {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            })

            if (!response.ok) {
              throw new Error('No se pudo cargar una de las imagenes adjuntas')
            }

            const blob = await response.blob()
            const objectUrl = URL.createObjectURL(blob)
            objectUrls.push(objectUrl)

            return {
              src: objectUrl,
              label: `Adjunto ${index + 1}`,
              attachmentUrl: url,
            }
          })
        )

        if (!cancelled) {
          setPreviews(loadedPreviews)
        }
      } catch {
        if (!cancelled) {
          setPreviews([])
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    void loadImages()

    return () => {
      cancelled = true
      objectUrls.forEach((url) => URL.revokeObjectURL(url))
    }
  }, [imageUrls, token])

  if (imageUrls.length === 0) {
    return null
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-foreground flex items-center gap-2">
          <ImageIcon className="h-5 w-5" />
          Imágenes adjuntas ({imageUrls.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center gap-2 py-6 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Cargando imágenes...
          </div>
        ) : previews.length === 0 ? (
          <p className="text-sm text-muted-foreground">No se pudieron visualizar las imágenes adjuntas.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {previews.map((preview) => (
              <div
                key={preview.src}
                className="group overflow-hidden rounded-lg border border-border bg-secondary/30"
              >
                <div className="relative aspect-[4/3] w-full">
                  {onDelete && (
                    <Button
                      type="button"
                      size="icon"
                      variant="destructive"
                      className="absolute right-2 top-2 z-10 h-8 w-8"
                      disabled={deletingUrl === preview.attachmentUrl}
                      onClick={async () => {
                        try {
                          setDeletingUrl(preview.attachmentUrl)
                          await onDelete(preview.attachmentUrl)
                          toast.success('Adjunto eliminado')
                        } catch (error) {
                          toast.error(getReadableErrorMessage(error, 'No se pudo eliminar el adjunto'))
                        } finally {
                          setDeletingUrl(null)
                        }
                      }}
                    >
                      {deletingUrl === preview.attachmentUrl ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  )}
                  <a href={preview.src} target="_blank" rel="noreferrer" className="block h-full w-full">
                  <Image
                    src={preview.src}
                    alt={preview.label}
                    fill
                    unoptimized
                    className="object-cover transition-transform duration-200 group-hover:scale-[1.02]"
                  />
                  </a>
                </div>
                <div className="border-t border-border px-3 py-2 text-sm text-muted-foreground">
                  {preview.label}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
