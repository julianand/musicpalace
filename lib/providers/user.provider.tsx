"use client";

import {
  createContext,
  ReactNode,
  use,
  useContext,
  useEffect,
  useState,
  useTransition,
} from "react";
import { createClient } from "../supabase/client";
import { User } from "@/types";
import { getSessionUser } from "../actions/session";

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

  useEffect(() => {
    getSessionUser().then(user => {
      setUser(user);
      setUserLoaded(true);
    })
    // startUserTransition(async() => {
    //   const user = await getSessionUser();
    //   setUser(user);
    // })

    const supabase = createClient();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_, session) => {
      getSessionUser().then((user) => setUser(user));
    });

    return () => subscription.unsubscribe();
  }, []);

  return <UserContext value={{ user, userLoaded, setUser }}>{children}</UserContext>;
}
