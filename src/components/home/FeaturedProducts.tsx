import Link from 'next/link';
import Image from 'next/image';

const products = [
  {
    id: 1,
    name: 'Air Max 90',
    category: 'Homme',
    price: '139,99 €',
    imageUrl: 'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1025&q=80',
  },
  {
    id: 2,
    name: 'Classic Leather',
    category: 'Femme',
    price: '89,99 €',
    imageUrl: 'https://images.unsplash.com/photo-1600269452121-4f2416e55c28?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2832&q=80',
  },
  {
    id: 3,
    name: 'Superstar',
    category: 'Unisexe',
    price: '99,99 €',
    imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
  },
  {
    id: 4,
    name: 'Old Skool',
    category: 'Homme',
    price: '79,99 €',
    imageUrl: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1112&q=80',
  },
];

export default function FeaturedProducts() {
  return (
    <div className="bg-white">
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24 lg:max-w-7xl lg:px-8">
        <div className="md:flex md:items-center md:justify-between">
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">Nouveautés</h2>
          <Link href="/shop" className="hidden text-sm font-medium text-indigo-600 hover:text-indigo-500 md:block">
            Parcourir la collection
            <span aria-hidden="true"> &rarr;</span>
          </Link>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 md:grid-cols-4 md:gap-y-0 lg:gap-x-8">
          {products.map((product) => (
            <div key={product.id} className="group relative">
              <div className="h-56 w-full overflow-hidden rounded-md bg-gray-200 group-hover:opacity-75 lg:h-72 xl:h-80">
                <Image
                  src={product.imageUrl}
                  alt={product.name}
                  className="h-full w-full object-cover object-center"
                  width={300}
                  height={400}
                />
              </div>
              <h3 className="mt-4 text-sm text-gray-700">
                <Link href={`/product/${product.id}`}>
                  <span className="absolute inset-0" />
                  {product.name}
                </Link>
              </h3>
              <p className="mt-1 text-sm text-gray-500">{product.category}</p>
              <p className="mt-1 text-sm font-medium text-gray-900">{product.price}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 text-sm md:hidden">
          <Link href="#" className="font-medium text-indigo-600 hover:text-indigo-500">
            Parcourir la collection
            <span aria-hidden="true"> &rarr;</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
