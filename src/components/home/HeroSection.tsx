import Link from 'next/link';
import Image from 'next/image';

export default function HeroSection() {
  return (
    <div className="relative bg-gray-900">
      {/* Decorative image and overlay */}
      <div aria-hidden="true" className="absolute inset-0 overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1600269452121-4f2416e55c28?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2832&q=80"
          alt=""
          className="h-full w-full object-cover object-center opacity-40"
          fill
          priority
        />
      </div>
      <div aria-hidden="true" className="absolute inset-0 bg-gray-900 opacity-50" />

      <div className="relative mx-auto flex max-w-3xl flex-col items-center py-32 px-6 text-center sm:py-64 lg:px-0">
        <h1 className="text-4xl font-bold tracking-tight text-white lg:text-6xl">
          La nouvelle collection est arrivée
        </h1>
        <p className="mt-4 text-xl text-gray-300">
          Découvrez nos dernières paires de sneakers conçues pour votre style de vie actif.
        </p>
        <Link
          href="/shop"
          className="mt-8 inline-block rounded-md border border-transparent bg-indigo-600 px-8 py-3 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-900"
        >
          Voir la collection
        </Link>
      </div>
    </div>
  );
}
