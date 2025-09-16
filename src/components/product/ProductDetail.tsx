"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import type { Product } from "@/services/firebase";

type Props = {
  product: Product;
};

export default function ProductDetail({ product }: Props) {
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  const priceFormatter = useMemo(
    () =>
      new Intl.NumberFormat("fr-FR", {
        style: "currency",
        currency: "EUR",
      }),
    []
  );

  const sizes = useMemo(() => Array.from({ length: 12 }, (_, i) => String(46 + i)), []); // 46..57

  const inStock = (product.quantity ?? 0) > 0;

  const handleAddToCart = async () => {
    if (!selectedSize) return;
    setAdding(true);
    try {
      // Simple localStorage cart for now
      const item = {
        id: product.id,
        name: product.name,
        imageUrl: product.imageUrl,
        price: product.final ?? product.original ?? 0,
        originalPrice: product.original ?? null,
        size: selectedSize,
        qty: 1,
      };
      if (typeof window !== "undefined") {
        const raw = localStorage.getItem("cart");
        const cart = raw ? JSON.parse(raw) : [];
        cart.push(item);
        localStorage.setItem("cart", JSON.stringify(cart));
        // Notify listeners (e.g., Navbar) that the cart changed
        window.dispatchEvent(new Event("cart:updated"));
      }
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8 py-10">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Image */}
        <div className="w-full">
          <div className="relative w-full aspect-square rounded-lg bg-white border border-gray-100 overflow-hidden">
            {product.imageUrl ? (
              <Image
                src={product.imageUrl}
                alt={product.alt || product.name}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-contain p-6"
                priority
              />)
            : (
              <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              </div>
            )}
          </div>
        </div>

        {/* Infos */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>
          <div className="mt-2 text-sm text-gray-500 space-x-2">
            {product.brand && <span>Marque: <span className="font-medium text-gray-700">{product.brand}</span></span>}
            {product.category && <span>• Catégorie: <span className="font-medium text-gray-700">{product.category}</span></span>}
            <span>• Réf: <span className="font-mono text-gray-700">{product.id}</span></span>
          </div>

          <div className="mt-4">
            {(() => {
              const finalPrice = product.final ?? product.original ?? 0;
              const hasOriginal = typeof product.original === 'number' && product.original > 0;
              const discount = hasOriginal && typeof product.final === 'number' && product.final < (product.original as number);
              const percent = discount ? Math.round(((product.original as number) - (product.final as number)) / (product.original as number) * 100) : 0;
              return (
                <>
                  <div className="flex items-baseline gap-3">
                    <p className="text-3xl font-semibold text-gray-900">{priceFormatter.format(finalPrice)}</p>
                    {discount && (
                      <p className="text-lg text-gray-500 line-through">{priceFormatter.format(product.original as number)}</p>
                    )}
                    {discount && (
                      <span className="inline-flex items-center rounded-full bg-red-50 px-2 py-0.5 text-sm font-semibold text-red-600 ring-1 ring-inset ring-red-200">
                        -{percent}%
                      </span>
                    )}
                  </div>
                  {discount && (
                    <p className="mt-1 text-sm text-green-600">Économisez {priceFormatter.format((product.original as number) - (product.final as number))}</p>
                  )}
                </>
              );
            })()}
          </div>

          {/* Tailles */}
          <div className="mt-8">
            <h2 className="text-sm font-medium text-gray-900">Pointures (46–57)</h2>
            <div className="mt-3 grid grid-cols-4 sm:grid-cols-6 gap-2">
              {sizes.map((size) => {
                const selected = selectedSize === size;
                return (
                  <button
                    type="button"
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`rounded-md border px-3 py-2 text-sm ${
                      selected
                        ? "border-indigo-600 bg-indigo-600 text-white"
                        : "border-gray-300 bg-white text-gray-800 hover:bg-gray-50"
                    }`}
                  >
                    {size}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="mt-8 flex items-center gap-4">
            <button
              type="button"
              disabled={!selectedSize || !inStock || adding}
              onClick={handleAddToCart}
              className={`inline-flex items-center justify-center rounded-md px-5 py-3 text-base font-medium transition-colors ${
                !selectedSize || !inStock || adding
                  ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                  : "bg-indigo-600 text-white hover:bg-indigo-500"
              }`}
            >
              Ajouter au panier
            </button>
            <div className="text-sm text-gray-500">
              {inStock ? (
                <span>En stock: {product.quantity}</span>
              ) : (
                <span className="text-red-600">Rupture de stock</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
