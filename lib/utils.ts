export function formatPrice(priceDa: number): string {
  return new Intl.NumberFormat('fr-DZ', {
    style: 'decimal',
    minimumFractionDigits: 0,
  }).format(priceDa) + ' DA'
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('fr-DZ', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}
