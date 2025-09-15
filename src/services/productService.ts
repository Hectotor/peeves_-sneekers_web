import { getProducts, getProductById, Product } from './firebase';

export const fetchProducts = async (limit: number = 20): Promise<Product[]> => {
  try {
    const products = await getProducts(limit);
    // Ajouter un prix aléatoire pour l'exemple si non défini
    return products.map(product => ({
      ...product,
      price: product.price || Math.floor(Math.random() * 200) + 50 // Prix entre 50 et 250
    }));
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
};

export const fetchProductById = async (id: string): Promise<Product | null> => {
  try {
    const product = await getProductById(id);
    if (product) {
      return {
        ...product,
        price: product.price || Math.floor(Math.random() * 200) + 50 // Prix entre 50 et 250
      };
    }
    return null;
  } catch (error) {
    console.error('Error fetching product:', error);
    return null;
  }
};

export const getProductsByCategory = async (category: string): Promise<Product[]> => {
  const products = await fetchProducts(100); // Récupérer plus de produits pour la recherche
  return products.filter(product => 
    product.articleType.toLowerCase() === category.toLowerCase() ||
    product.subCategory.toLowerCase() === category.toLowerCase()
  );
};

export const searchProducts = async (query: string): Promise<Product[]> => {
  const products = await fetchProducts(100); // Récupérer plus de produits pour la recherche
  const searchTerm = query.toLowerCase();
  
  return products.filter(product => 
    product.productDisplayName.toLowerCase().includes(searchTerm) ||
    product.articleType.toLowerCase().includes(searchTerm) ||
    product.baseColour.toLowerCase().includes(searchTerm)
  );
};
