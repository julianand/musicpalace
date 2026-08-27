"use client";

import { ReactNode } from "react";
import { UserProvider } from "./user.provider";
import { CartProvider } from "./cart.provider";
import { ToastContainer } from "@/app/components/ui/toast";

export function AppProvider({ children }: { children: ReactNode }) {
  return (
    <CartProvider>
      <UserProvider>
        {children}
        <ToastContainer />
      </UserProvider>
    </CartProvider>
  );
}