import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/actions/session";

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

  if (body.quantity === 0) {
    return NextResponse.json({ success: true });
  }

  const existing = await prisma.carts.findFirst({
    where: { user_id: user.id, product_id: productId },
    select: { id: true, quantity: true },
  });

  const newQuantity = (existing?.quantity ?? 0) + body.quantity;

  if (existing) {
    if (newQuantity <= 0) {
      await prisma.carts.delete({ where: { id: existing.id } });
    } else {
      await prisma.carts.update({
        where: { id: existing.id },
        data: { quantity: newQuantity },
      });
    }
  } else if (newQuantity > 0) {
    await prisma.carts.create({
      data: { user_id: user.id, product_id: productId, quantity: newQuantity },
    });
  }

  return NextResponse.json({ success: true });
}