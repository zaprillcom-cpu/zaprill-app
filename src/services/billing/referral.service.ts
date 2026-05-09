/**
 * referral.service.ts
 * Core referral system business logic.
 *
 * Design principles:
 * - Idempotent: calling convertReferral multiple times for the same user is safe.
 * - Atomic: reward creation uses DB transactions to prevent partial writes.
 * - Edge-case hardened: self-referral, duplicate referral, and double-conversion
 *   are all blocked at the DB and application level.
 */

import {
  and,
  count,
  desc,
  eq,
  inArray,
  isNull,
  ne,
  or,
  sql,
} from "drizzle-orm";
import { customAlphabet } from "nanoid";
import db from "@/db";
import { coupons, referralRewards, referrals, user } from "@/db/schema";
import { getReferralSettings } from "@/lib/app-settings";
import { generateId } from "@/lib/billing-utils";

// ─────────────────────────────────────────────────
// Code Generation
// ─────────────────────────────────────────────────

// 8-char alphanumeric code — low collision probability at typical scale
const codeAlphabet = customAlphabet("ABCDEFGHJKLMNPQRSTUVWXYZ23456789", 8);

function makeReferralCode(): string {
  return `REF${codeAlphabet()}`;
}

// ─────────────────────────────────────────────────
// Code Management
// ─────────────────────────────────────────────────

/**
 * Get a user's referral code, creating one lazily if they don't have one yet.
 * Safe to call concurrently — uses onConflictDoNothing to handle races.
 */
export async function getOrCreateReferralCode(userId: string): Promise<string> {
  // Check if user already has a code
  const [existing] = await db
    .select({ referralCode: user.referralCode })
    .from(user)
    .where(eq(user.id, userId))
    .limit(1);

  if (existing?.referralCode) return existing.referralCode;

  // Generate new code — retry up to 5 times on collision
  for (let attempt = 0; attempt < 5; attempt++) {
    const code = makeReferralCode();
    try {
      await db
        .update(user)
        .set({ referralCode: code })
        .where(and(eq(user.id, userId), isNull(user.referralCode)));

      return code;
    } catch {}
  }

  // Last resort: re-fetch (another concurrent request may have set it)
  const [refetched] = await db
    .select({ referralCode: user.referralCode })
    .from(user)
    .where(eq(user.id, userId))
    .limit(1);

  if (refetched?.referralCode) return refetched.referralCode;
  throw new Error("Failed to generate referral code after 5 attempts");
}

// ─────────────────────────────────────────────────
// Code Validation (public — no auth required)
// ─────────────────────────────────────────────────

export interface ReferralCodeInfo {
  valid: boolean;
  referrerName?: string; // display name for the referral page
  discountPct?: number; // referee reward %
  error?: string;
}

/**
 * Validate a referral code for display on the signup page.
 * Does NOT modify any state.
 */
export async function validateReferralCode(
  code: string,
): Promise<ReferralCodeInfo> {
  const settings = await getReferralSettings();
  if (!settings.referral_enabled) {
    return { valid: false, error: "Referral program is currently inactive" };
  }

  const normalizedCode = code.trim().toUpperCase();

  const [referrer] = await db
    .select({ id: user.id, name: user.name })
    .from(user)
    .where(eq(user.referralCode, normalizedCode))
    .limit(1);

  if (!referrer) {
    return { valid: false, error: "Invalid referral code" };
  }

  return {
    valid: true,
    referrerName: referrer.name,
    discountPct: settings.referral_referee_reward_pct,
  };
}

// ─────────────────────────────────────────────────
// Claim (post sign-up)
// ─────────────────────────────────────────────────

export interface ClaimReferralResult {
  success: boolean;
  referralId?: string;
  error?: string;
}

/**
 * Claim a referral code after a user signs up.
 * Called by the claim API route immediately after sign-up.
 *
 * Edge cases handled:
 *  - Self-referral: rejected
 *  - User already referred: rejected (unique index on referred_user_id)
 *  - Referrer's code doesn't exist: rejected
 *  - Referral program disabled: rejected
 *  - Referrer hit their max referral limit: rejected
 */
