export function ensureLocalUploads(images: unknown): string[] {
  const arr = Array.isArray(images) ? images : []
  return arr
    .map((src) => (typeof src === 'string' ? src : ''))
    .filter((src) => src.startsWith('/uploads/'))
}