"use client";

import { useEffect, useMemo, useState } from "react";
import { onAuthStateChanged, getIdTokenResult, type User } from "firebase/auth";
import { auth, db } from "@/services/firebase";
import { collection, getDocs, orderBy, query, doc as fsDoc, updateDoc, serverTimestamp, addDoc } from "firebase/firestore";
import type { Product } from "@/services/firebase";

export default function AdminStockPage() {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [brandFilter, setBrandFilter] = useState<'ALL' | 'NIKE' | 'JORDAN' | 'PROMOS'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftSizes, setDraftSizes] = useState<Record<string, { quantity: number }>>({});
  const [savingId, setSavingId] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState<{ name: string; final: string; original: string; imageUrl: string; brand: string; category: string }>({
    name: '', final: '', original: '', imageUrl: '', brand: 'Nike', category: 'Sneakers'
  });

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
    return byBrand.filter((p) => {
      const name = (p.name || '').toLowerCase();
      const id = (p.id || '').toLowerCase();
      return name.includes(q) || id.includes(q);
    });
  }, [products, brandFilter, searchQuery]);

  const defaultSizes = () => {
    const map: Record<string, { quantity: number }> = {};
    for (let s = 46; s <= 57; s++) map[String(s)] = { quantity: 0 };
    return map;
  };

  const openCreate = () => {
    setCreateForm({ name: '', final: '', original: '', imageUrl: '', brand: 'Nike', category: 'Sneakers' });
    setShowCreate(true);
  };

  const submitCreate = async () => {
    const name = createForm.name.trim();
    const finalNum = Number(createForm.final) || 0;
    const originalNum = createForm.original === '' ? null : Number(createForm.original) || 0;
    if (!name || finalNum <= 0) {
      alert('Veuillez saisir au minimum un nom et un prix.');
      return;
    }
    try {
      const payload: any = {
        name,
        alt: name,
        final: finalNum,
        original: originalNum,
        currency: 'EUR',
        isOnSale: typeof originalNum === 'number' && originalNum > 0 && finalNum < originalNum,
        imageUrl: createForm.imageUrl.trim(),
        brand: createForm.brand.trim() || 'Nike',
        category: createForm.category.trim() || 'Sneakers',
        sizes: defaultSizes(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      const col = collection(db, 'products');
      const docRef = await addDoc(col, payload);
      setProducts((prev) => [{ id: docRef.id, ...payload }, ...prev]);
      setShowCreate(false);
    } catch (e) {
      alert("Impossible d'ajouter le produit.");
    }
  };

  const startEdit = (p: Product) => {
    setEditingId(p.id);
    // Deep copy sizes to draft
    const copy: Record<string, { quantity: number }> = {};
    Object.entries(p.sizes || {}).forEach(([k, v]: any) => {
      copy[k] = { quantity: Number(v?.quantity || 0) };
    });
    setDraftSizes(copy);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setDraftSizes({});
  };

  const saveEdit = async (id: string) => {
    try {
      setSavingId(id);
      const ref = fsDoc(db, 'products', id);
      await updateDoc(ref, { sizes: draftSizes, updatedAt: serverTimestamp() });
      // Update local state
      setProducts((prev) => prev.map((p) => p.id === id ? { ...p, sizes: draftSizes } as any : p));
      setEditingId(null);
      setDraftSizes({});
    } catch (e) {
      alert("Impossible d'enregistrer les quantités.");
    } finally {
      setSavingId(null);
    }
  };

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
            <div className="flex items-center gap-3">
              {/* Barre de recherche */}
              <div className="relative w-full md:w-auto md:min-w-[320px]">
                <label htmlFor="admin-stock-search" className="sr-only">Rechercher un produit</label>
                <input
                  id="admin-stock-search"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Rechercher par nom ou ID"
                  className="w-full rounded-md border border-gray-300 bg-white py-2 pl-10 pr-3 text-sm placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
                <svg className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M10.5 18a7.5 7.5 0 110-15 7.5 7.5 0 010 15z" />
                </svg>
              </div>
              <button
                type="button"
                onClick={openCreate}
                className="hidden md:inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-500"
              >
                + Ajouter un produit
              </button>
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
                <th className="px-4 py-2 text-left">Actions</th>
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
                    {editingId === p.id ? (
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(draftSizes).map(([size, obj]) => {
                          const qty = Number(obj?.quantity || 0);
                          const cls = qty <= 0
                            ? 'border-gray-200 text-gray-400'
                            : qty < 10
                              ? 'border-red-300 bg-red-50 text-red-700'
                              : qty <= 20
                                ? 'border-orange-300 bg-orange-50 text-orange-700'
                                : 'border-green-300 bg-green-50 text-green-700';
                          return (
                            <div key={size} className={`inline-flex items-center gap-1 rounded border px-2 py-0.5 text-xs ${cls}`}>
                              <span className="min-w-[1.5rem] text-center">{size}</span>
                              <button
                                type="button"
                                className="rounded border border-transparent px-1 text-gray-600 hover:bg-white/50"
                                disabled={savingId === p.id}
                                onClick={() => setDraftSizes((d) => ({ ...d, [size]: { quantity: Math.max(0, (d[size]?.quantity || 0) - 1) } }))}
                              >−</button>
                              <input
                                type="number"
                                min={0}
                                value={qty}
                                onChange={(e) => {
                                  const v = Math.max(0, Number(e.target.value) || 0);
                                  setDraftSizes((d) => ({ ...d, [size]: { quantity: v } }));
                                }}
                                className="w-14 rounded border border-gray-300 bg-white px-1 py-0.5 text-xs text-gray-800 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                disabled={savingId === p.id}
                              />
                              <button
                                type="button"
                                className="rounded border border-transparent px-1 text-gray-600 hover:bg-white/50"
                                disabled={savingId === p.id}
                                onClick={() => setDraftSizes((d) => ({ ...d, [size]: { quantity: (d[size]?.quantity || 0) + 1 } }))}
                              >+</button>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(p.sizes ?? {}).map(([size, obj]: any) => {
                          const qty = Number(obj?.quantity || 0);
                          const cls = qty <= 0
                            ? 'border-gray-200 text-gray-400'
                            : qty < 10
                              ? 'border-red-300 bg-red-50 text-red-700'
                              : qty <= 20
                                ? 'border-orange-300 bg-orange-50 text-orange-700'
                                : 'border-green-300 bg-green-50 text-green-700';
                          return (
                            <span key={size} className={`inline-flex items-center rounded border px-2 py-0.5 text-xs ${cls}`}>
                              {size}: {qty}
                            </span>
                          );
                        })}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-2 align-top">
                    {editingId === p.id ? (
                      <div className="flex gap-2">
                        <button
                          type="button"
                          className={`rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-500 ${savingId === p.id ? 'opacity-60 cursor-not-allowed' : ''}`}
                          onClick={() => saveEdit(p.id)}
                          disabled={savingId === p.id}
                        >
                          Enregistrer
                        </button>
                        <button
                          type="button"
                          className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
                          onClick={cancelEdit}
                          disabled={savingId === p.id}
                        >
                          Annuler
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
                        onClick={() => startEdit(p)}
                      >
                        Modifier
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {/* Modal création */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-lg bg-white p-5 shadow-xl">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Ajouter un produit</h2>
              <button className="text-gray-500 hover:text-gray-700" onClick={() => setShowCreate(false)}>✕</button>
            </div>
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-gray-700">Nom</label>
                <input className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm" value={createForm.name} onChange={(e) => setCreateForm((f) => ({ ...f, name: e.target.value }))} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700">Prix</label>
                <input type="number" min={0} className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm" value={createForm.final} onChange={(e) => setCreateForm((f) => ({ ...f, final: e.target.value }))} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700">Prix d'origine (optionnel)</label>
                <input type="number" min={0} className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm" value={createForm.original} onChange={(e) => setCreateForm((f) => ({ ...f, original: e.target.value }))} />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-gray-700">Image URL (optionnel)</label>
                <input className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm" value={createForm.imageUrl} onChange={(e) => setCreateForm((f) => ({ ...f, imageUrl: e.target.value }))} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700">Marque</label>
                <input className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm" value={createForm.brand} onChange={(e) => setCreateForm((f) => ({ ...f, brand: e.target.value }))} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700">Catégorie</label>
                <input className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm" value={createForm.category} onChange={(e) => setCreateForm((f) => ({ ...f, category: e.target.value }))} />
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50" onClick={() => setShowCreate(false)}>Annuler</button>
              <button className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-500" onClick={submitCreate}>Créer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
