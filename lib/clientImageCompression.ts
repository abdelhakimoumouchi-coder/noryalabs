const MAX_IMAGE_WIDTH = 1600
const MAX_IMAGE_HEIGHT = 1600
const IMAGE_QUALITY = 0.82

export async function compressProductImage(file: File): Promise<File> {
  if (!file.type.startsWith('image/')) {
    throw new Error('Le fichier doit être une image')
  }

  const bitmap = await createImageBitmap(file)
  const ratio = Math.min(
    1,
    MAX_IMAGE_WIDTH / bitmap.width,
    MAX_IMAGE_HEIGHT / bitmap.height
  )
  const width = Math.max(1, Math.round(bitmap.width * ratio))
  const height = Math.max(1, Math.round(bitmap.height * ratio))

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height

  const context = canvas.getContext('2d')
  if (!context) {
    bitmap.close()
    throw new Error("Compression d'image impossible")
  }

  context.drawImage(bitmap, 0, 0, width, height)
  bitmap.close()

  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, 'image/webp', IMAGE_QUALITY)
  })

  if (!blob) {
    throw new Error("Compression d'image impossible")
  }

  const baseName = file.name.replace(/\.[^.]+$/, '') || 'product-image'
  return new File([blob], `${baseName}.webp`, { type: 'image/webp' })
}
