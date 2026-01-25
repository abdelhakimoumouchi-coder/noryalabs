import { z } from 'zod'

export const WILAYAS = [
  'Adrar', 'Chlef', 'Laghouat', 'Oum El Bouaghi', 'Batna', 'Béjaïa', 'Biskra', 'Béchar',
  'Blida', 'Bouira', 'Tamanrasset', 'Tébessa', 'Tlemcen', 'Tiaret', 'Tizi Ouzou', 'Alger',
  'Djelfa', 'Jijel', 'Sétif', 'Saïda', 'Skikda', 'Sidi Bel Abbès', 'Annaba', 'Guelma',
  'Constantine', 'Médéa', 'Mostaganem', 'M\'Sila', 'Mascara', 'Ouargla', 'Oran', 'El Bayadh',
  'Illizi', 'Bordj Bou Arréridj', 'Boumerdès', 'El Tarf', 'Tindouf', 'Tissemsilt', 'El Oued',
  'Khenchela', 'Souk Ahras', 'Tipaza', 'Mila', 'Aïn Defla', 'Naâma', 'Aïn Témouchent',
  'Ghardaïa', 'Relizane', 'Timimoun', 'Bordj Badji Mokhtar', 'Ouled Djellal', 'Béni Abbès',
  'In Salah', 'In Guezzam', 'Touggourt', 'Djanet', 'El M\'Ghair', 'El Meniaa'
]

const algerianPhoneRegex = /^0[5-7]\s?\d{2}\s?\d{2}\s?\d{2}\s?\d{2}$/

export const checkoutSchema = z.object({
  customerName: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  phone: z.string().regex(algerianPhoneRegex, 'Numéro de téléphone invalide (format: 0X XX XX XX XX)'),
  wilaya: z.enum(WILAYAS as [string, ...string[]], {
    errorMap: () => ({ message: 'Veuillez sélectionner une wilaya' })
  }),
  address: z.string().min(10, 'L\'adresse doit contenir au moins 10 caractères'),
  notes: z.string().optional(),
  items: z.array(z.object({
    productId: z.string(),
    quantity: z.number().min(1).int(),
  })).min(1, 'Le panier est vide'),
})

export type CheckoutInput = z.infer<typeof checkoutSchema>

export const orderStatusSchema = z.enum(['pending', 'confirmed', 'shipped', 'delivered', 'canceled'])

export type OrderStatus = z.infer<typeof orderStatusSchema>
