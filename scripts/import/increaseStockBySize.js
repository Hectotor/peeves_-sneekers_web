// Script: augmenter le stock par pointure pour tous les produits
// Règle: pour chaque taille (46..57), augmenter la quantité d'un aléa entre 0 et 100 inclus
// Usage:
//   node scripts/import/increaseStockBySize.js [--dry-run]
//   node scripts/import/increaseStockBySize.js --min 0 --max 100 [--dry-run]
// Options:
//   --min / --max : bornes d'augmentation aléatoire (par défaut 0..100)
//   --filter      : chaîne pour filtrer les produits par nom (optionnel)

const { db, admin } = require('./firebaseConfig');

const SIZES = Array.from({ length: 12 }, (_, i) => String(46 + i)); // "46".."57"

function parseArgs() {
  const args = process.argv.slice(2);
  const opt = { dryRun: false, min: 0, max: 100, filter: '' };
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === '--dry-run') opt.dryRun = true;
    else if (a === '--min') { opt.min = Number(args[++i] ?? 0) || 0; }
    else if (a === '--max') { opt.max = Number(args[++i] ?? 0) || 0; }
    else if (a === '--filter') { opt.filter = String(args[++i] ?? ''); }
  }
  if (opt.max < opt.min) [opt.min, opt.max] = [opt.max, opt.min];
  return opt;
}

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function main() {
  const { dryRun, min, max, filter } = parseArgs();
  console.log(`Augmentation aléatoire par taille (${min}..${max}) ${dryRun ? '(DRY RUN)' : ''}`);

  const productsRef = db.collection('products');
  const snapshot = await productsRef.get();
  console.log(`Produits trouvés: ${snapshot.size}`);

  let processed = 0;
  let batch = db.batch();
  let opsInBatch = 0;

  for (const doc of snapshot.docs) {
    const data = doc.data();
    if (filter && !String(data.name || '').toLowerCase().includes(filter.toLowerCase())) {
      continue;
    }

    const sizes = { ...(data.sizes || {}) };
    const deltas = {};

    for (const size of SIZES) {
      const add = randInt(min, max);
      const current = Number(sizes[size]?.quantity || 0);
      const next = current + add;
      sizes[size] = { quantity: next };
      deltas[size] = { add, from: current, to: next };
    }

    const updatePayload = {
      sizes,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    if (dryRun) {
      console.log(`[DRY] ${doc.id} ${data.name || ''} ->`, deltas);
      processed++;
      continue;
    }

    batch.update(doc.ref, updatePayload);
    opsInBatch++;
    processed++;

    if (opsInBatch >= 400) { // garder une marge sous la limite 500
      await batch.commit();
      batch = db.batch();
      opsInBatch = 0;
      console.log(`Commit partiel: ${processed}/${snapshot.size} produits mis à jour...`);
    }
  }

  if (!dryRun && opsInBatch > 0) {
    await batch.commit();
  }

  console.log(`Terminé. Produits affectés: ${processed}${dryRun ? ' (dry-run)' : ''}`);
  process.exit(0);
}

main().catch((e) => {
  console.error('Erreur:', e);
  process.exit(1);
});
