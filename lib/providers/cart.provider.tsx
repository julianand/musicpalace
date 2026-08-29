"use client";

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useReducer,
  useRef,
  useState,
} from "react";
import { CartProduct } from "@/lib/data/cart";
import { createClient } from "../supabase/client";
import { Product } from "@/types";
import { SerializedCartProduct, deserialize } from "@/lib/cart-serialization";

export type CartAction =
  | { type: "set"; products: CartProduct[] }
  | { type: "adjustQuantity"; productId: bigint; delta: number; product?: Product };

export function cartReducer(
  state: CartProduct[],
  action: CartAction,
): CartProduct[] {
  switch (action.type) {
    case "set":
      return action.products;
    case "adjustQuantity": {
      const existing = state.find((p) => p.id === action.productId);
      if (existing) {
        return state
          .map((p) => {
            if (p.id !== action.productId) return p;
            return { ...p, quantity: p.quantity + action.delta };
          })
          .filter((p) => p.quantity > 0);
      }
      if (action.product && action.delta > 0) {
        return [...state, { ...action.product, quantity: action.delta }];
      }
      return state;
    }
  }
}

interface CartStateInterface {
  products: CartProduct[];
  loaded: boolean;
}

interface CartActionsInterface {
  dispatch: (action: CartAction) => void;
  reload: () => void;
}

const CartStateContext = createContext<CartStateInterface>({
  products: [],
  loaded: false,
});

const CartActionsContext = createContext<CartActionsInterface>({
  dispatch: undefined!,
  reload: undefined!,
});

export function useCartState() {
  return useContext(CartStateContext);
}

export function useCartActions() {
  return useContext(CartActionsContext);
}

export function useCart() {
  return { ...useCartState(), ...useCartActions() };
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [products, dispatch] = useReducer(cartReducer, []);
  const [loaded, setLoaded] = useState(false);
  const loadIdRef = useRef(0);

  const load = useCallback(() => {
    const id = ++loadIdRef.current;

    return fetch("/api/cart", { cache: "no-store" })
      .then(async (res) => (res.ok ? ((await res.json()) as SerializedCartProduct[]) : []))
      .then((data) => {
        if (id !== loadIdRef.current) return;
        dispatch({ type: "set", products: data.map(deserialize) });
        setLoaded(true);
      })
      .catch(() => {
        if (id !== loadIdRef.current) return;
        dispatch({ type: "set", products: [] });
        setLoaded(true);
      });
  }, []);

  useEffect(() => {
    load();

    const supabase = createClient();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN" || event === "SIGNED_OUT") {
        load();
      }
    });

    return () => subscription.unsubscribe();
  }, [load]);

  return (
    <CartStateContext value={{ products, loaded }}>
      <CartActionsContext value={{ dispatch, reload: load }}>
        {children}
      </CartActionsContext>
    </CartStateContext>
  );
}