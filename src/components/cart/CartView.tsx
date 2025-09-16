"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { auth } from "@/services/firebase";
import { useRouter } from "next/navigation";

type CartItem = {
  id: string;
  name: string;
  imageUrl: string;
  price: number; // final price per unit
  originalPrice?: number | null;
  size: string;
  qty: number;
};

export default function CartView() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const router = useRouter();

  const price = useMemo(
    () =>
      new Intl.NumberFormat("fr-FR", {
        style: "currency",
        currency: "EUR",
      }),
    []
  );

  const load = () => {
    if (typeof window === "undefined") return;
    const raw = localStorage.getItem("cart");
    const data: CartItem[] = raw ? JSON.parse(raw) : [];
    setItems(Array.isArray(data) ? data : []);
  };

  const save = (next: CartItem[]) => {
    localStorage.setItem("cart", JSON.stringify(next));
    window.dispatchEvent(new Event("cart:updated"));
    setItems(next);
  };

  useEffect(() => {
    load();
    const unsub = onAuthStateChanged(auth, (u) => setCurrentUser(u));
    const onCustom = () => load();
    const onStorage = (e: StorageEvent) => {
      if (e.key === "cart") load();
    };
    window.addEventListener("cart:updated", onCustom as EventListener);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener("cart:updated", onCustom as EventListener);
      window.removeEventListener("storage", onStorage);
      unsub();
    };
  }, []);

  const updateQty = (index: number, qty: number) => {
    const next = [...items];
    next[index] = { ...next[index], qty: Math.max(1, qty) };
    save(next);
  };

  const removeItem = (index: number) => {
    const next = items.filter((_, i) => i !== index);
    save(next);
  };

  const clearCart = () => {
    save([]);
  };

  const totals = useMemo(() => {
    const total = items.reduce((acc, it) => acc + it.price * it.qty, 0);
    const originalTotal = items.reduce((acc, it) => acc + (it.originalPrice ?? it.price) * it.qty, 0);
    const savings = Math.max(0, originalTotal - total);
    const discountPercent = originalTotal > 0 ? Math.round((savings / originalTotal) * 100) : 0;
    return { total, originalTotal, savings, discountPercent };
  }, [items]);

  return (
    <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-end justify-between">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Votre panier</h1>
        {items.length > 0 && (
          <Link href="/" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">Continuer mes achats →</Link>
        )}
      </div>

      {items.length === 0 ? (
        <div className="mt-12 rounded-xl border border-dashed border-gray-300 p-12 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
            🛍️
          </div>
          <h2 className="mt-4 text-lg font-semibold text-gray-900">Votre panier est vide</h2>
          <p className="mt-2 text-sm text-gray-600">Explorez nos nouveautés et ajoutez vos paires préférées.</p>
          <Link href="/" className="mt-6 inline-flex items-center justify-center rounded-md bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-indigo-500">Découvrir les produits</Link>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Liste des articles */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((it, idx) => (
              <div key={`${it.id}-${idx}-${it.size}`} className="flex gap-4 rounded-xl border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow bg-white">
                <div className="relative h-28 w-28 flex-shrink-0 overflow-hidden rounded-lg bg-white ring-1 ring-gray-100">
                  {it.imageUrl ? (
                    <Image src={it.imageUrl} alt={it.name} fill sizes="112px" className="object-contain p-2" />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-gray-400">IMG</div>
                  )}
                </div>
                <div className="flex flex-1 justify-between">
                  <div>
                    <Link href={`/product/${it.id}`} className="text-sm font-medium text-gray-900 hover:underline">
                      {it.name}
                    </Link>
                    <div className="mt-1 text-sm text-gray-500">Pointure: {it.size}</div>
                    <div className="mt-2 flex items-baseline gap-2">
                      <span className="text-base font-semibold text-gray-900">{price.format(it.price)}</span>
                      {it.originalPrice && it.originalPrice > it.price && (
                        <span className="text-sm text-gray-500 line-through">{price.format(it.originalPrice)}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className="inline-flex items-center rounded-full border border-gray-300 bg-white shadow-sm">
                      <button
                        className="px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 rounded-l-full"
                        onClick={() => updateQty(idx, items[idx].qty - 1)}
                        aria-label="Diminuer la quantité"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        min={1}
                        value={it.qty}
                        onChange={(e) => updateQty(idx, Number(e.target.value) || 1)}
                        className="no-spinner w-16 border-x border-gray-300 py-1.5 text-center text-sm focus:outline-none"
                      />
                      <button
                        className="px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 rounded-r-full"
                        onClick={() => updateQty(idx, items[idx].qty + 1)}
                        aria-label="Augmenter la quantité"
                      >
                        +
                      </button>
                    </div>
                    <button
                      className="text-sm text-red-600 hover:text-red-700"
                      onClick={() => removeItem(idx)}
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Résumé */}
          <div className="rounded-xl border border-gray-200 p-6 shadow-sm lg:sticky lg:top-8 h-fit bg-white">
            <h2 className="text-lg font-semibold text-gray-900">Résumé</h2>
            <div className="mt-4 space-y-2 text-sm">
              {totals.savings > 0 && (
                <div className="flex items-baseline justify-between">
                  <span className="text-gray-600">Sous-total avant remise</span>
                  <span className="text-gray-500 line-through">{price.format(totals.originalTotal)}</span>
                </div>
              )}
              <div className="flex items-baseline justify-between">
                <span className="text-gray-600">Sous-total</span>
                <span className="text-gray-900 font-medium">{price.format(totals.total)}</span>
              </div>
              {totals.savings > 0 && (
                <div className="flex items-center justify-between text-green-600">
                  <span>Économies</span>
                  <span>-{price.format(totals.savings)} ({totals.discountPercent}%)</span>
                </div>
              )}
            </div>
            {/* Code promo */}
            <div className="mt-5">
              <label htmlFor="coupon" className="text-sm font-medium text-gray-700">Code promo</label>
              <div className="mt-2 flex gap-2">
                <input id="coupon" type="text" placeholder="Saisir un code" className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
                <button className="rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Appliquer</button>
              </div>
            </div>

            <button
              className="mt-6 w-full rounded-md bg-indigo-600 px-4 py-2.5 text-white hover:bg-indigo-500 shadow-sm"
              onClick={() => {
                if (!currentUser) {
                  router.push("/login");
                } else {
                  router.push("/checkout");
                }
              }}
            >
              Passer la commande
            </button>
            <button className="mt-3 w-full rounded-md border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50" onClick={clearCart}>Vider le panier</button>
            <p className="mt-3 text-xs text-gray-500">Livraison estimée sous 3–5 jours ouvrés.</p>
          </div>
        </div>
      )}
    </div>
  );
}
