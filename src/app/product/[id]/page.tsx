import { fetchProductById } from "@/services/productService";
import ProductDetail from "@/components/product/ProductDetail";
import { notFound } from "next/navigation";

export default async function ProductPage({ params }: { params: { id: string } }) {
  const product = await fetchProductById(params.id);
  if (!product) return notFound();

  // Serialize Firestore Timestamp fields before passing to a Client Component
  const safeProduct = {
    ...product,
    updatedAt: (product as any).updatedAt?.toMillis ? (product as any).updatedAt.toMillis() : (product as any).updatedAt ?? null,
    createdAt: (product as any).createdAt?.toMillis ? (product as any).createdAt.toMillis() : (product as any).createdAt ?? null,
  } as any;

  return (
    <div className="bg-white">
      <ProductDetail product={safeProduct} />
    </div>
  );
}

export async function generateMetadata({ params }: { params: { id: string } }) {
  const product = await fetchProductById(params.id);
  if (!product) {
    return { title: "Produit introuvable" };
  }
  return {
    title: `${product.name} | Peeves Sneakers`,
    description: product.alt || product.name,
    openGraph: {
      title: product.name,
      description: product.alt || product.name,
      images: product.imageUrl ? [{ url: product.imageUrl }] : [],
    },
  };
}