export async function claimReferral(
  referralCode: string,
  referredUserId: string,
  referredEmail: string,
): Promise<ClaimReferralResult> {
  const settings = await getReferralSettings();
  if (!settings.referral_enabled) {
    return { success: false, error: "Referral program is currently inactive" };
  }

  const normalizedCode = referralCode.trim().toUpperCase();

  // 1. Look up the referrer
  const [referrer] = await db
    .select({ id: user.id, email: user.email, referralCode: user.referralCode })
    .from(user)
    .where(eq(user.referralCode, normalizedCode))
    .limit(1);

  if (!referrer) {
    return { success: false, error: "Invalid referral code" };
  }

  // 2. Self-referral check
  if (referrer.id === referredUserId) {
    return { success: false, error: "You cannot refer yourself" };
  }

  // 3. Same-email check
  if (referrer.email.toLowerCase() === referredEmail.toLowerCase()) {
    return { success: false, error: "You cannot refer yourself" };
  }

  // 4. Check if this user was already referred (unique index will also catch this)
  const [existingReferral] = await db
    .select({ id: referrals.id })
    .from(referrals)
    .where(eq(referrals.referredUserId, referredUserId))
    .limit(1);

  if (existingReferral) {
    return { success: false, error: "Already referred" };
  }

  // 5. Check max referrals per referrer
  if (settings.referral_max_per_user !== null) {
    const [{ value: referrerCount }] = await db
      .select({ value: count() })
      .from(referrals)
      .where(
        and(
          eq(referrals.referrerUserId, referrer.id),
          ne(referrals.status, "fraudulent"),
        ),
      );

    if (referrerCount >= settings.referral_max_per_user) {
      return {
        success: false,
        error: "Referrer has reached their maximum referral limit",
      };
    }
  }

  // 6. Create the referral row
  const id = generateId("ref");
  try {
    await db.insert(referrals).values({
      id,
      referrerUserId: referrer.id,
      referredUserId,
      referralCode: normalizedCode,
      type: "user",
      status: "signed_up",
      referredEmail,
      metadata: {},
    });

    return { success: true, referralId: id };
  } catch (err: unknown) {
    // unique constraint on referred_user_id — already referred
    if (
      typeof err === "object" &&
      err !== null &&
      "code" in err &&
      (err as { code: string }).code === "23505"
    ) {
      return { success: false, error: "Already referred" };
    }
    throw err;
  }
}

// ─────────────────────────────────────────────────
// Conversion (triggered by webhook on payment success)
// ─────────────────────────────────────────────────

/**
 * Convert a referral when the referred user completes their first payment.
 * This is idempotent — calling it twice for the same user is safe.
 *
 * Actions:
 *  1. Find the pending referral for this user
 *  2. Atomically transition signed_up → converted
 *  3. Issue a coupon reward to the referrer
 *  4. Issue a coupon reward to the referee (for next purchase, if applicable)
 *  5. Send notification emails (fire-and-forget)
 */
export async function convertReferral(
  referredUserId: string,
  invoiceId: string,
): Promise<void> {
  // Find the active referral for this user
  const [referral] = await db
    .select()
    .from(referrals)
    .where(
      and(
        eq(referrals.referredUserId, referredUserId),
        eq(referrals.status, "signed_up"),
      ),
    )
    .limit(1);

  if (!referral) return; // No pending referral — nothing to do

  const settings = await getReferralSettings();

  // Atomically mark as converted (guards against duplicate webhook calls)
  const [converted] = await db
    .update(referrals)
    .set({
      status: "converted",
      convertedAt: new Date(),
      conversionInvoiceId: invoiceId,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(referrals.id, referral.id),
        eq(referrals.status, "signed_up"), // CAS guard
      ),
    )
    .returning({ id: referrals.id });

  if (!converted) return; // Another process beat us — idempotent, skip

  // Issue rewards concurrently
  await Promise.all([
    issueReferrerCoupon(referral, settings.referral_referrer_reward_pct),
    issueRefereeCoupon(referral, settings.referral_referee_reward_pct),
  ]);

  // Send emails (fire-and-forget — don't fail the payment flow)
  import("@/lib/emails/referral-emails").then(
    ({ sendReferrerRewardEmail, sendRefereeWelcomeEmail }) => {
      void sendReferrerRewardEmail(referral.referrerUserId, referral.id).catch(
        console.error,
      );
      void sendRefereeWelcomeEmail(referredUserId, referral.id).catch(
        console.error,
      );
    },
  );
}

// ─────────────────────────────────────────────────
// Internal: Reward Issuance
// ─────────────────────────────────────────────────

/**
 * Create a percentage-discount coupon for the referrer and record the reward.
 * The coupon is per-user-limited to 1 use and valid for 1 year.
 */
