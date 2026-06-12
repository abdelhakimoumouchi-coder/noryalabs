import SeoCollectionPage from '@/components/SeoCollectionPage'
import { buildPageMetadata } from '@/lib/seo'

export const dynamic = 'force-dynamic'

export const metadata = buildPageMetadata({
  title: 'Montres Originales en Algérie - Store DZ',
  description: 'Store DZ vous propose des montres originales en Algérie, pour homme et femme, avec garantie 2 ans, paiement à la livraison et livraison nationale.',
  path: '/montres-originales-algerie',
})

export default function MontresOriginalesAlgeriePage() {
  return (
    <SeoCollectionPage
      h1="Montres originales en Algérie"
      intro={[
        'Store DZ s’adresse aux clients qui recherchent une montre originale en Algérie, avec une expérience d’achat claire et rassurante. Notre objectif est de proposer des montres homme et femme premium, présentées avec des informations utiles, des images lisibles et un prix affiché en dinars algériens.',
        'Choisir une montre originale, c’est privilégier un produit fiable, agréable à porter et cohérent avec son style. Notre sélection couvre des modèles adaptés au travail, aux sorties, aux cadeaux et aux événements, sans discours exagéré ni promesse trompeuse.',
        'Les commandes sont livrées dans les 58 wilayas, avec paiement à la livraison et garantie 2 ans. Pour aller plus loin, vous pouvez parcourir la boutique de montres en Algérie ou consulter directement les collections homme et femme.',
      ]}
      links={[
        { href: '/shop', label: 'acheter une montre originale en Algérie' },
        { href: '/montres-homme', label: 'voir les montres homme' },
        { href: '/montres-femme', label: 'voir les montres femme' },
      ]}
    />
  )
}
