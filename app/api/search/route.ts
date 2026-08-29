import { getSearchResults } from "@/lib/data/products";
import { formatPrice } from "@/lib/products/format";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim();

  if (!query) {
    return NextResponse.json([]);
  }

  const products = await getSearchResults(query);

  const serialized = products.map((p) => ({
    id: p.id.toString(),
    name: p.name,
    slug: p.slug,
    formattedPrice: formatPrice(p.price),
    category: {
      id: p.product_categories.id.toString(),
      name: p.product_categories.name,
      accent_color: p.product_categories.accent_color,
      background_color: p.product_categories.background_color,
    },
  }));

  return NextResponse.json(serialized);
}