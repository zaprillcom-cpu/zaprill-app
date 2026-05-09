/**
 * GET  /api/admin/referrals  — List all referrals with filters
 * POST /api/admin/referrals  — Admin actions (create influencer code, mark paid, flag fraud)
 */

import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { getReferralSettings } from "@/lib/app-settings";
import { auth } from "@/lib/auth";
import {
  createInfluencerCode,
  flagReferralAsFraudulent,
  getAllReferrals,
  getReferralAdminSummary,
  markCommissionPaid,
  voidCommission,
} from "@/services/billing/referral.service";

async function requireAdmin() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || session.user.role !== "admin") return null;
  return session;
}

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") ?? undefined;
  const type = searchParams.get("type") ?? undefined;
  const limit = parseInt(searchParams.get("limit") ?? "50", 10);
  const offset = parseInt(searchParams.get("offset") ?? "0", 10);

  const [referralList, summary, settings] = await Promise.all([
    getAllReferrals({ status, type, limit, offset }),
    getReferralAdminSummary(),
    getReferralSettings(),
  ]);

  return NextResponse.json({ referrals: referralList, summary, settings });
}

export async function POST(request: Request) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 },
    );
  }

  const { _action, ...data } = body;

  // ── Create influencer referral code
  if (_action === "create_influencer_code") {
    const { userId, commissionType, commissionValue, customCode, refereePct } =
      data as {
        userId: string;
        commissionType: "flat" | "per_user" | "percentage";
        commissionValue: number;
        customCode?: string;
        refereePct?: number;
      };

    if (!userId || !commissionType || commissionValue === undefined) {
      return NextResponse.json(
        { error: "userId, commissionType, and commissionValue are required" },
        { status: 400 },
      );
    }

    const result = await createInfluencerCode({
      userId,
      commissionType,
      commissionValue,
      customCode,
      refereePct,
    });

    return NextResponse.json({ success: true, code: result.code });
  }

  // ── Mark commission as paid
  if (_action === "mark_commission_paid") {
    const { rewardId, paymentRef } = data as {
      rewardId: string;
      paymentRef: string;
    };

    if (!rewardId) {
      return NextResponse.json(
        { error: "rewardId is required" },
        { status: 400 },
      );
    }

    await markCommissionPaid(rewardId, paymentRef ?? "");
    return NextResponse.json({ success: true });
  }

  // ── Void a commission reward
  if (_action === "void_commission") {
    const { rewardId } = data as { rewardId: string };
    if (!rewardId) {
      return NextResponse.json(
        { error: "rewardId is required" },
        { status: 400 },
      );
    }
    await voidCommission(rewardId);
    return NextResponse.json({ success: true });
  }

  // ── Flag referral as fraudulent
  if (_action === "flag_fraudulent") {
    const { referralId } = data as { referralId: string };
    if (!referralId) {
      return NextResponse.json(
        { error: "referralId is required" },
        { status: 400 },
      );
    }
    await flagReferralAsFraudulent(referralId);
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
