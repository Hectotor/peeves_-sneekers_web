import { getProducts, getProductById, Product } from './firebase';

export const fetchProducts = async (limit: number = 20): Promise<Product[]> => {
  try {
    const products = await getProducts(limit);
    return products.map(product => ({
      ...product,
      // Utiliser le prix final comme prix principal
      price: product.final || 0
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
        price: product.final || 0
      };
    }
    return null;
  } catch (error) {
    console.error('Error fetching product:', error);
    return null;
  }
};

export const getProductsByCategory = async (category: string): Promise<Product[]> => {
  const products = await fetchProducts(100);
  return products.filter(product => 
    (product.category?.toLowerCase() === category.toLowerCase()) ||
    (product.brand?.toLowerCase() === category.toLowerCase())
  );
};

export const searchProducts = async (query: string): Promise<Product[]> => {
  const products = await fetchProducts(100);
  const searchTerm = query.toLowerCase();
  
  return products.filter(product => 
    (product.name?.toLowerCase().includes(searchTerm)) ||
    (product.alt?.toLowerCase().includes(searchTerm)) ||
    (product.brand?.toLowerCase().includes(searchTerm)) ||
    (product.category?.toLowerCase().includes(searchTerm))
  );
};

export const getProductsOnSale = async (limit: number = 20): Promise<Product[]> => {
  const products = await fetchProducts(100);
  return products
    .filter(product => product.isOnSale)
    .slice(0, limit);
};

export const getNewArrivals = async (limit: number = 20): Promise<Product[]> => {
  const products = await fetchProducts(limit);
  return products.sort((a, b) => 
    (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0)
  ).slice(0, limit);
};
