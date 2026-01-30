export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="font-heading text-4xl font-bold mb-8">À Propos de Store Dz</h1>

      <div className="prose prose-lg max-w-none">
        {/* HISTOIRE */}
        <div className="bg-surface rounded-xl p-8 mb-8">
          <h2 className="font-heading text-2xl font-bold mb-4">Notre Histoire</h2>
          <p className="text-text/80 mb-4">
            Store Dz est né d’une idée simple : rendre l’élégance horlogère accessible partout en Algérie.
            Passionnés de montres, nous avons créé une boutique en ligne dédiée aux montres 100% originales,
            sélectionnées pour leur qualité, leur fiabilité et leur style.
          </p>
          <p className="text-text/80">
            Basés en Algérie, nous nous adressons à tous ceux qui veulent une montre qui dure dans le temps :
            cadeaux, usage quotidien ou pièce forte pour les grandes occasions. Notre mission : vous proposer
            des montres premium, avec une expérience d’achat simple, moderne et sécurisée.
          </p>
        </div>

        {/* VALEURS */}
        <div className="bg-surface rounded-xl p-8 mb-8">
          <h2 className="font-heading text-2xl font-bold mb-4">Nos Valeurs</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-lg mb-2">100% Original</h3>
              <p className="text-text/70 text-sm">
                Toutes nos montres sont soigneusement sélectionnées pour leur authenticité et leur qualité.
                Pas de contrefaçon, pas de compromis : uniquement des produits fiables que nous serions fiers de porter.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2">Qualité Premium</h3>
              <p className="text-text/70 text-sm">
                Matériaux durables, mécanismes fiables et finitions soignées : chaque modèle est choisi pour offrir
                un excellent rapport qualité/prix, que ce soit pour les montres homme ou femme.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2">Pensé pour l’Algérie</h3>
              <p className="text-text/70 text-sm">
                Livraison partout en Algérie, expérience mobile-first et interface en français : Store Dz est conçu
                pour répondre aux besoins des clients algériens, où qu’ils se trouvent.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2">Confiance & Transparence</h3>
              <p className="text-text/70 text-sm">
                Prix affichés en dinar algérien (DA), informations claires sur chaque produit, et un processus de
                commande simple. Notre objectif est de vous offrir une expérience rassurante du premier clic à la
                réception de votre montre.
              </p>
            </div>
          </div>
        </div>

        {/* ENGAGEMENT */}
        <div className="bg-surface rounded-xl p-8">
          <h2 className="font-heading text-2xl font-bold mb-4">Notre Engagement</h2>
          <p className="text-text/80 mb-4">
            Chez Store Dz, nous voulons que chaque client soit fier de porter sa montre. C’est pourquoi nous
            mettons l’accent sur la qualité des produits, la clarté des informations et un parcours d’achat fluide,
            du catalogue jusqu’au checkout.
          </p>
          <p className="text-text/80">
            Que vous cherchiez une montre homme élégante, une montre femme raffinée ou un modèle à offrir,
            nous nous engageons à vous proposer une sélection originale, un service sérieux et une expérience
            d’e-commerce moderne, adaptée au marché algérien.
          </p>
        </div>
      </div>
    </div>
  )
}