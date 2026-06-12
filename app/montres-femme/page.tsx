import SeoCollectionPage from '@/components/SeoCollectionPage'
import { buildPageMetadata } from '@/lib/seo'

export const dynamic = 'force-dynamic'

export const metadata = buildPageMetadata({
  title: 'Montres Femme Premium Originales en Algérie - Store DZ',
  description: 'Découvrez nos montres femme premium originales en Algérie. Modèles élégants, raffinés et garantis, avec livraison partout en Algérie.',
  path: '/montres-femme',
})

export default function MontresFemmePage() {
  return (
    <SeoCollectionPage
      h1="Montres femme premium originales en Algérie"
      productFilter={{ categoryContains: 'femme' }}
      intro={[
        'La collection Store DZ réunit des montres femme premium originales en Algérie, sélectionnées pour leur élégance, leur raffinement et leur facilité à s’associer à différents styles. Une montre peut accompagner une tenue quotidienne, compléter une tenue de soirée ou devenir un cadeau marquant.',
        'Nous privilégions des modèles féminins soignés, avec des finitions propres, un design moderne et une présentation claire. Chaque fiche produit indique les informations utiles pour choisir sereinement : photos, prix, disponibilité et détails essentiels.',
        'Store DZ livre partout en Algérie, dans les 58 wilayas, avec paiement à la livraison et garantie 2 ans. Vous pouvez comparer les montres femme avec les modèles homme ou visiter la boutique complète pour découvrir toute la sélection premium.',
      ]}
      links={[
        { href: '/shop', label: 'découvrir nos montres premium' },
        { href: '/montres-homme', label: 'voir les montres homme' },
        { href: '/contact', label: 'contacter Store DZ' },
      ]}
    />
  )
}
