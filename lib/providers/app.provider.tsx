"use client";

import { User } from "@supabase/supabase-js";
import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { createClient } from "../supabase/client";

const UserContext = createContext<{
  user: User | null;
  setUser: (user: User | null) => void;
}>({ user: null, setUser: () => {} });

export function useUser() {
  return useContext(UserContext);
}

function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getUser().then(({ data: { user } }) => setUser(user));

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  return <UserContext value={{ user, setUser }}>{children}</UserContext>;
}

export function AppProvider({ children }: { children: ReactNode }) {
  return <UserProvider>{children}</UserProvider>
}
