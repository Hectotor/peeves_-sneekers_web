"use client";

export default function MentionsLegalesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-gray-900">Mentions légales</h1>
        <p className="mt-2 text-sm text-gray-500">Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}</p>

        <div className="prose prose-sm sm:prose-base max-w-none mt-8">
          <h2>Éditeur du site</h2>
          <p>
            Dénomination sociale: [Votre société]<br />
            Forme juridique: [SAS / SARL / Auto-entrepreneur...]<br />
            Siège social: [Adresse complète]<br />
            Email: <a href="mailto:contact@example.com">contact@example.com</a><br />
            Téléphone: [Numéro]<br />
            SIREN/SIRET: [Numéro]<br />
            N° TVA intracommunautaire: [Numéro]<br />
            Directeur de la publication: [Nom et prénom]
          </p>

          <h2>Hébergeur</h2>
          <p>
            Hébergeur: [Nom de l'hébergeur]<br />
            Adresse: [Adresse complète de l'hébergeur]<br />
            Téléphone: [Numéro]
          </p>

          <h2>Propriété intellectuelle</h2>
          <p>
            L'ensemble des éléments du site (textes, images, logos, marques, vidéos, icônes, mises en page, etc.) est protégé par le droit de la propriété
            intellectuelle. Toute reproduction, représentation, modification, publication, adaptation totale ou partielle des éléments du site, quel que soit le moyen
            ou le procédé utilisé, est interdite, sauf autorisation écrite préalable.
          </p>

          <h2>Responsabilité</h2>
          <p>
            L'éditeur du site ne saurait être tenu responsable des dommages directs ou indirects causés au matériel de l'utilisateur, lors de l'accès au site, et résultant
            soit de l'utilisation d'un matériel ne répondant pas aux spécifications, soit de l'apparition d'un bug ou d'une incompatibilité.
          </p>

          <h2>Données personnelles</h2>
          <p>
            Les données personnelles sont traitées conformément à la politique de confidentialité disponible sur le site. Vous disposez d'un droit d'accès, de rectification,
            d'effacement, d'opposition et de portabilité des données vous concernant.
          </p>

          <h2>Cookies</h2>
          <p>
            Le site utilise des cookies pour améliorer l'expérience utilisateur et mesurer l'audience. Pour plus d'informations, consultez la <a href="/cookies">Politique des cookies</a>.
          </p>

          <h2>Liens hypertextes</h2>
          <p>
            Le site peut contenir des liens vers d'autres sites. L'éditeur du site ne peut être tenu responsable du contenu de ces sites externes.
          </p>

          <h2>Droit applicable</h2>
          <p>
            Les présentes mentions légales sont soumises au droit applicable au siège de l'éditeur. Tout litige relève de la compétence des tribunaux compétents.
          </p>
        </div>
      </div>
    </div>
  );
}
