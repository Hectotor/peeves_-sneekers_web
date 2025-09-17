"use client";

import { useEffect, useMemo, useState } from "react";
import { onAuthStateChanged, getIdTokenResult, type User } from "firebase/auth";
import { auth, db } from "@/services/firebase";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import type { Product } from "@/services/firebase";

export default function AdminStockPage() {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [brandFilter, setBrandFilter] = useState<'ALL' | 'NIKE' | 'JORDAN' | 'PROMOS'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const totalStock = (p: Product) =>
    Object.values(p.sizes ?? {}).reduce((acc, s: any) => acc + (Number(s?.quantity) || 0), 0);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) {
        window.location.href = "/login";
        return;
      }
      setUser(u);
      const token = await getIdTokenResult(u, true);
      const admin = !!token.claims?.admin;
      setIsAdmin(admin);
      if (!admin) {
        window.location.href = "/";
        return;
      }
      try {
        const q = query(collection(db, "products"), orderBy("createdAt", "desc"));
        const snap = await getDocs(q);
        const list: Product[] = [] as any;
        snap.forEach((docu) => list.push({ id: docu.id, ...(docu.data() as any) } as any));
        setProducts(list);
      } finally {
        setLoading(false);
      }
    });
    return () => unsub();
  }, []);
  const pills = [
    { key: 'ALL' as const, label: 'Tout' },
    { key: 'NIKE' as const, label: 'Nike' },
    { key: 'JORDAN' as const, label: 'Jordan' },
    { key: 'PROMOS' as const, label: 'Promotions' },
  ];

  const filteredProducts = useMemo(() => {
    const byBrand = products.filter((p) => {
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
    if (!q) return byBrand;
    return byBrand.filter((p) => (p.name || '').toLowerCase().includes(q));
  }, [products, brandFilter, searchQuery]);

  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-600">Chargement…</div>;
  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-2xl font-bold text-gray-900">Administration · Stock</h1>
        {/* Filtres et recherche */}
        <div className="mt-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            {/* Pilules */}
            <div className="flex flex-wrap gap-2">
              {pills.map((pill) => (
                <button
                  key={pill.key}
                  onClick={() => setBrandFilter(pill.key)}
                  className={
                    brandFilter === pill.key
                      ? 'rounded-full border border-indigo-600 bg-indigo-50 px-3 py-1.5 text-xs font-medium text-indigo-700'
                      : 'rounded-full border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50'
                  }
                >
                  {pill.label}
                </button>
              ))}
            </div>

            {/* Barre de recherche */}
            <div className="relative w-full md:w-auto md:min-w-[320px]">
              <label htmlFor="admin-stock-search" className="sr-only">Rechercher un produit</label>
              <input
                id="admin-stock-search"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher par nom (ex: Air Max, Jordan AJ1...)"
                className="w-full rounded-md border border-gray-300 bg-white py-2 pl-10 pr-3 text-sm placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <svg className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M10.5 18a7.5 7.5 0 110-15 7.5 7.5 0 010 15z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="mt-6 overflow-x-auto rounded-lg border border-gray-200 bg-white">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="px-4 py-2 text-left">Produit</th>
                <th className="px-4 py-2 text-right">Prix</th>
                <th className="px-4 py-2 text-right">Stock total</th>
                <th className="px-4 py-2 text-left">Tailles</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((p) => (
                <tr key={p.id} className="border-t align-top">
                  <td className="px-4 py-2">
                    <div className="font-medium text-gray-900">{p.name}</div>
                    <div className="text-xs text-gray-500">#{p.id}</div>
                  </td>
                  <td className="px-4 py-2 text-right">
                    {(() => {
                      const finalPrice = (p.final ?? p.original ?? 0) as number;
                      const hasOriginal = typeof p.original === 'number' && p.original > 0;
                      const discounted = hasOriginal && typeof p.final === 'number' && (p.final as number) < (p.original as number);
                      const fmt = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' });
                      return (
                        <div className="inline-flex flex-col items-end gap-0.5">
                          <span className="font-semibold text-gray-900">{fmt.format(finalPrice)}</span>
                          {discounted && (
                            <span className="text-xs text-gray-500 line-through">{fmt.format(p.original as number)}</span>
                          )}
                        </div>
                      );
                    })()}
                  </td>
                  <td className="px-4 py-2 text-right font-semibold">{totalStock(p)}</td>
                  <td className="px-4 py-2">
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(p.sizes ?? {}).map(([size, obj]: any) => (
                        <span key={size} className={`inline-flex items-center rounded border px-2 py-0.5 text-xs ${obj?.quantity > 0 ? 'border-gray-300 text-gray-700' : 'border-gray-200 text-gray-400'}`}>
                          {size}: {Number(obj?.quantity || 0)}
                        </span>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
