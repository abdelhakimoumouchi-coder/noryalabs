import SeoCollectionPage from '@/components/SeoCollectionPage'
import { buildPageMetadata } from '@/lib/seo'

export const dynamic = 'force-dynamic'

export const metadata = buildPageMetadata({
  title: 'Montres Premium en Algérie - Homme & Femme - Store DZ',
  description: 'Achetez des montres premium en Algérie chez Store DZ. Sélection homme et femme, produits originaux, garantie 2 ans et livraison partout en Algérie.',
  path: '/montres-premium-algerie',
})

export default function MontresPremiumAlgeriePage() {
  return (
    <SeoCollectionPage
      h1="Montres premium en Algérie"
      intro={[
        'Store DZ est une boutique de montres premium en Algérie dédiée aux clients qui veulent un modèle élégant, durable et facile à commander en ligne. Notre sélection regroupe des montres homme et femme adaptées au quotidien, aux cadeaux, aux rendez-vous professionnels et aux événements.',
        'Une montre premium doit rester agréable à porter, lisible, bien finie et cohérente avec votre style. C’est pourquoi nous mettons en avant des fiches produits claires, des photos utiles, les prix en DA et les informations nécessaires avant l’achat.',
        'La boutique assure la livraison nationale dans les 58 wilayas, le paiement à la livraison et une garantie 2 ans. Vous pouvez découvrir les modèles disponibles dans la boutique ou consulter les pages dédiées aux montres originales, homme et femme.',
      ]}
      links={[
        { href: '/shop', label: 'découvrir nos montres premium' },
        { href: '/montres-originales-algerie', label: 'montres originales en Algérie' },
        { href: '/delivery', label: 'livraison de montres en Algérie' },
      ]}
    />
  )
}
