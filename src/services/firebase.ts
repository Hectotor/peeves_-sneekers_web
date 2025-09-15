import { initializeApp, getApps, getApp } from 'firebase/app';
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
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

export interface Product {
  id: string;
  gender: string;
  masterCategory: string;
  subCategory: string;
  articleType: string;
  baseColour: string;
  season: string;
  year: number | null;
  usage: string;
  productDisplayName: string;
  quantity: number;
  imageUrl: string;
  price?: number;
}

const productConverter = {
  toFirestore: (product: Product): DocumentData => ({
    ...product
  }),
  fromFirestore: (snapshot: QueryDocumentSnapshot): Product => {
    const data = snapshot.data();
    return {
      id: snapshot.id,
      gender: data.gender || '',
      masterCategory: data.masterCategory || '',
      subCategory: data.subCategory || '',
      articleType: data.articleType || '',
      baseColour: data.baseColour || '',
      season: data.season || '',
      year: data.year ? Number(data.year) : null,
      usage: data.usage || '',
      productDisplayName: data.productDisplayName || '',
      quantity: data.quantity || 0,
      imageUrl: data.imageUrl || '',
      price: data.price || 0
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
