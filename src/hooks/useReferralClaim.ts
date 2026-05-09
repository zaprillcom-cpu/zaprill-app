"use client";

/**
 * useReferralClaim.ts
 * React hook that:
 * 1. Reads a ?ref=XXXXX parameter from the URL (or from localStorage if stored earlier)
 * 2. After the user is authenticated (signed up), calls POST /api/referrals/claim
 * 3. Clears the stored code afterwards
 *
 * Usage: Call `useReferralClaim()` in the sign-up page or the post-auth layout.
 * The hook is idempotent — if no code is present or claim already happened, it's a no-op.
 */

import { useEffect } from "react";

const STORAGE_KEY = "zaprill_ref_code";

/**
 * Call this at page load (e.g. on the landing page or sign-up page)
 * to persist the referral code from the URL into localStorage.
 */
export function captureReferralCode(): void {
  if (typeof window === "undefined") return;
  const url = new URL(window.location.href);
  const ref = url.searchParams.get("ref");
  if (ref) {
    localStorage.setItem(STORAGE_KEY, ref.trim().toUpperCase());
    // Clean up the URL without reloading
    url.searchParams.delete("ref");
    window.history.replaceState({}, "", url.toString());
  }
}

/**
 * Returns the stored referral code (or null).
 * Read this during sign-up to show "Referred by X" messaging.
 */
export function getStoredReferralCode(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(STORAGE_KEY);
}

/**
 * Call this after the user has successfully signed up and is authenticated.
 * Sends a claim request to the server and clears the stored code.
 */
export async function claimStoredReferral(): Promise<void> {
  const code = getStoredReferralCode();
  if (!code) return;

  try {
    const res = await fetch("/api/referrals/claim", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ referralCode: code }),
    });

    // Clear the code regardless of result (even self-referral, already-claimed, etc.)
    localStorage.removeItem(STORAGE_KEY);

    if (res.ok) {
      const json = await res.json();
      if (json.success) {
        console.info(
          "[referral] Referral claimed successfully:",
          json.referralId,
        );
      } else {
        console.info("[referral] Referral claim skipped:", json.reason);
      }
    }
  } catch (err) {
    // Don't surface errors to the user — referral claim is best-effort
    console.error("[referral] Claim failed silently:", err);
  }
}

/**
 * Hook: automatically claim a stored referral on mount (when authenticated).
 * Place in a component that renders only when the user is logged in.
 *
 * @param isAuthenticated - pass `true` once you have a valid session
 */
export function useReferralClaim(isAuthenticated: boolean): void {
  useEffect(() => {
    if (isAuthenticated) {
      void claimStoredReferral();
    }
  }, [isAuthenticated]);
}
