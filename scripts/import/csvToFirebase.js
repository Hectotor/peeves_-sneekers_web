const fs = require('fs');
const csv = require('csv-parser');
const path = require('path');
const { db, admin } = require('./firebaseConfig');

// Configuration
const CSV_FILE_PATH = path.join(__dirname, 'footlocker_products.csv'); // Chemin vers le fichier CSV
const COLLECTION_NAME = 'products'; // Nom de la collection Firestore

async function importCsvToFirestore() {
  try {
    console.log(`Lecture du fichier CSV: ${CSV_FILE_PATH}`);
    const results = [];
    
    // Lire le fichier CSV
    if (!fs.existsSync(CSV_FILE_PATH)) {
      throw new Error(`Le fichier ${CSV_FILE_PATH} n'existe pas`);
    }

    await new Promise((resolve, reject) => {
      const stream = fs.createReadStream(CSV_FILE_PATH, { encoding: 'utf8' })
        .on('error', (err) => {
          console.error('Erreur lors de la lecture du fichier:', err);
          reject(err);
        });

      stream.pipe(csv({
        separator: ';', // Utilisation du point-virgule comme séparateur
        skipLines: 1,   // Sauter la première ligne (en-tête du tableau)
        headers: [
          'image', 'name.primary', 'name.alt', 'price.final', 'price.original'
        ]
      }))
        .on('data', (data) => {
          // Nettoyer les données
          if (data['price.original']) {
            data['price.original'] = data['price.original'].trim();
          }
          if (data['price.final']) {
            data['price.final'] = data['price.final'].trim();
          }
          results.push(data);
        })
        .on('end', resolve)
        .on('error', reject);
    });
    
    console.log(`Début de l'importation de ${results.length} produits...`);
    
    // Importer chaque ligne dans Firestore
    const batch = db.batch();
    const collectionRef = db.collection(COLLECTION_NAME);
    
    for (const [index, row] of results.entries()) {
      // Créer un document avec un ID généré par Firestore
      const docRef = collectionRef.doc();
      
      // Convertir les prix en nombres
      const originalPrice = row['price.original'] ? 
        parseFloat(row['price.original'].replace('€', '').trim().replace(',', '.')) : null;
      
      const finalPrice = row['price.final'] ? 
        parseFloat(row['price.final'].replace('€', '').trim().replace(',', '.')) : null;
      
      // Préparer les données pour Firestore
      const productData = {
        id: docRef.id,
        name: row['name.primary'] || '',
        alt: row['name.alt'] || '',
        final: finalPrice,
        original: originalPrice,
        currency: 'EUR',
        isOnSale: !!originalPrice && (originalPrice > finalPrice),
        imageUrl: row['image'] || '',
        quantity: Math.floor(Math.random() * 100), // Quantité aléatoire entre 0 et 100
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      };
      
      batch.set(docRef, productData);
      
      // Afficher la progression
      if ((index + 1) % 10 === 0 || index === 0) {
        console.log(`${index + 1}/${results.length} produits traités...`);
      }
    }
    
    // Exécuter le batch
    await batch.commit();
    console.log('Importation terminée avec succès !');
    
  } catch (error) {
    console.error('Erreur lors de l\'importation :', error);
  } finally {
    // Fermer la connexion
    process.exit();
  }
}

// Démarrer l'importation
importCsvToFirestore();
