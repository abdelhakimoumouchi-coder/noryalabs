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
  firstName: z.string().min(2, 'Le prénom doit contenir au moins 2 caractères'),
  lastName: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
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

export const orderStatusSchema = z.enum(['pending', 'confirmed', 'in_delivery', 'delivered', 'canceled', 'returned'])
export type OrderStatus = z.infer<typeof orderStatusSchema>

// Accepte URL absolue ou chemin relatif /uploads/...
const imageStringSchema = z.string().refine(
  (v) => !!v && (/^https?:\/\//i.test(v) || v.startsWith('/uploads/')),
  { message: 'Image doit être une URL ou un chemin /uploads/...' }
)

export const adminProductSchema = z.object({
  name: z.string().min(2),
  priceDa: z.number().int().min(0),
  category: z.string().min(1),
  description: z.string().min(10),
  images: z.array(imageStringSchema).min(1),
  colors: z.array(z.string()).optional(),   // variantes couleur
  benefits: z.array(z.string()).optional(), // optionnel, défaut côté serveur
  stock: z.number().int().min(0),
  isFeatured: z.boolean().optional(),
  slug: z.string().min(1).optional(),       // auto si non fourni
})