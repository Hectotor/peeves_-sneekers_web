const fs = require('fs');
const csv = require('csv-parser');
const path = require('path');
const { db, admin } = require('./firebaseConfig');

// Configuration
const CSV_FILE_PATH = path.join(__dirname, 'styles.csv'); // Chemin vers votre fichier CSV
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
        skipLines: 0,   // Ne pas sauter de lignes (l'en-tête est sur la première ligne)
        headers: [
          'id', 'gender', 'masterCategory', 'subCategory', 
          'articleType', 'baseColour', 'season', 'year', 
          'usage', 'productDisplayName'
        ]
      }))
        .on('data', (data) => results.push(data))
        .on('end', resolve)
        .on('error', reject);
    });
    
    console.log(`Début de l'importation de ${results.length} produits...`);
    
    // Importer chaque ligne dans Firestore
    const batch = db.batch();
    const collectionRef = db.collection(COLLECTION_NAME);
    
    for (const [index, row] of results.entries()) {
      // Créer un document avec l'ID du produit s'il existe, sinon Firestore en génère un
      const docRef = row.id ? collectionRef.doc(String(row.id)) : collectionRef.doc();
      
      // Générer une quantité aléatoire entre 0 et 1000
      const randomQuantity = Math.floor(Math.random() * 1001);
      
      // Préparer les données pour Firestore
      const productData = {
        id: row.id || docRef.id,
        gender: row.gender || '',
        masterCategory: row.masterCategory || '',
        subCategory: row.subCategory || '',
        articleType: row.articleType || '',
        baseColour: row.baseColour || '',
        season: row.season || '',
        year: row.year ? Number(row.year) : null,
        usage: row.usage || '',
        productDisplayName: row.productDisplayName || '',
        quantity: randomQuantity, // Ajout de la quantité aléatoire
        imageUrl: `https://storage.googleapis.com/peeves-sneakers-web.appspot.com/products/${row.id}.png`, // URL directe vers l'image
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      };
      
      batch.set(docRef, productData);
      
      // Afficher la progression
      if ((index + 1) % 100 === 0) {
        console.log(`${index + 1} produits traités...`);
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
