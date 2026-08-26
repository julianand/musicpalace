"use client";

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { createClient } from "../supabase/client";
import { User } from "@/types";
import { getSessionUser } from "../actions/session";
import { useRouter } from "next/navigation";

interface UserContextInterface {
  user?: User | null;
  userLoaded?: boolean;
  setUser?: (user: User | null) => void;
}

const UserContext = createContext<UserContextInterface>({});

export function useUser() {
  return useContext(UserContext);
}

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userLoaded, setUserLoaded] = useState(false);
  const router = useRouter();

  useEffect(() => {
    getSessionUser().then(user => {
      setUser(user);
      setUserLoaded(true);
    })

    const supabase = createClient();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      getSessionUser().then((user) => setUser(user));
      if (event === "SIGNED_IN" || event === "SIGNED_OUT") {
        router.refresh();
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  return <UserContext value={{ user, userLoaded, setUser }}>{children}</UserContext>;
}
