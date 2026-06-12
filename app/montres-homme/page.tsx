import SeoCollectionPage from '@/components/SeoCollectionPage'
import { buildPageMetadata } from '@/lib/seo'

export const dynamic = 'force-dynamic'

export const metadata = buildPageMetadata({
  title: 'Montres Homme Premium Originales en Algérie - Store DZ',
  description: 'Achetez une montre homme premium originale en Algérie. Collection élégante, garantie 2 ans, livraison dans les 58 wilayas et paiement à la livraison.',
  path: '/montres-homme',
})

export default function MontresHommePage() {
  return (
    <SeoCollectionPage
      h1="Montres homme premium originales en Algérie"
      productFilter={{ categoryContains: 'homme' }}
      intro={[
        'Store DZ propose une sélection de montres homme premium originales en Algérie, pensées pour accompagner le quotidien, le travail, les sorties et les occasions importantes. Chaque modèle est choisi pour son style, sa qualité perçue, son confort au poignet et sa capacité à compléter une tenue avec élégance.',
        'Que vous cherchiez une montre professionnelle sobre, un modèle sport-chic ou une idée cadeau fiable, notre boutique met en avant des montres homme adaptées aux goûts modernes. Les produits disponibles sont présentés avec leurs images, leurs prix en dinars algériens et leurs informations essentielles pour commander en toute confiance.',
        'La livraison est assurée dans les 58 wilayas, avec paiement à la livraison et garantie 2 ans. Vous pouvez aussi parcourir la boutique complète pour comparer les montres premium homme et femme disponibles chez Store DZ.',
      ]}
      links={[
        { href: '/shop', label: 'voir la boutique' },
        { href: '/montres-femme', label: 'voir les montres femme' },
        { href: '/delivery', label: 'livraison de montres en Algérie' },
      ]}
    />
  )
}