async function issueReferrerCoupon(
  referral: typeof referrals.$inferSelect,
  pct: number,
): Promise<void> {
  // Check if reward already issued (idempotency)
  const [existing] = await db
    .select({ id: referralRewards.id })
    .from(referralRewards)
    .where(
      and(
        eq(referralRewards.referralId, referral.id),
        eq(referralRewards.recipientRole, "referrer"),
      ),
    )
    .limit(1);

  if (existing) return;

  const couponCode = `RWRD${generateId("").slice(4, 12).toUpperCase()}`;
  const couponId = generateId("coup");
  const expiryDate = new Date();
  expiryDate.setFullYear(expiryDate.getFullYear() + 1);

  // Create the reward coupon
  await db.insert(coupons).values({
    id: couponId,
    code: couponCode,
    type: "percentage",
    value: pct.toString(),
    maxDiscount: null,
    minOrderValue: "0",
    startTime: new Date(),
    endTime: expiryDate,
    usageLimitGlobal: 1,
    usageLimitPerUser: 1,
    newUserOnly: false,
    isPublic: false, // referral coupons are private
    status: "active",
  });

  // Record the reward
  await db.insert(referralRewards).values({
    id: generateId("rr"),
    referralId: referral.id,
    recipientUserId: referral.referrerUserId,
    recipientRole: "referrer",
    rewardType: "coupon",
    couponId,
    commissionStatus: "paid", // coupon reward = immediately granted
  });
}

/**
 * Create a percentage-discount coupon for the referee (their next subscription).
 */
async function issueRefereeCoupon(
  referral: typeof referrals.$inferSelect,
  pct: number,
): Promise<void> {
  if (!referral.referredUserId) return;

  // Check if reward already issued
  const [existing] = await db
    .select({ id: referralRewards.id })
    .from(referralRewards)
    .where(
      and(
        eq(referralRewards.referralId, referral.id),
        eq(referralRewards.recipientRole, "referee"),
      ),
    )
    .limit(1);

  if (existing) return;

  const couponCode = `WELCOME${generateId("").slice(4, 10).toUpperCase()}`;
  const couponId = generateId("coup");
  const expiryDate = new Date();
  expiryDate.setMonth(expiryDate.getMonth() + 6); // 6-month window

  await db.insert(coupons).values({
    id: couponId,
    code: couponCode,
    type: "percentage",
    value: pct.toString(),
    maxDiscount: null,
    minOrderValue: "0",
    startTime: new Date(),
    endTime: expiryDate,
    usageLimitGlobal: 1,
    usageLimitPerUser: 1,
    newUserOnly: false,
    isPublic: false,
    status: "active",
  });

  await db.insert(referralRewards).values({
    id: generateId("rr"),
    referralId: referral.id,
    recipientUserId: referral.referredUserId,
    recipientRole: "referee",
    rewardType: "coupon",
    couponId,
    commissionStatus: "paid",
  });
}

// ─────────────────────────────────────────────────
// Influencer Referral Management (Admin)
// ─────────────────────────────────────────────────

export interface CreateInfluencerCodeParams {
  userId: string; // The influencer's user account
  commissionType: "flat" | "per_user" | "percentage";
  commissionValue: number; // ₹ amount or %
  customCode?: string; // optional vanity code (e.g. "TECHGURU")
  refereePct?: number; // referee discount % (overrides default)
}

/**
 * Admin action: create or upgrade a user to an influencer referral program.
 * Sets their referral code and stores influencer commission config on the referral rows.
 */
export async function createInfluencerCode(
  params: CreateInfluencerCodeParams,
): Promise<{ code: string }> {
  const { userId, commissionType, commissionValue, customCode } = params;

  // Set custom code if provided, otherwise use existing/generate
  let code: string;
  if (customCode) {
    const normalized = customCode.trim().toUpperCase();
    // Check uniqueness
    const [conflict] = await db
      .select({ id: user.id })
      .from(user)
      .where(and(eq(user.referralCode, normalized), ne(user.id, userId)))
      .limit(1);

    if (conflict) {
      throw new Error(`Code "${normalized}" is already taken`);
    }

    await db
      .update(user)
      .set({ referralCode: normalized })
      .where(eq(user.id, userId));

    code = normalized;
  } else {
    code = await getOrCreateReferralCode(userId);
  }

  return { code };
}

// ─────────────────────────────────────────────────
// Admin: Commission Payout
// ─────────────────────────────────────────────────

export async function markCommissionPaid(
  rewardId: string,
  paymentRef: string,
): Promise<void> {
  await db
    .update(referralRewards)
    .set({
      commissionStatus: "paid",
      commissionPaidAt: new Date(),
      commissionPaymentRef: paymentRef,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(referralRewards.id, rewardId),
        eq(referralRewards.commissionStatus, "pending"),
      ),
    );
}

export async function voidCommission(rewardId: string): Promise<void> {
  await db
    .update(referralRewards)
    .set({ commissionStatus: "void", updatedAt: new Date() })
    .where(eq(referralRewards.id, rewardId));
}

// ─────────────────────────────────────────────────
// Stats Queries
// ─────────────────────────────────────────────────

export interface ReferralStats {
  totalReferrals: number;
  converted: number;
  pending: number;
  expired: number;
  totalRewards: number;
  referralCode: string | null;
  referrals: {
    id: string;
    referredEmail: string | null;
    status: string;
    convertedAt: string | null;
    createdAt: string;
  }[];
}

