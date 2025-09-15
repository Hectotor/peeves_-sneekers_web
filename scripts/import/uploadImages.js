const fs = require('fs');
const path = require('path');
const { storage, db, admin } = require('./firebaseConfig');

// Configuration
const IMAGES_DIR = path.join(__dirname, 'image shoes');
const STORAGE_PATH = 'products';
const COLLECTION_NAME = 'products';

async function uploadImageToStorage(filePath, fileName) {
  try {
    // Utilisation du bucket spécifié dans la configuration
    const bucket = storage.bucket('peeves-sneakers-web.firebasestorage.app');
    const destination = `${STORAGE_PATH}/${fileName}`;
    
    // Téléverser le fichier
    await bucket.upload(filePath, {
      destination,
      metadata: {
        contentType: 'image/png', // ou 'image/jpeg' selon le format
        cacheControl: 'public, max-age=31536000', // 1 an de cache
      },
      public: true
    });
    
    // Récupérer l'URL de téléchargement
    const file = bucket.file(destination);
    const [url] = await file.getSignedUrl({
      action: 'read',
      expires: '03-09-2491' // Date très éloignée dans le futur
    });
    
    return url;
  } catch (error) {
    console.error(`Erreur lors du téléversement de ${fileName}:`, error);
    return null;
  }
}

async function updateProductWithImage(productId, imageUrl) {
  try {
    const productRef = db.collection(COLLECTION_NAME).doc(String(productId));
    await productRef.update({
      imageUrl: imageUrl,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    console.log(`Produit ${productId} mis à jour avec l'image`);
  } catch (error) {
    console.error(`Erreur lors de la mise à jour du produit ${productId}:`, error);
  }
}

async function processImages() {
  try {
    const files = fs.readdirSync(IMAGES_DIR);
    
    for (const file of files) {
      // Extraire l'ID du produit du nom de fichier (ex: 1727.png -> 1727)
      const productId = path.parse(file).name;
      const filePath = path.join(IMAGES_DIR, file);
      
      console.log(`Traitement de l'image: ${file} (ID: ${productId})`);
      
      // Téléverser l'image
      const imageUrl = await uploadImageToStorage(filePath, file);
      
      if (imageUrl) {
        // Mettre à jour le produit avec l'URL de l'image
        await updateProductWithImage(productId, imageUrl);
      }
    }
    
    console.log('Traitement des images terminé !');
  } catch (error) {
    console.error('Erreur lors du traitement des images:', error);
  } finally {
    process.exit();
  }
}

// Démarrer le traitement
processImages();
