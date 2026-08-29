import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/actions/session.action";
import { getCartProducts } from "@/lib/data/cart";
import { serialize } from "@/lib/cart-serialization";

export async function GET() {
  const cartProducts = await getCartProducts();
  return NextResponse.json(cartProducts.map(serialize));
}

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let body: { productId?: string; quantity?: number };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  if (
    typeof body.productId !== "string" ||
    typeof body.quantity !== "number" ||
    !Number.isInteger(body.quantity)
  ) {
    return NextResponse.json({ error: "invalid_params" }, { status: 400 });
  }

  let productId: bigint;
  try {
    productId = BigInt(body.productId);
  } catch {
    return NextResponse.json({ error: "invalid_product" }, { status: 400 });
  }

  const product = await prisma.products.findUnique({
    where: { id: productId },
    select: { id: true },
  });
  if (!product) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const delta = Math.max(-99, Math.min(99, body.quantity));
  if (delta === 0) {
    return NextResponse.json({ success: true });
  }

  // Atomically increment the row if it already exists — prevents lost updates
  // from concurrent requests on the same product.
  const updated = await prisma.carts.updateMany({
    where: { user_id: user.id, product_id: productId },
    data: { quantity: { increment: delta } },
  });

  // No row yet — create one only when adding, guarding against a concurrent
  // create for the same product.
  if (updated.count === 0 && delta > 0) {
    const existing = await prisma.carts.findFirst({
      where: { user_id: user.id, product_id: productId },
      select: { id: true },
    });
    if (existing) {
      await prisma.carts.updateMany({
        where: { user_id: user.id, product_id: productId },
        data: { quantity: { increment: delta } },
      });
    } else {
      await prisma.carts.create({
        data: { user_id: user.id, product_id: productId, quantity: delta },
      });
    }
  }

  // Remove the row once its quantity drops to zero or below.
  await prisma.carts.deleteMany({
    where: { user_id: user.id, product_id: productId, quantity: { lte: 0 } },
  });

  return NextResponse.json({ success: true });
}