import { fetchProductById } from "@/services/productService";
import ProductDetail from "@/components/product/ProductDetail";
import { notFound } from "next/navigation";

export default async function ProductPage({ params }: { params: { id: string } }) {
  const product = await fetchProductById(params.id);
  if (!product) return notFound();

  return (
    <div className="bg-white">
      <ProductDetail product={product} />
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
