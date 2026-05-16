import { headers } from "next/headers";
import { redirect } from "next/navigation";
import type React from "react";
import { auth } from "@/lib/auth";
import ClientProvider from "@/providers/ClientProvider";

export async function AuthLayout({ children }: { children: React.ReactNode }) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user) {
    redirect("/sign-in");
  }

  return <ClientProvider user={session.user}>{children}</ClientProvider>;
}

export default AuthLayout;
