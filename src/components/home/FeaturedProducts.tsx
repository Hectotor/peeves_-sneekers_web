'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { fetchProducts } from '@/services/productService';
import { Product } from '@/services/firebase';

export default function FeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const data = await fetchProducts(8); // Récupérer 8 produits
        setProducts(data);
      } catch (err) {
        console.error('Failed to load products:', err);
        setError('Impossible de charger les produits. Veuillez réessayer plus tard.');
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  if (loading) {
    return (
      <div className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 w-1/4 bg-gray-200 rounded"></div>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="space-y-4">
                  <div className="h-64 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-red-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="md:flex md:items-center md:justify-between mb-8">
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">Nouveautés</h2>
          <Link 
            href="/shop" 
            className="hidden text-sm font-medium text-indigo-600 hover:text-indigo-500 md:block transition-colors duration-200"
          >
            Parcourir la collection
            <span aria-hidden="true"> &rarr;</span>
          </Link>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Aucun produit disponible pour le moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
            {products.map((product) => (
              <div key={product.id} className="group relative">
                <div className="aspect-h-1 aspect-w-1 w-full overflow-hidden rounded-md bg-gray-200 lg:aspect-none group-hover:opacity-75 lg:h-80">
                  <div className="relative h-full w-full bg-gray-100 flex items-center justify-center">
                    {product.imageUrl ? (
                      <Image
                        src={product.imageUrl}
                        alt={product.productDisplayName}
                        className="h-full w-full object-cover object-center"
                        width={300}
                        height={400}
                        priority
                        onError={(e) => {
                          const container = (e.target as HTMLElement).parentElement;
                          if (container) {
                            const errorDiv = document.createElement('div');
                            errorDiv.className = 'p-4 text-center text-gray-500';
                            errorDiv.innerHTML = `
                              <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              <p class="mt-2 text-sm">Image non disponible</p>
                            `;
                            container.innerHTML = '';
                            container.appendChild(errorDiv);
                          }
                        }}
                      />
                    ) : (
                      <div className="p-4 text-center text-gray-500">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p className="mt-2 text-sm">Aucune image</p>
                      </div>
                    )}
                  </div>
                </div>
                <div className="mt-4 flex justify-between">
                  <div>
                    <h3 className="text-sm text-gray-700">
                      <Link href={`/product/${product.id}`}>
                        <span aria-hidden="true" className="absolute inset-0" />
                        {product.productDisplayName}
                      </Link>
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {product.gender} • {product.articleType}
                    </p>
                    <p className="mt-1 text-sm text-gray-500">
                      En stock: {product.quantity}
                    </p>
                  </div>
                  <p className="text-sm font-medium text-gray-900">
                    {product.price?.toFixed(2)} €
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 text-center md:hidden">
          <Link 
            href="/shop" 
            className="inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-500 transition-colors duration-200"
          >
            Parcourir la collection
            <svg className="ml-2 h-5 w-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
              <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}