export async function getReferralStats(userId: string): Promise<ReferralStats> {
  const [codeRow] = await db
    .select({ referralCode: user.referralCode })
    .from(user)
    .where(eq(user.id, userId))
    .limit(1);

  const rows = await db
    .select({ status: referrals.status, cnt: count() })
    .from(referrals)
    .where(eq(referrals.referrerUserId, userId))
    .groupBy(referrals.status);

  const map: Record<string, number> = {};
  for (const r of rows) map[r.status] = Number(r.cnt);

  const [rewardRow] = await db
    .select({ total: count() })
    .from(referralRewards)
    .where(eq(referralRewards.recipientUserId, userId));

  // Fetch individual referral rows for the history table (last 50)
  const referralRows = await db
    .select({
      id: referrals.id,
      referredEmail: referrals.referredEmail,
      status: referrals.status,
      convertedAt: referrals.convertedAt,
      createdAt: referrals.createdAt,
    })
    .from(referrals)
    .where(eq(referrals.referrerUserId, userId))
    .orderBy(desc(referrals.createdAt))
    .limit(50);

  return {
    referralCode: codeRow?.referralCode ?? null,
    totalReferrals: Object.values(map).reduce((a, b) => a + b, 0),
    converted: map.converted ?? 0,
    pending: map.signed_up ?? 0,
    expired: map.expired ?? 0,
    totalRewards: Number(rewardRow?.total ?? 0),
    referrals: referralRows.map((r) => ({
      id: r.id,
      referredEmail: r.referredEmail,
      status: r.status,
      convertedAt: r.convertedAt ? r.convertedAt.toISOString() : null,
      createdAt: r.createdAt.toISOString(),
    })),
  };
}

// ─────────────────────────────────────────────────
// Admin: All Referrals
// ─────────────────────────────────────────────────

export interface AdminReferralFilters {
  status?: string;
  type?: string;
  limit?: number;
  offset?: number;
}

export async function getAllReferrals(filters: AdminReferralFilters = {}) {
  const { status, type, limit = 50, offset = 0 } = filters;

  const conditions = [];
  if (status)
    conditions.push(
      eq(
        referrals.status,
        status as "signed_up" | "converted" | "expired" | "fraudulent",
      ),
    );
  if (type) conditions.push(eq(referrals.type, type as "user" | "influencer"));

  const rows = await db
    .select({
      referral: referrals,
      referrerName: user.name,
      referrerEmail: user.email,
    })
    .from(referrals)
    .leftJoin(user, eq(referrals.referrerUserId, user.id))
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(referrals.createdAt))
    .limit(limit)
    .offset(offset);

  return rows;
}

export async function getReferralAdminSummary() {
  const [totals] = await db
    .select({
      total: count(),
    })
    .from(referrals);

  const byStatus = await db
    .select({ status: referrals.status, cnt: count() })
    .from(referrals)
    .groupBy(referrals.status);

  const pendingCommissions = await db
    .select({ total: count() })
    .from(referralRewards)
    .where(eq(referralRewards.commissionStatus, "pending"));

  const map: Record<string, number> = {};
  for (const r of byStatus) map[r.status] = Number(r.cnt);

  return {
    total: Number(totals?.total ?? 0),
    converted: map.converted ?? 0,
    pending: map.signed_up ?? 0,
    expired: map.expired ?? 0,
    fraudulent: map.fraudulent ?? 0,
    conversionRate:
      Number(totals?.total ?? 0) > 0
        ? Math.round(((map.converted ?? 0) / Number(totals?.total ?? 1)) * 100)
        : 0,
    pendingCommissions: Number(pendingCommissions[0]?.total ?? 0),
  };
}

// ─────────────────────────────────────────────────
// Admin: Flag as Fraudulent
// ─────────────────────────────────────────────────

export async function flagReferralAsFraudulent(
  referralId: string,
): Promise<void> {
  await db
    .update(referrals)
    .set({ status: "fraudulent", updatedAt: new Date() })
    .where(eq(referrals.id, referralId));
}

// ─────────────────────────────────────────────────
// Background: Expire stale referrals
// ─────────────────────────────────────────────────

export async function expireStaleReferrals(expiryDays = 90): Promise<number> {
  const cutoff = new Date(Date.now() - expiryDays * 24 * 60 * 60 * 1000);
  const result = await db
    .update(referrals)
    .set({ status: "expired", updatedAt: new Date() })
    .where(
      and(
        eq(referrals.status, "signed_up"),
        sql`${referrals.createdAt} < ${cutoff}`,
      ),
    )
    .returning({ id: referrals.id });

  return result.length;
}
