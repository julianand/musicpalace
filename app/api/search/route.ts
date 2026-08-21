import { getProducts } from "@/lib/data/products";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim();

  if (!query) {
    return NextResponse.json([]);
  }

  const products = await getProducts({
    where: {
      name: {
        contains: query,
        mode: "insensitive",
      },
    },
    take: 8,
  });

  const serialized = products.map((p) => ({
    id: p.id.toString(),
    name: p.name,
    slug: p.slug,
    formattedPrice: p.formattedPrice,
    category: {
      id: p.category.id.toString(),
      name: p.category.name,
      accent_color: p.category.accent_color,
      background_color: p.category.background_color,
    },
  }));

  return NextResponse.json(serialized);
}
