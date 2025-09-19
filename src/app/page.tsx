"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import FeaturedProducts from "@/components/home/FeaturedProducts";

export default function Home() {
  type BrandFilter = 'ALL' | 'NIKE' | 'JORDAN' | 'PROMOS';
  const [brandFilter, setBrandFilter] = useState<BrandFilter>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [cookieConsent, setCookieConsent] = useState<'accepted' | 'refused' | null>(null);

  // Cookie consent: read once on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('cookieConsent');
      if (saved === 'accepted' || saved === 'refused') setCookieConsent(saved as any);
      else setCookieConsent(null);
    } catch {}
  }, []);

  const acceptCookies = () => {
    try { localStorage.setItem('cookieConsent', 'accepted'); } catch {}
    setCookieConsent('accepted');
  };
  const refuseCookies = () => {
    try { localStorage.setItem('cookieConsent', 'refused'); } catch {}
    setCookieConsent('refused');
  };
  return (
    <div className="min-h-screen bg-white">
      {/* Section Hero */}
      <div className="relative bg-gray-900">
        <div className="relative h-80 overflow-hidden bg-indigo-600 md:absolute md:left-0 md:h-full md:w-1/3 lg:w-1/2">
          <Image
            className="h-full w-full object-cover"
            src="https://images.unsplash.com/photo-1600269452121-4f2416e55c28?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2832&q=80"
            alt="Collection de sneakers"
            width={1920}
            height={1080}
            priority
          />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="md:ml-auto md:w-1/2 md:pl-10">
            <h2 className="text-lg font-semibold text-gray-300">Nouvelle collection</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Des sneakers qui vous ressemblent
            </p>
            <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-indigo-100/20 px-3 py-1 ring-1 ring-inset ring-indigo-300/40">
              <span className="text-xs font-semibold uppercase tracking-wide text-indigo-200">Grandes pointures</span>
              <span className="text-xs font-medium text-indigo-100">46 – 57</span>
            </div>
            <p className="mt-3 text-lg text-gray-300">
              Découvrez notre sélection exclusive de sneakers. Confort, style et qualité supérieure.
            </p>
            <div className="mt-8">
              <div className="inline-flex rounded-md shadow">
                <a
                  href="#"
                  className="inline-flex items-center justify-center rounded-md border border-transparent bg-white px-5 py-3 text-base font-medium text-indigo-600 hover:bg-gray-50"
                >
                  Découvrir la collection
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section marques (marquee) */}
      <div className="bg-gray-50 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm font-semibold uppercase tracking-wide text-gray-500">
            Nos marques partenaires
          </p>
          {(() => {
            const brands = [
              { src: '/Courir.svg', alt: 'Courir' },
              { src: '/JD.L.png', alt: 'JD Sports' },
              { src: '/Foot_Locker_logo.svg.png', alt: 'Foot Locker' },
              { src: '/jordan.png', alt: 'Jordan' },
              { src: '/nike.png', alt: 'Nike' },
            ];
            return (
              <div className="mt-6 marquee">
                <div className="marquee-track py-2">
                  {[...brands, ...brands].map((brand, idx) => (
                    <div key={`${brand.alt}-${idx}`} className="flex items-center justify-center">
                      <Image
                        className="h-12 w-auto opacity-80 hover:opacity-100 transition"
                        src={brand.src}
                        alt={brand.alt}
                        width={160}
                        height={48}
                      />
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}
        </div>
      </div>

      {/* Section Produits en vedette */}
      <div className="bg-white py-16 sm:py-24">
        <div className="mx-auto w-full max-w-none px-1 sm:px-2 lg:px-3">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Tous les produits
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-xl text-gray-500">
              Parcourez toutes nos paires disponibles en grandes pointures
            </p>
            <p className="mx-auto mt-2 max-w-2xl text-sm text-indigo-600 font-medium">
              Spécialisés grandes pointures: 46 à 57
            </p>
            {/* Pilules de filtre sous le sous-titre */}
            <div className="mt-6 flex w-full justify-center">
              <div className="grid w-full max-w-xl grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { key: 'ALL', label: 'Tous' },
                  { key: 'NIKE', label: 'Nike' },
                  { key: 'JORDAN', label: 'Jordan' },
                  { key: 'PROMOS', label: 'Promos' },
                ].map((pill) => (
                  <button
                    key={pill.key}
                    onClick={() => setBrandFilter(pill.key as BrandFilter)}
                    className={
                      `w-full rounded-md border px-4 py-2.5 text-sm md:text-base transition-colors ${
                        brandFilter === pill.key
                          ? 'bg-indigo-600 text-white border-indigo-600'
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                      }`
                    }
                  >
                    {pill.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Barre de recherche */}
            <div className="mt-4 flex w-full justify-center">
              <div className="relative w-full max-w-xl">
                <label htmlFor="product-search" className="sr-only">Rechercher un produit</label>
                <input
                  id="product-search"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Rechercher par nom (ex: Air Max, Jordan AJ1, Tuned...)"
                  className="w-full rounded-md border border-gray-300 bg-white py-2 pl-10 pr-3 text-sm placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
                <svg className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M10.5 18a7.5 7.5 0 110-15 7.5 7.5 0 010 15z" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="mt-12">
            <FeaturedProducts brandFilter={brandFilter} searchQuery={searchQuery} />
          </div>
        </div>
      </div>

      {/* Cookie consent banner (centered) */}
      {cookieConsent === null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/30" aria-hidden="true" />
          <div className="relative w-full max-w-3xl rounded-xl border border-gray-200 bg-white p-5 shadow-2xl">
            <h3 className="text-center text-lg font-semibold text-gray-900">Paramètres des cookies</h3>
            <p className="mt-2 text-center text-base text-gray-700">
              Nous utilisons des cookies pour améliorer votre expérience, mesurer l'audience et sécuriser le site.
              Vous pouvez accepter ou refuser les cookies non essentiels.
            </p>
            <div className="mt-4 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={refuseCookies}
                className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Refuser
              </button>
              <button
                type="button"
                onClick={acceptCookies}
                className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500"
              >
                Accepter
              </button>
            </div>
            <p className="mt-2 text-center text-xs text-gray-500">
              En savoir plus dans notre <a href="/cookies" className="underline hover:text-indigo-600">Politique des cookies</a>.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
