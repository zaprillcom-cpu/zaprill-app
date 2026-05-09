/**
 * GET /api/referrals/validate?code=REF_XXXXXXXX
 * Public endpoint — no auth required.
 * Used on the signup page to show referrer info and discount preview.
 */

import { NextResponse } from "next/server";
import { validateReferralCode } from "@/services/billing/referral.service";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");

  if (!code || code.trim().length < 3) {
    return NextResponse.json(
      { valid: false, error: "Missing referral code" },
      { status: 400 },
    );
  }

  const result = await validateReferralCode(code.trim());
  return NextResponse.json(result);
}
