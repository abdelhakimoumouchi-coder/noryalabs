export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="font-heading text-4xl font-bold mb-8">À Propos de Norya Labs</h1>

      <div className="prose prose-lg max-w-none">
        <div className="bg-surface rounded-xl p-8 mb-8">
          <h2 className="font-heading text-2xl font-bold mb-4">Notre Histoire</h2>
          <p className="text-text/80 mb-4">
            Norya Labs est née d'une passion pour les traditions de beauté algériennes et d'un engagement envers des produits naturels et authentiques. Nous croyons que la beauté véritable provient de la nature et des méthodes ancestrales qui ont fait leurs preuves au fil des siècles.
          </p>
          <p className="text-text/80">
            Basés en Algérie, nous travaillons directement avec des producteurs locaux et des artisans pour vous proposer les meilleurs produits de beauté naturels du terroir algérien.
          </p>
        </div>

        <div className="bg-surface rounded-xl p-8 mb-8">
          <h2 className="font-heading text-2xl font-bold mb-4">Nos Valeurs</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-lg mb-2">100% Naturel</h3>
              <p className="text-text/70 text-sm">
                Nous sélectionnons uniquement des ingrédients naturels, sans additifs chimiques ni conservateurs artificiels.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Artisanal</h3>
              <p className="text-text/70 text-sm">
                Tous nos produits sont fabriqués selon des méthodes traditionnelles par des artisans locaux.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Local</h3>
              <p className="text-text/70 text-sm">
                Nous valorisons le savoir-faire algérien et soutenons l'économie locale en travaillant avec des producteurs du pays.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Qualité</h3>
              <p className="text-text/70 text-sm">
                Chaque produit est soigneusement testé et contrôlé pour garantir une qualité exceptionnelle.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-surface rounded-xl p-8">
          <h2 className="font-heading text-2xl font-bold mb-4">Notre Engagement</h2>
          <p className="text-text/80">
            Nous nous engageons à offrir des produits de beauté qui respectent votre peau et l'environnement. Chaque achat chez Norya Labs contribue à préserver les traditions artisanales algériennes et à soutenir les communautés locales.
          </p>
        </div>
      </div>
    </div>
  )
}
