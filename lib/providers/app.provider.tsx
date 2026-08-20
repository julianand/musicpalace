"use client";

import { ReactNode, Suspense } from "react";
import { UserProvider } from "./user.provider";
import { ToastContainer } from "@/app/components/ui/toast";

export function AppProvider({ children }: { children: ReactNode }) {
  return (
    <UserProvider>
      {children}
      <ToastContainer />
    </UserProvider>
  );
}
