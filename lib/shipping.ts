// Mapping wilaya -> frais de livraison (à compléter selon votre grille)
export const WILAYA_SHIPPING = [
  { value: 'Adrar', label: 'Adrar (800 DA)', shippingDa: 800 },
  { value: 'Chlef', label: 'Chlef (600 DA)', shippingDa: 600 },
  { value: 'Alger', label: 'Alger (400 DA)', shippingDa: 400 },
  // TODO: compléter toutes les wilayas avec leurs tarifs
]

export function findShipping(wilaya: string): number {
  return WILAYA_SHIPPING.find(w => w.value === wilaya)?.shippingDa ?? 0
}