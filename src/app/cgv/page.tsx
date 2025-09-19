"use client";

export default function CGVPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-gray-900">Conditions Générales de Vente (CGV)</h1>
        <p className="mt-2 text-sm text-gray-500">Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}</p>

        <div className="prose prose-sm sm:prose-base max-w-none mt-8 prose-headings:scroll-mt-24">
          <h2>1. Objet</h2>
          <p>
            Les présentes Conditions Générales de Vente (ci-après « CGV ») régissent les ventes de produits réalisées
            sur le site. Toute commande implique l'adhésion pleine et entière du Client aux CGV en vigueur au jour de la commande.
          </p>

          <h2>2. Produits et disponibilités</h2>
          <p>
            Les caractéristiques essentielles des produits sont présentées sur la fiche produit. Les offres sont valables tant
            qu'elles sont visibles sur le site, dans la limite des stocks disponibles.
          </p>

          <h2>3. Prix</h2>
          <p>
            Les prix sont indiqués en euros, toutes taxes comprises (TTC). Les frais de livraison éventuels sont
            précisés avant la validation définitive de la commande. Le vendeur se réserve le droit de modifier ses prix
            à tout moment, mais les produits sont facturés sur la base des tarifs en vigueur au moment de l'enregistrement de la commande.
          </p>

          <h2>4. Commande</h2>
          <p>
            Le Client confirme son intention d'achat en validant sa commande. Un e-mail de confirmation récapitulant la commande
            est adressé au Client. Le vendeur se réserve le droit de refuser toute commande pour motif légitime.
          </p>

          <h2>5. Paiement</h2>
          <p>
            Le paiement s'effectue selon les moyens proposés sur le site. La commande est considérée comme définitive
            après acceptation du paiement. En cas de refus, la commande est automatiquement annulée.
          </p>

          <h2>6. Livraison</h2>
          <p>
            Les livraisons sont effectuées à l'adresse indiquée par le Client lors de la commande. Les délais indiqués lors
            de la validation sont indicatifs. En cas de retard, le Client pourra contacter le service client pour toute information.
          </p>

          <h2>7. Droit de rétractation (14 jours)</h2>
          <p>
            Conformément aux dispositions légales, le Client dispose d'un délai de <strong>14 jours</strong> à compter de la réception
            du produit pour exercer son droit de rétractation, sans avoir à justifier de motifs ni à payer de pénalités.
          </p>
          <p>
            Pour exercer ce droit, le Client notifie sa décision de rétractation avant l'expiration du délai par une déclaration
            dénuée d'ambiguïté (par exemple : courrier, e-mail). Le Client peut utiliser le modèle ci-dessous sans que cela ne soit obligatoire.
          </p>
          <p className="border rounded-md bg-gray-50 p-4 text-sm">
            Modèle de formulaire de rétractation :<br />
            — À l'attention du vendeur :<br />
            — Je vous notifie par la présente ma rétractation du contrat portant sur la vente du/des produit(s) suivant(s) : [référence]<br />
            — Commandé le / reçu le : [date]<br />
            — Nom du consommateur : [nom]<br />
            — Adresse du consommateur : [adresse]<br />
            — Date : [date]<br />
          </p>
          <p>
            Le Client renvoie le produit sans retard excessif et au plus tard <strong>14 jours</strong> après la communication de sa décision de se rétracter.
            Les produits doivent être retournés dans leur état d'origine, complets et non portés. Les frais de retour sont à la charge du Client,
            sauf indication contraire. Le remboursement intervient dans les 14 jours à compter de la récupération des biens ou jusqu'à ce que le Client
            ait fourni une preuve d'expédition, la date retenue étant celle du premier de ces faits.
          </p>

          <h2>8. Exceptions au droit de rétractation</h2>
          <p>
            Le droit de rétractation ne peut être exercé pour les biens confectionnés selon les spécifications du Client ou nettement personnalisés,
            ainsi que pour les biens scellés ne pouvant être renvoyés pour des raisons d'hygiène si le scellé a été rompu.
          </p>

          <h2>9. Retours — Procédure</h2>
          <p>
            Avant tout retour, le Client est invité à contacter le service client pour obtenir les modalités de retour (adresse, étiquette, etc.).
            Le vendeur recommande un envoi suivi. Tout risque lié au retour du produit est à la charge du Client.
          </p>

          <h2>10. Garanties légales</h2>
          <p>
            Le Client bénéficie des garanties légales de conformité et des vices cachés dans les conditions prévues par la loi.
            En cas de défaut, le Client doit notifier le vendeur dans les meilleurs délais avec descriptif et justificatifs.
          </p>

          <h2>11. Responsabilité</h2>
          <p>
            Le vendeur ne saurait être tenu pour responsable des dommages résultant d'une mauvaise utilisation du produit ou d'une cause
            extérieure au produit. Les photographies et textes reproduits et illustrant les produits n'ont pas de valeur contractuelle.
          </p>

          <h2>12. Données personnelles</h2>
          <p>
            Les données collectées sont traitées conformément à la politique de confidentialité du site, accessible sur la page dédiée.
            Le Client dispose de droits d'accès, de rectification et d'opposition.
          </p>

          <h2>13. Service client</h2>
          <p>
            Pour toute question, réclamation ou demande d'information, le Client peut contacter le service client à l'adresse suivante :
            <a href="mailto:contact@example.com">contact@example.com</a>.
          </p>

          <h2>14. Droit applicable — Litiges</h2>
          <p>
            Les présentes CGV sont soumises au droit applicable au siège du vendeur. En cas de litige, une solution amiable sera recherchée
            avant toute action judiciaire. Le Client peut également recourir à un médiateur de la consommation.
          </p>
        </div>
      </div>
    </div>
  );
}
