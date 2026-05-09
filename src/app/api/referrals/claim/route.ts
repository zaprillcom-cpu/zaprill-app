/**
 * POST /api/referrals/claim
 * Called immediately after a user signs up with a referral code.
 * Requires authentication (the newly created session).
 *
 * Body: { referralCode: string }
 */

import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { claimReferral } from "@/services/billing/referral.service";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { referralCode?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 },
    );
  }

  const { referralCode } = body;
  if (!referralCode || typeof referralCode !== "string") {
    return NextResponse.json(
      { error: "referralCode is required" },
      { status: 400 },
    );
  }

  const result = await claimReferral(
    referralCode,
    session.user.id,
    session.user.email,
  );

  if (!result.success) {
    // Return 200 even on "soft" failures (self-referral, already referred)
    // so the signup flow isn't disrupted
    return NextResponse.json({ success: false, reason: result.error });
  }

  return NextResponse.json({ success: true, referralId: result.referralId });
}
