"use client";

import type { User } from "better-auth/types";
import type React from "react";
import { useRef } from "react";
import { useDispatch } from "react-redux";
import { useReferralClaim } from "@/hooks/useReferralClaim";
import { login } from "@/store/authSlice";

/** Recursively convert Date values to ISO strings so Redux serialization passes. */
function serializeUser(user: User): User {
  return JSON.parse(JSON.stringify(user));
}

function AuthInitializer({ user }: { user: User }) {
  const dispatch = useDispatch();
  const dispatched = useRef(false);

  // Dispatch synchronously during render (guarded by ref) so the store
  // is populated before any child useEffect sees isAuthenticated=false.
  if (!dispatched.current) {
    dispatch(login(serializeUser(user)));
    dispatched.current = true;
  }

  // Auto-claim any pending referral code stored from the sign-up page
  useReferralClaim(true);

  return null;
}

export default function ClientProvider({
  children,
  user,
}: {
  children: React.ReactNode;
  user?: User;
}) {
  return (
    <>
      {user && <AuthInitializer user={user} />}
      {children}
    </>
  );
}
