'use client'

const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024
const MAX_IMAGE_DIMENSION = 1600
const DEFAULT_QUALITY = 0.78
const MIN_QUALITY = 0.55
const QUALITY_STEP = 0.08
const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp'])

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file)
    const image = new Image()

    image.onload = () => {
      URL.revokeObjectURL(objectUrl)
      resolve(image)
    }

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      reject(new Error(`No se pudo procesar la imagen ${file.name}`))
    }

    image.src = objectUrl
  })
}

function getResizedDimensions(width: number, height: number) {
  const maxDimension = Math.max(width, height)
  if (maxDimension <= MAX_IMAGE_DIMENSION) {
    return { width, height }
  }

  const scale = MAX_IMAGE_DIMENSION / maxDimension
  return {
    width: Math.round(width * scale),
    height: Math.round(height * scale),
  }
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality?: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('No se pudo generar la imagen optimizada'))
        return
      }
      resolve(blob)
    }, type, quality)
  })
}

function normalizeFileName(name: string, extension: string) {
  const baseName = name.replace(/\.[^.]+$/, '').trim().replace(/\s+/g, '-').replace(/[^a-zA-Z0-9-_]/g, '').toLowerCase()
  return `${baseName || 'imagen'}.${extension}`
}

function pickOutputType(file: File): { type: string; extension: string } {
  if (file.type === 'image/png' || file.type === 'image/webp') {
    return { type: 'image/webp', extension: 'webp' }
  }

  return { type: 'image/jpeg', extension: 'jpg' }
}

export async function optimizeImageForUpload(file: File): Promise<File> {
  if (!ALLOWED_TYPES.has(file.type)) {
    throw new Error(`Formato no soportado para ${file.name}. Usa JPG, PNG o WEBP.`)
  }

  const image = await loadImage(file)
  const { width, height } = getResizedDimensions(image.width, image.height)
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height

  const context = canvas.getContext('2d')
  if (!context) {
    throw new Error('Tu navegador no soporta el procesamiento de imagenes')
  }

  context.drawImage(image, 0, 0, width, height)

  const output = pickOutputType(file)
  let quality = DEFAULT_QUALITY
  let blob = await canvasToBlob(canvas, output.type, quality)

  while (blob.size > MAX_IMAGE_SIZE_BYTES && quality > MIN_QUALITY) {
    quality = Math.max(MIN_QUALITY, quality - QUALITY_STEP)
    blob = await canvasToBlob(canvas, output.type, quality)
  }

  if (blob.size > MAX_IMAGE_SIZE_BYTES) {
    throw new Error(`La imagen ${file.name} sigue superando los 10 MB luego de optimizarla`)
  }

  return new File([blob], normalizeFileName(file.name, output.extension), {
    type: blob.type,
    lastModified: Date.now(),
  })
}

export async function optimizeImagesForUpload(files: File[]): Promise<File[]> {
  const optimizedFiles: File[] = []

  for (const file of files) {
    optimizedFiles.push(await optimizeImageForUpload(file))
  }

  return optimizedFiles
}

export function formatFileSize(size: number): string {
  if (size >= 1024 * 1024) {
    return `${(size / (1024 * 1024)).toFixed(1)} MB`
  }
  return `${Math.max(1, Math.round(size / 1024))} KB`
}
