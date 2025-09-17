import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, collection, getDocs, query, orderBy, limit, QueryDocumentSnapshot, DocumentData } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Initialiser Firebase
export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getFirestore(app);

export interface Product {
  id: string;
  name: string;
  alt: string;
  final: number | null;
  original: number | null;
  price?: number; // Prix calculé pour la rétrocompatibilité
  currency: string;
  isOnSale: boolean;
  imageUrl: string;
  sizes: Record<string, { quantity: number }>;
  brand?: string;
  category?: string;
  updatedAt: any; // Firestore Timestamp
  createdAt: any; // Firestore Timestamp
}

const productConverter = {
  toFirestore: (product: Product): DocumentData => ({
    ...product
  }),
  fromFirestore: (snapshot: QueryDocumentSnapshot): Product => {
    const data = snapshot.data();
    // Normaliser sizes -> { [size]: { quantity } }
    const rawSizes = data.sizes || {};
    const sizes: Record<string, { quantity: number }> = {};
    Object.keys(rawSizes || {}).forEach((k) => {
      const v = rawSizes[k];
      sizes[k] = typeof v === 'number' ? { quantity: v } : { quantity: Number(v?.quantity) || 0 };
    });
    return {
      id: snapshot.id,
      name: data.name || '',
      alt: data.alt || '',
      final: data.final || null,
      original: data.original || null,
      currency: data.currency || 'EUR',
      isOnSale: data.isOnSale || false,
      imageUrl: data.imageUrl || '',
      sizes,
      brand: data.brand || 'Nike',
      category: data.category || 'Sneakers',
      updatedAt: data.updatedAt,
      createdAt: data.createdAt
    };
  }
};

export const getProducts = async (limitCount: number = 20): Promise<Product[]> => {
  try {
    const productsRef = collection(db, 'products').withConverter(productConverter);
    const q = query(productsRef, orderBy('createdAt', 'desc'), limit(limitCount));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id
    }));
  } catch (error) {
    console.error('Error getting products:', error);
    return [];
  }
};

export const getProductById = async (id: string): Promise<Product | null> => {
  try {
    const productsRef = collection(db, 'products').withConverter(productConverter);
    const q = query(productsRef);
    const querySnapshot = await getDocs(q);
    
    const product = querySnapshot.docs
      .find(doc => doc.id === id)?.data();
    
    return product ? { ...product, id } : null;
  } catch (error) {
    console.error('Error getting product:', error);
    return null;
  }
};
