/**
 * GET  /api/referrals  — Get current user's referral code + stats
 * POST /api/referrals  — Generate referral code (lazy init)
 */

import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  getOrCreateReferralCode,
  getReferralStats,
} from "@/services/billing/referral.service";

async function getSession() {
  return auth.api.getSession({ headers: await headers() });
}

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const stats = await getReferralStats(session.user.id);
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://app.zaprill.com";

  return NextResponse.json({
    ...stats,
    referralLink: stats.referralCode
      ? `${baseUrl}/sign-up?ref=${stats.referralCode}`
      : null,
  });
}

export async function POST() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const code = await getOrCreateReferralCode(session.user.id);
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://app.zaprill.com";

  return NextResponse.json({
    referralCode: code,
    referralLink: `${baseUrl}/sign-up?ref=${code}`,
  });
}
