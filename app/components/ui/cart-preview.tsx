"use client";

import { CartProduct } from "@/lib/data/cart";
import { useCart } from "@/lib/providers/cart.provider";
import { CartButton } from "./cart-button";
import { RefObject, useEffect, useRef, useState } from "react";

function CartToggleButton({ ref }: { ref: RefObject<HTMLElement> }) {
  const cartProducts = useCart().products;
  const totalItems = cartProducts.reduce((sum, p) => sum + p.quantity, 0);

  return (
    <button
      className="relative p-2 rounded-xl transition-colors duration-200 cursor-pointer"
      ref={ref as never}
      style={{
        background: "var(--surface-2)",
        border: "1px solid var(--border)",
      }}
    >
      <svg
        className="w-5 h-5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="var(--foreground)"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
        <line x1="3" y1="6" x2="21" y2="6" />
        <path d="M16 10a4 4 0 0 1-8 0" />
      </svg>
      {(totalItems || "") && (
        <span
          className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center"
          style={{ background: "var(--amber)", color: "#0c0c0e" }}
        >
          {totalItems}
        </span>
      )}
    </button>
  );
}

function CartPreviewListItem({ product }: { product: CartProduct }) {
  const compactStyle: React.CSSProperties = {
    background: "var(--surface-2)",
    border: "1px solid var(--border)",
    color: "var(--foreground)",
    fontFamily: "var(--font-dm-sans)",
  };

  return (
    <li className="flex items-center gap-3 px-4 py-3">
      {/* Color swatch */}
      <div
        className="w-10 h-10 rounded-lg shrink-0 flex items-center justify-center"
        style={{ background: product.category.background_color }}
      >
        <svg
          className="w-4 h-4"
          viewBox="0 0 24 24"
          fill={product.category.accent_color}
          opacity="0.8"
        >
          <path d="M9 3v10.55A4 4 0 1 0 11 17V7h4V3H9z" />
        </svg>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p
          className="text-xs font-semibold truncate leading-snug"
          style={{
            color: "var(--foreground)",
            fontFamily: "var(--font-playfair)",
          }}
        >
          {product.name}
        </p>
        <p
          className="text-xs mt-0.5"
          style={{
            color: "var(--muted)",
            fontFamily: "var(--font-dm-sans)",
          }}
        >
          {product.category.name}
        </p>
      </div>

      {/* Price */}
      <div className="flex flex-col items-end shrink-0">
        <span
          className="text-sm font-bold"
          style={{
            color: "var(--amber)",
            fontFamily: "var(--font-playfair)",
          }}
        >
          {product.formattedPrice}
        </span>
        <span
          className="text-xs mt-0.5"
          style={{
            color: "var(--muted)",
            fontFamily: "var(--font-dm-sans)",
          }}
        >
          ×{product.quantity}
        </span>
      </div>

      {/* Quantity controls */}
      <div className="flex items-center gap-1 shrink-0">
        <CartButton
          productId={product.id}
          delta={-1}
          label="−"
          ariaLabel={`Remove one ${product.name}`}
          className="w-6 h-6 rounded-lg flex items-center justify-center text-sm font-semibold transition-colors duration-200 cursor-pointer"
          style={compactStyle}
        />
        <CartButton
          productId={product.id}
          delta={1}
          label="+"
          ariaLabel={`Add one ${product.name}`}
          className="w-6 h-6 rounded-lg flex items-center justify-center text-sm font-semibold transition-colors duration-200 cursor-pointer"
          style={compactStyle}
        />
      </div>
    </li>
  );
}

export function CartPreviewList({ ref }: { ref: RefObject<HTMLElement> }) {
  const products = useCart().products;
  const isEmpty = products.length === 0;
  const totalItems = products.reduce((sum, p) => sum + p.quantity, 0);

  return (
    <div
      ref={ref as never}
      className="absolute top-full right-0 mt-2 w-80 rounded-2xl overflow-hidden z-50"
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        boxShadow: "0 16px 48px rgba(0,0,0,0.4)",
      }}
    >
      {/* Header */}
      <div
        className="px-4 py-3 flex items-center justify-between"
        style={{ borderBottom: "1px solid var(--border)" }}
      >
        <span
          className="text-sm font-semibold"
          style={{
            fontFamily: "var(--font-playfair)",
            color: "var(--foreground)",
          }}
        >
          Cart
        </span>
        {!isEmpty && (
          <span
            className="text-xs px-2 py-0.5 rounded-full font-medium"
            style={{
              background: "var(--surface-2)",
              color: "var(--muted)",
              fontFamily: "var(--font-dm-sans)",
            }}
          >
            {totalItems} {totalItems === 1 ? "item" : "items"}
          </span>
        )}
      </div>

      {/* Body */}
      {isEmpty ? (
        <div className="flex flex-col items-center justify-center gap-2 py-10 px-4 text-center">
          <svg
            className="w-10 h-10 opacity-20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--foreground)"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <path d="M16 10a4 4 0 0 1-8 0" />
          </svg>
          <p
            className="text-sm font-medium"
            style={{
              color: "var(--foreground)",
              fontFamily: "var(--font-dm-sans)",
            }}
          >
            Your cart is empty
          </p>
          <p
            className="text-xs"
            style={{ color: "var(--muted)", fontFamily: "var(--font-dm-sans)" }}
          >
            Add some products to get started
          </p>
        </div>
      ) : (
        <ul
          className="max-h-64 overflow-y-auto divide-y"
          style={{ borderColor: "var(--border)" }}
        >
          {products.map((product) => (
            <CartPreviewListItem key={product.id} product={product} />
          ))}
        </ul>
      )}
    </div>
  );
}

export function CartPreview() {
  const [previewOpen, setPreviewOpen] = useState(false);
  const buttonRef = useRef<HTMLElement>(null!);
  const listRef = useRef<HTMLElement>(null!);

  useEffect(() => {
    const controller = new AbortController();

    window.addEventListener(
      "click",
      (e) => {
        const path = e.composedPath() as HTMLElement[];
        if (path.includes(listRef.current)) return;
        if (path.includes(buttonRef.current)) {
          setPreviewOpen((p) => !p);
          return;
        }

        setPreviewOpen(false);
      },
      { signal: controller.signal },
    );

    return () => controller.abort();
  }, []);

  return (
    <div className="relative">
      <CartToggleButton ref={buttonRef} />
      {previewOpen && <CartPreviewList ref={listRef} />}
    </div>
  );
}