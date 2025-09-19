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

  // Simulated credit card form state
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [cardMonth, setCardMonth] = useState<string>("");
  const [cardYear, setCardYear] = useState<string>("");
  // We will render all methods; no selection pills

  const formatCardNumber = (v: string) =>
    v.replace(/[^0-9]/g, "").slice(0, 16).replace(/(\d{4})(?=\d)/g, "$1 ");

  const months = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0"));
  const years = Array.from({ length: 8 }, (_, i) => String(new Date().getFullYear() + i));

  const formValid = useMemo(() => {
    const digits = cardNumber.replace(/\s/g, "");
    const isNumOk = digits.length === 16;
    const isNameOk = cardName.trim().length >= 2;
    const isCvvOk = /^\d{3,4}$/.test(cardCvv);
    const isMonthOk = months.includes(cardMonth);
    const isYearOk = years.includes(cardYear);
    return isNumOk && isNameOk && isCvvOk && isMonthOk && isYearOk;
  }, [cardNumber, cardName, cardCvv, cardMonth, cardYear]);

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

  const simulatePayment = async (paymentMethod: 'card' | 'applepay' | 'paypal') => {
    if (!user) return;
    if (items.length === 0) return;
    if (paymentMethod === 'card' && !formValid) {
      alert("Veuillez renseigner des informations de carte valides (simulation).");
      return;
    }
    setProcessing(true);
    try {
      // Create an order in Firestore
      const order = {
        userId: user.uid,
        items,
        amount: totals.total,
        currency: "EUR",
        status: "paid",
        paymentMethod,
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
        <div className="rounded-lg border border-gray-200 p-6 h-fit bg-white space-y-6">
          <h2 className="text-lg font-semibold text-gray-900">Paiement (simulation)</h2>

          {/* Boutons Apple Pay / PayPal (simulation) */}
          <div className="space-y-3">
            <button
              type="button"
              onClick={() => simulatePayment('applepay')}
              disabled={processing}
              className={`w-full flex items-center justify-center gap-2 rounded-md bg-black px-4 py-2.5 text-white ${processing ? 'opacity-70 cursor-not-allowed' : 'hover:bg-gray-900'}`}
            >
              {/* Apple logo */}
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 22 22" className="h-4 w-4" fill="currentColor"><path d="M16.365 1.43c0 1.14-.42 2.06-1.26 2.86-.95.93-2.02 1.51-3.22 1.4-.05-1.08.47-2.1 1.26-2.88.85-.83 2.2-1.46 3.22-1.38-.02.03-.02.06-.02.1zM20.18 16.28c-.37.86-.8 1.63-1.3 2.33-.68.96-1.23 1.63-1.66 2.01-.65.6-1.34.91-2.07.93-.53.02-1.17-.15-1.93-.52-.76-.36-1.46-.54-2.09-.54-.66 0-1.38.18-2.17.54-.79.37-1.43.55-1.93.54-.72-.03-1.43-.35-2.13-.98-.45-.4-1.02-1.09-1.7-2.09-.73-1.05-1.34-2.26-1.82-3.63-.51-1.5-.76-2.95-.76-4.35 0-1.6.34-2.98 1.02-4.13.53-.92 1.24-1.66 2.12-2.22.88-.56 1.84-.85 2.89-.88.57-.01 1.32.17 2.25.54.93.37 1.52.56 1.79.56.2 0 .84-.2 1.95-.6 1.05-.36 1.94-.51 2.66-.46 1.96.16 3.43.92 4.4 2.3-1.75 1.06-2.63 2.55-2.65 4.46-.02 1.49.55 2.73 1.72 3.72.51.43 1.07.76 1.69.98-.14.37-.3.74-.47 1.11z"/></svg>
              Payer avec Apple Pay (simulation)
            </button>
            <button
              type="button"
              onClick={() => simulatePayment('paypal')}
              disabled={processing}
              className={`w-full flex items-center justify-center gap-2 rounded-md bg-[#ffc439] px-4 py-2.5 text-gray-900 ${processing ? 'opacity-70 cursor-not-allowed' : 'hover:bg-[#ffb300]'}`}
            >
              {/* PayPal wordmark style */}
              <span className="font-semibold">Pay</span><span className="font-semibold text-[#003087]">Pal</span> (simulation)
            </button>
          </div>

          {/* Formulaire */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-700">Numéro de carte</label>
              <input
                inputMode="numeric"
                autoComplete="cc-number"
                value={cardNumber}
                onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                placeholder="1234 5678 9012 3456"
                className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm tracking-widest font-mono placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700">Nom du titulaire</label>
              <input
                autoComplete="cc-name"
                value={cardName}
                onChange={(e) => setCardName(e.target.value.toUpperCase())}
                placeholder="NOM PRÉNOM"
                className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700">Mois</label>
                <select
                  value={cardMonth}
                  onChange={(e) => setCardMonth(e.target.value)}
                  className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="">MM</option>
                  {months.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700">Année</label>
                <select
                  value={cardYear}
                  onChange={(e) => setCardYear(e.target.value)}
                  className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="">AAAA</option>
                  {years.map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700">CVV</label>
                <input
                  inputMode="numeric"
                  autoComplete="cc-csc"
                  value={cardCvv}
                  onChange={(e) => setCardCvv(e.target.value.replace(/[^0-9]/g, '').slice(0, 4))}
                  placeholder="123"
                  className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-gray-100" />

          <h2 className="text-lg font-semibold text-gray-900">Résumé</h2>
          <div className="mt-4 space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Sous-total</span>
              <span className="text-gray-900 font-medium">{price.format(totals.total)}</span>
            </div>
          </div>
          <button
            onClick={() => simulatePayment('card')}
            disabled={processing || !formValid}
            className={`mt-6 w-full rounded-md px-4 py-2.5 text-white ${processing || !formValid ? "bg-indigo-400 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-500"}`}
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
