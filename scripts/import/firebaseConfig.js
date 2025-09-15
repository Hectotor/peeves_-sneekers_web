// Configuration Firebase Admin SDK
const admin = require('firebase-admin');

// Initialiser Firebase Admin
if (!admin.apps.length) {
  const serviceAccount = require('./serviceAccountKey.json');
  
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: 'peeves-sneakers-web.firebasestorage.app' // Nom du bucket mis à jour
  });
}

const db = admin.firestore();
const storage = admin.storage();

module.exports = { db, admin, storage };
