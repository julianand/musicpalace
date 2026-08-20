"use client";

import { ReactNode, Suspense } from "react";
import { UserProvider } from "./user.provider";

export function AppProvider({ children }: { children: ReactNode }) {
  return <UserProvider>{children}</UserProvider>;
}
