"use client";

/**
 * BillingClientShell.tsx
 * Client wrapper for the billing page navbar (requires useSession client-side).
 */

import Navbar from "@/components/Navbar";
import { useSession } from "@/lib/auth-client";

export function BillingClientShell() {
  const { data: session, isPending } = useSession();

  return (
    <Navbar
      user={
        session?.user
          ? {
              name: session.user.name,
              email: session.user.email,
              image: session.user.image,
            }
          : null
      }
      sessionLoading={isPending}
    />
  );
}
