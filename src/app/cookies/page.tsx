"use client";

export default function CookiesPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-gray-900">Politique des cookies</h1>
        <p className="mt-2 text-sm text-gray-500">Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}</p>

        <div className="prose prose-sm sm:prose-base max-w-none mt-8">
          <h2>1. Qu'est-ce qu'un cookie ?</h2>
          <p>
            Un cookie est un petit fichier texte enregistré sur votre appareil (ordinateur, tablette, smartphone) lorsque vous
            consultez un site web. Il permet au site de mémoriser vos actions et préférences (identifiant, langue, taille de police,
            et autres paramètres d'affichage) pendant un temps donné.
          </p>

          <h2>2. Cookies utilisés sur ce site</h2>
          <p>Nous utilisons différents types de cookies pour améliorer votre expérience :</p>
          <ul>
            <li><strong>Cookies nécessaires</strong> : indispensables au fonctionnement du site (session, panier, sécurité).
            </li>
            <li><strong>Cookies de performance</strong> : aident à comprendre l'utilisation du site (statistiques anonymes).
            </li>
            <li><strong>Cookies de fonctionnalité</strong> : mémorisent vos préférences (langue, affichage).
            </li>
            <li><strong>Cookies de mesure d'audience</strong> : nous permettent d'analyser la fréquentation et d'améliorer le site.
            </li>
          </ul>

          <h2>3. Gestion des cookies</h2>
          <p>
            Lors de votre première visite, une bannière d'information peut vous proposer d'accepter ou de refuser certains cookies.
            Vous pouvez à tout moment modifier vos préférences via les réglages de votre navigateur ou effacer les cookies déjà
            enregistrés sur votre appareil.
          </p>
          <p>
            Pour gérer les cookies, consultez l'aide de votre navigateur (ex. Chrome, Firefox, Safari, Edge) pour connaître la marche à suivre.
          </p>

          <h2>4. Durée de conservation</h2>
          <p>
            La durée de vie des cookies varie selon leur finalité. Ils peuvent être conservés pour la durée de la session ou pour une période
            n'excédant pas 13 mois conformément aux recommandations en vigueur.
          </p>

          <h2>5. Contact</h2>
          <p>
            Pour toute question relative à l'utilisation des cookies, vous pouvez nous contacter à l'adresse suivante :
            <a href="mailto:contact@example.com">contact@example.com</a>.
          </p>
        </div>
      </div>
    </div>
  );
}
