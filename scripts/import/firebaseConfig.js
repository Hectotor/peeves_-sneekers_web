// Configuration Firebase Admin SDK
const admin = require('firebase-admin');

// Vérifier si l'application Firebase a déjà été initialisée
if (!admin.apps.length) {
  const serviceAccount = require('./serviceAccountKey.json');

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://peeves-sneakers-web.firebaseio.com'
  });
}

const db = admin.firestore();

// Activer le mode débogage
process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080'; // Décommentez si vous utilisez l'émulateur local

module.exports = { db, admin };
