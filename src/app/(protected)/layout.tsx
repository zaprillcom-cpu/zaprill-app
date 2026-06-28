import { headers } from "next/headers";
import { redirect } from "next/navigation";
import type React from "react";
import { AppShell } from "@/components/app/app-shell";
import { auth } from "@/lib/auth";
import ClientProvider from "@/providers/ClientProvider";
import {
  getSubscriptionWithAccess,
  subscriptionGrantsAccess,
} from "@/services/billing/subscription.service";

export async function AuthLayout({ children }: { children: React.ReactNode }) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user) {
    redirect("/sign-in");
  }

  const sub = await getSubscriptionWithAccess(session.user.id);
  const isPro = sub ? subscriptionGrantsAccess(sub) : false;

  const user = {
    name: session.user.name,
    email: session.user.email,
    image: session.user.image,
    isPro,
  };

  return (
    <ClientProvider user={session.user}>
      <AppShell user={user}>{children}</AppShell>
    </ClientProvider>
  );
}

export default AuthLayout;
