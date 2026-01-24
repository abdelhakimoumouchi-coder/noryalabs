export default function DeliveryPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="font-heading text-4xl font-bold mb-8">Livraison & Paiement</h1>

      <div className="space-y-8">
        <div className="bg-surface rounded-xl p-8">
          <h2 className="font-heading text-2xl font-bold mb-4">Livraison</h2>
          <div className="space-y-4 text-text/80">
            <div>
              <h3 className="font-semibold text-lg text-text mb-2">Zones de livraison</h3>
              <p>Nous livrons dans les 58 wilayas d'Algérie.</p>
            </div>

            <div>
              <h3 className="font-semibold text-lg text-text mb-2">Délais de livraison</h3>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Alger et environs: 2-3 jours ouvrables</li>
                <li>Grandes villes: 3-5 jours ouvrables</li>
                <li>Autres wilayas: 5-7 jours ouvrables</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-lg text-text mb-2">Frais de livraison</h3>
              <p>Les frais de livraison varient selon la wilaya et le poids de votre commande. Ils sont calculés lors de la finalisation de votre commande.</p>
            </div>
          </div>
        </div>

        <div className="bg-surface rounded-xl p-8">
          <h2 className="font-heading text-2xl font-bold mb-4">Paiement</h2>
          <div className="space-y-4 text-text/80">
            <div>
              <h3 className="font-semibold text-lg text-text mb-2">Paiement à la livraison</h3>
              <p>
                Nous acceptons uniquement le paiement en espèces à la livraison. Vous payez directement au livreur lors de la réception de votre colis.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-lg text-text mb-2">Sécurité</h3>
              <p>
                Inspectez votre colis avant le paiement. En cas de problème visible (colis endommagé, produits cassés), refusez le colis et contactez-nous immédiatement.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-surface rounded-xl p-8">
          <h2 className="font-heading text-2xl font-bold mb-4">Suivi de commande</h2>
          <p className="text-text/80">
            Après confirmation de votre commande, vous serez contacté par téléphone pour confirmer les détails de livraison. Un numéro de suivi vous sera communiqué dès l'expédition de votre colis.
          </p>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-xl p-6">
          <div className="flex items-start gap-3">
            <svg className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h3 className="font-semibold text-green-900 mb-2">Des questions ?</h3>
              <p className="text-green-700 text-sm">
                Contactez-nous via WhatsApp pour toute question concernant votre livraison ou votre commande.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
