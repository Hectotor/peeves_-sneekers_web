'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { fetchProducts } from '@/services/productService';
import { Product } from '@/services/firebase';

type BrandFilter = 'ALL' | 'NIKE' | 'JORDAN' | 'PROMOS';

export default function FeaturedProducts({ brandFilter = 'ALL', searchQuery = '' }: { brandFilter?: BrandFilter; searchQuery?: string }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const ITEMS_PER_PAGE = 25;
 
  const priceFormatter = new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  });

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const data = await fetchProducts(300); // Récupérer un lot suffisant pour la pagination côté client
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

  // Réinitialiser la page courante si le filtre ou la recherche change
  useEffect(() => {
    setCurrentPage(1);
  }, [brandFilter, searchQuery]);

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
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">Nouveautés</h2>
          <a href="#collection" className="inline-block text-sm font-medium text-indigo-600 hover:text-indigo-500">
            Parcourir la collection
          </a>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Aucun produit disponible pour le moment.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-x-4 gap-y-10 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 xl:gap-x-6">
              {(() => {
                const filtered = products.filter((p) => {
                  if (brandFilter === 'ALL') return true;
                  const name = (p.name || '').toLowerCase();
                  if (brandFilter === 'NIKE') return name.startsWith('nike');
                  if (brandFilter === 'JORDAN') return name.startsWith('jordan');
                  if (brandFilter === 'PROMOS') {
                    const hasOriginal = typeof p.original === 'number' && p.original > 0;
                    const discounted = hasOriginal && typeof p.final === 'number' && (p.final as number) < (p.original as number);
                    return p.isOnSale || discounted;
                  }
                  return true;
                });
                const q = searchQuery.trim().toLowerCase();
                const filteredBySearch = q ? filtered.filter(p => (p.name || '').toLowerCase().includes(q)) : filtered;
                const totalPages = Math.max(1, Math.ceil(filteredBySearch.length / ITEMS_PER_PAGE));
                const start = (currentPage - 1) * ITEMS_PER_PAGE;
                const pageItems = filteredBySearch.slice(start, start + ITEMS_PER_PAGE);
                return pageItems.map((product) => (
              <div key={product.id} className="group relative">
                <div className="relative w-full overflow-hidden rounded-md bg-white border border-gray-100 aspect-square group-hover:opacity-90">
                  {product.imageUrl ? (
                    <Image
                      src={product.imageUrl}
                      alt={product.alt || product.name}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 20vw"
                      className="object-contain p-4"
                      priority
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center p-4 text-center text-gray-500">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p className="mt-2 text-sm">Aucune image</p>
                    </div>
                  )}
                </div>
                <div className="mt-4 flex justify-between">
                  <div>
                    <h3 className="text-sm text-gray-700">
                      <Link href={`/product/${product.id}`}>
                        <span aria-hidden="true" className="absolute inset-0" />
                        {product.name}
                      </Link>
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      En stock: {Object.values(product.sizes ?? {}).reduce((acc, s: any) => acc + (Number(s?.quantity) || 0), 0)}
                    </p>
                  </div>
                  {(() => {
                    const finalPrice = product.final ?? product.original ?? 0;
                    const hasOriginal = typeof product.original === 'number' && product.original > 0;
                    const discount = hasOriginal && typeof product.final === 'number' && product.final < (product.original as number);
                    const percent = discount ? Math.round(((product.original as number) - (product.final as number)) / (product.original as number) * 100) : 0;
                    return (
                      <div className="text-right">
                        <div className="flex flex-col items-end">
                          <div className="flex items-baseline gap-2">
                            <span className="text-sm font-semibold text-gray-900">{priceFormatter.format(finalPrice)}</span>
                            {discount && (
                              <span className="text-xs text-gray-500 line-through">{priceFormatter.format(product.original as number)}</span>
                            )}
                          </div>
                          {discount && (
                            <span className="mt-1 inline-flex items-center rounded-full bg-red-50 px-1.5 py-0.5 text-xs font-semibold text-red-600 ring-1 ring-inset ring-red-200">
                              -{percent}%
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>
                ));
              })()}
            </div>

            {/* Pagination */}
            {(() => {
              const filteredCount = products.filter((p) => {
                if (brandFilter === 'ALL') return true;
                const name = (p.name || '').toLowerCase();
                if (brandFilter === 'NIKE') return name.startsWith('nike');
                if (brandFilter === 'JORDAN') return name.startsWith('jordan');
                if (brandFilter === 'PROMOS') {
                  const hasOriginal = typeof p.original === 'number' && p.original > 0;
                  const discounted = hasOriginal && typeof p.final === 'number' && (p.final as number) < (p.original as number);
                  return p.isOnSale || discounted;
                }
                return true;
              }).length;
              const q = searchQuery.trim().toLowerCase();
              const searchCount = q ? products.filter((p) => (p.name || '').toLowerCase().includes(q)).length : filteredCount;
              const totalPages = Math.max(1, Math.ceil(searchCount / ITEMS_PER_PAGE));

              const makePages = (): (number | string)[] => {
                const pages: (number | string)[] = [];
                const add = (p: number | string) => pages.push(p);
                if (totalPages <= 7) {
                  for (let i = 1; i <= totalPages; i++) add(i);
                } else {
                  const start = Math.max(2, currentPage - 1);
                  const end = Math.min(totalPages - 1, currentPage + 1);
                  add(1);
                  if (start > 2) add('...');
                  for (let i = start; i <= end; i++) add(i);
                  if (end < totalPages - 1) add('...');
                  add(totalPages);
                }
                return pages;
              };

              return (
                <div className="mt-10 flex items-center justify-center gap-2">
                  <button
                    className={`px-3 py-1.5 text-sm rounded border ${currentPage === 1 ? 'text-gray-400 border-gray-200 cursor-not-allowed' : 'text-gray-700 border-gray-300 hover:bg-gray-50'}`}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    Précédent
                  </button>
                  {makePages().map((p, idx) => (
                    <button
                      key={`${p}-${idx}`}
                      className={`px-3 py-1.5 text-sm rounded border ${
                        p === '...'
                          ? 'text-gray-500 border-transparent cursor-default'
                          : (p as number) === currentPage
                            ? 'bg-indigo-600 text-white border-indigo-600'
                            : 'text-gray-700 border-gray-300 hover:bg-gray-50'
                      }`}
                      onClick={() => typeof p === 'number' && setCurrentPage(p as number)}
                      disabled={p === '...'}
                    >
                      {p}
                    </button>
                  ))}
                  <button
                    className={`px-3 py-1.5 text-sm rounded border ${currentPage === totalPages ? 'text-gray-400 border-gray-200 cursor-not-allowed' : 'text-gray-700 border-gray-300 hover:bg-gray-50'}`}
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Suivant
                  </button>
                </div>
              );
            })()}
          </>
        )}

        <div className="mt-8 text-center md:hidden">
          <a href="#collection" className="inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-500">
            Parcourir la collection
          </a>
        </div>
      </div>
    </div>
  );
}
