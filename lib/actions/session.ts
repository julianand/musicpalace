"use server";

import { cookies } from "next/headers";
import { createClient } from "../supabase/server";
import { prisma } from "../prisma";
import { User } from "@/types";

export async function getSessionUser(): Promise<User | null> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session?.user) return null;

  return prisma.users.findFirst({ where: { auth_id: session.user.id } });
}
