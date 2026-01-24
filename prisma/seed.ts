import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const products = [
  {
    slug: 'huile-argan-pure',
    name: 'Huile d\'Argan Pure BIO',
    priceDa: 8500,
    category: 'skincare',
    description: 'Huile d\'argan 100% pure et biologique, extraite à froid des arganiers du sud algérien. Riche en vitamine E et acides gras essentiels, elle nourrit intensément la peau et les cheveux. Produit naturel sans additifs ni conservateurs.',
    benefits: [
      'Hydratation profonde et durable',
      'Anti-âge naturel riche en antioxydants',
      'Répare les cheveux abîmés',
      'Certifiée biologique 100% pure',
      'Extraction à froid artisanale'
    ],
    images: [
      'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=800',
      'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800'
    ],
    stock: 45,
    isFeatured: true,
  },
  {
    slug: 'savon-nigelle-alep',
    name: 'Savon Nigelle d\'Alep',
    priceDa: 5500,
    category: 'skincare',
    description: 'Savon traditionnel d\'Alep enrichi à l\'huile de nigelle, fabriqué selon des méthodes ancestrales. Idéal pour les peaux sensibles et à problèmes. Sans colorants ni parfums artificiels.',
    benefits: [
      'Purifie et assainit la peau',
      'Convient aux peaux sensibles',
      'Huile de nigelle aux propriétés apaisantes',
      'Fabrication artisanale traditionnelle',
      'Sans produits chimiques'
    ],
    images: [
      'https://images.unsplash.com/photo-1600857544200-242c05b0e2f4?w=800',
      'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=800'
    ],
    stock: 60,
    isFeatured: true,
  },
  {
    slug: 'creme-ghassoul-rose',
    name: 'Crème au Ghassoul & Rose',
    priceDa: 6800,
    category: 'skincare',
    description: 'Masque crémeux au ghassoul volcanique d\'Atlas et eau de rose de Damas. Cette argile minérale nettoie en profondeur tout en respectant l\'équilibre naturel de votre peau. Texture onctueuse et parfum délicat.',
    benefits: [
      'Nettoie et purifie en profondeur',
      'Resserre les pores visiblement',
      'Éclat naturel instantané',
      'Argile volcanique minérale',
      'Parfum naturel de rose'
    ],
    images: [
      'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800',
      'https://images.unsplash.com/photo-1556228852-80f4f5ba5dc2?w=800'
    ],
    stock: 35,
    isFeatured: true,
  },
  {
    slug: 'huile-figue-barbarie',
    name: 'Huile de Figue de Barbarie',
    priceDa: 12500,
    category: 'skincare',
    description: 'Huile précieuse extraite des graines de figue de barbarie de Kabylie. Connue comme l\'or du désert, elle est l\'une des huiles les plus concentrées en vitamine E et stérols. Anti-rides puissant et régénérant cellulaire exceptionnel.',
    benefits: [
      'Anti-rides et anti-âge puissant',
      'Régénère les cellules cutanées',
      'Atténue les cernes et poches',
      'Huile la plus riche en vitamine E',
      'Extraction artisanale rare et précieuse'
    ],
    images: [
      'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=800',
      'https://images.unsplash.com/photo-1612817288484-6f916006741a?w=800'
    ],
    stock: 20,
    isFeatured: true,
  },
  {
    slug: 'henné-neutre-cassia',
    name: 'Henné Neutre Cassia',
    priceDa: 4200,
    category: 'haircare',
    description: 'Poudre de henné neutre (cassia obovata) pour soins capillaires en profondeur. Ne colore pas les cheveux mais les fortifie et leur donne du volume. Idéal en masque hebdomadaire pour cheveux ternes et fatigués.',
    benefits: [
      'Fortifie la fibre capillaire',
      'Apporte volume et brillance',
      'Ne modifie pas la couleur',
      'Traite les pellicules naturellement',
      'Poudre 100% végétale pure'
    ],
    images: [
      'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?w=800',
      'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=800'
    ],
    stock: 50,
    isFeatured: false,
  },
  {
    slug: 'serum-cactus-aloe',
    name: 'Sérum Cactus & Aloe Vera',
    priceDa: 7800,
    category: 'skincare',
    description: 'Sérum hydratant ultra-léger à base d\'extrait de cactus du Sahara et aloe vera. Pénètre rapidement sans laisser de film gras. Parfait pour les climats chauds et les peaux mixtes à grasses.',
    benefits: [
      'Hydratation légère non grasse',
      'Apaise les irritations',
      'Convient aux peaux mixtes',
      'Ingrédients du terroir algérien',
      'Absorption rapide'
    ],
    images: [
      'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800',
      'https://images.unsplash.com/photo-1571875257727-256c39da42af?w=800'
    ],
    stock: 40,
    isFeatured: true,
  },
]

async function main() {
  console.log('Start seeding...')
  
  for (const product of products) {
    const created = await prisma.product.create({
      data: product,
    })
    console.log(`Created product: ${created.name}`)
  }
  
  console.log('Seeding finished.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
