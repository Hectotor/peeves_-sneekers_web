// Script de migration: remplace le champ `quantity` par un champ `sizes` (quantité par pointure)
// Utilisation: node scripts/import/migrateQuantityToSizes.js [--dry-run]

const { db, admin } = require('./firebaseConfig');

const SIZES = Array.from({ length: 12 }, (_, i) => String(46 + i)); // "46".."57"
const DRY_RUN = process.argv.includes('--dry-run');

async function migrate() {
  console.log(`Migration quantity -> sizes ${DRY_RUN ? '(DRY RUN)' : ''}`);

  const productsRef = db.collection('products');
  const snapshot = await productsRef.get();
  console.log(`Produits à traiter: ${snapshot.size}`);

  let updated = 0;
  for (const doc of snapshot.docs) {
    const data = doc.data();

    // Si sizes existe déjà et quantity est absent, passer
    if (data.sizes && data.quantity === undefined) {
      continue;
    }

    // Construire la map sizes (normalisée en { size: { quantity } })
    const sizes = {};
    if (data.sizes && typeof data.sizes === 'object') {
      for (const size of SIZES) {
        const val = data.sizes[size];
        if (val === undefined) continue;
        sizes[size] = typeof val === 'number' ? { quantity: val } : { quantity: Number(val?.quantity) || 0 };
      }
    }

    if (data.quantity !== undefined && data.quantity !== null) {
      // Répartir la quantité globale sur les pointures
      const total = Math.max(0, Number(data.quantity) || 0);
      const base = Math.floor(total / SIZES.length);
      let remainder = total % SIZES.length;

      for (const size of SIZES) {
        const existing = sizes[size]?.quantity || 0;
        const add = base + (remainder > 0 ? 1 : 0);
        sizes[size] = { quantity: existing + add };
        if (remainder > 0) remainder--;
      }
    } else {
      // Pas de quantity global -> initialiser à 0 pour toutes les tailles manquantes
      for (const size of SIZES) {
        if (sizes[size] === undefined) sizes[size] = { quantity: 0 };
      }
    }

    const updatePayload = {
      sizes,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    // Supprimer l'ancien champ quantity s'il existe
    if (data.quantity !== undefined) {
      updatePayload.quantity = admin.firestore.FieldValue.delete();
    }

    if (DRY_RUN) {
      console.log(`[DRY] ${doc.id} ->`, updatePayload);
      updated++;
    } else {
      await doc.ref.update(updatePayload);
      updated++;
      if (updated % 25 === 0) console.log(`${updated}/${snapshot.size} produits mis à jour...`);
    }
  }

  console.log(`Migration terminée. Documents affectés: ${updated}`);
  process.exit(0);
}

migrate().catch((e) => {
  console.error('Erreur migration:', e);
  process.exit(1);
});
