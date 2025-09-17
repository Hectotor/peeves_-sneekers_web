"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function CheckoutSuccessPage() {
  const params = useSearchParams();
  const orderId = params.get("orderId");
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-6 text-center shadow-sm">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-700">✔</div>
        <h1 className="text-2xl font-bold text-gray-900">Paiement réussi</h1>
        <p className="mt-2 text-sm text-gray-600">Merci pour votre commande.</p>
        {orderId && (
          <p className="mt-1 text-xs text-gray-500">Numéro de commande: <span className="font-mono">{orderId}</span></p>
        )}
        <Link href="/" className="mt-6 inline-flex rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-500">Retour à l'accueil</Link>
      </div>
    </div>
  );
}
