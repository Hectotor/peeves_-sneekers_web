import Image from "next/image";
import FeaturedProducts from "@/components/home/FeaturedProducts";

export default function Home() {
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
            <p className="mt-3 text-lg text-gray-300">
              Découvrez notre sélection exclusive de sneakers pour hommes et femmes. Confort, style et qualité supérieure.
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

      {/* Section marques */}
      <div className="bg-gray-50 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm font-semibold uppercase tracking-wide text-gray-500">
            Nos marques partenaires
          </p>
          <div className="mt-6 grid grid-cols-2 gap-8 md:grid-cols-5">
            <div className="col-span-1 flex justify-center">
              <img 
                className="h-12 w-auto" 
                src="https://tailwindui.com/img/logos/tuple-logo-gray-400.svg" 
                alt="Tuple" 
              />
            </div>
            <div className="col-span-1 flex justify-center">
              <img 
                className="h-12 w-auto" 
                src="https://tailwindui.com/img/logos/mirage-logo-gray-400.svg" 
                alt="Mirage" 
              />
            </div>
            <div className="col-span-1 flex justify-center">
              <img 
                className="h-12 w-auto" 
                src="https://tailwindui.com/img/logos/statickit-logo-gray-400.svg" 
                alt="StaticKit" 
              />
            </div>
            <div className="col-span-1 flex justify-center">
              <img 
                className="h-12 w-auto" 
                src="https://tailwindui.com/img/logos/transistor-logo-gray-400.svg" 
                alt="Transistor" 
              />
            </div>
            <div className="col-span-1 flex justify-center">
              <img 
                className="h-12 w-auto" 
                src="https://tailwindui.com/img/logos/workcation-logo-gray-400.svg" 
                alt="Workcation" 
              />
            </div>
          </div>
        </div>
      </div>

      {/* Section Produits en vedette */}
      <div className="bg-white py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Nos meilleures ventes
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-xl text-gray-500">
              Découvrez les modèles préférés de nos clients
            </p>
          </div>
          
          <div className="mt-12">
            <FeaturedProducts />
          </div>
        </div>
      </div>
    </div>
  );
}
