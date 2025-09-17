"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, type User } from "firebase/auth";
import { auth, db } from "@/services/firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import Image from "next/image";

type CartItem = {
  id: string;
  name: string;
  imageUrl: string;
  price: number;
  originalPrice?: number | null;
  size: string;
  qty: number;
};

export default function CheckoutPage() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const router = useRouter();

  const price = useMemo(
    () =>
      new Intl.NumberFormat("fr-FR", {
        style: "currency",
        currency: "EUR",
      }),
    []
  );

  const totals = useMemo(() => {
    const total = items.reduce((acc, it) => acc + it.price * it.qty, 0);
    const originalTotal = items.reduce((acc, it) => acc + (it.originalPrice ?? it.price) * it.qty, 0);
    const savings = Math.max(0, originalTotal - total);
    return { total, originalTotal, savings };
  }, [items]);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (!u) {
        router.replace("/login");
        return;
      }
      setUser(u);
    });
    // load cart
    const raw = localStorage.getItem("cart");
    const data: CartItem[] = raw ? JSON.parse(raw) : [];
    setItems(Array.isArray(data) ? data : []);
    setLoading(false);
    return () => unsub();
  }, [router]);

  const simulatePayment = async () => {
    if (!user) return;
    if (items.length === 0) return;
    setProcessing(true);
    try {
      // Create an order in Firestore
      const order = {
        userId: user.uid,
        items,
        amount: totals.total,
        currency: "EUR",
        status: "paid",
        createdAt: serverTimestamp(),
      };
      const ref = await addDoc(collection(db, "orders"), order);
      // Clear cart
      localStorage.setItem("cart", JSON.stringify([]));
      window.dispatchEvent(new Event("cart:updated"));
      // Go to success page
      router.replace(`/checkout/success?orderId=${ref.id}`);
    } catch (e) {
      alert("Le paiement simulé a échoué. Veuillez réessayer.");
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-600">Chargement…</div>;
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center text-gray-700">
          <p>Votre panier est vide.</p>
          <button onClick={() => router.push("/")} className="mt-4 rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-500">Retour à l'accueil</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-screen-lg px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-2xl font-bold text-gray-900">Checkout (simulation)</h1>
      <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          {items.map((it, idx) => (
            <div key={`${it.id}-${idx}-${it.size}`} className="flex gap-4 rounded-lg border border-gray-200 p-4 bg-white">
              <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded bg-white ring-1 ring-gray-100">
                {it.imageUrl ? (
                  <Image src={it.imageUrl} alt={it.name} fill sizes="80px" className="object-contain p-2" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-gray-400">IMG</div>
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium text-gray-900">{it.name}</div>
                  <div className="text-sm text-gray-700">{price.format(it.price)} × {it.qty}</div>
                </div>
                <div className="text-xs text-gray-500 mt-1">Pointure {it.size}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="rounded-lg border border-gray-200 p-6 h-fit bg-white">
          <h2 className="text-lg font-semibold text-gray-900">Résumé</h2>
          <div className="mt-4 space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Sous-total</span>
              <span className="text-gray-900 font-medium">{price.format(totals.total)}</span>
            </div>
          </div>
          <button
            onClick={simulatePayment}
            disabled={processing}
            className={`mt-6 w-full rounded-md bg-indigo-600 px-4 py-2.5 text-white hover:bg-indigo-500 ${processing ? "opacity-70 cursor-not-allowed" : ""}`}
          >
            {processing ? "Traitement…" : "Payer maintenant (simulation)"}
          </button>
          <p className="mt-3 text-xs text-gray-500">Ce paiement est simulé: aucun prélèvement réel ne sera effectué.</p>
        </div>
      </div>
      </div>
    </div>
  );
}
