/**
 * CouponService — Coupon validation, reservation, and redemption.
 *
 * Race condition prevention:
 * The reservation step uses a pg transaction with SELECT ... FOR UPDATE
 * to lock the coupon row while checking usage counts. This prevents
 * two concurrent requests from both passing the usage limit check.
 */

import { and, count, eq, inArray, isNull, ne, or } from "drizzle-orm";
import { drizzle as pgDrizzle } from "drizzle-orm/node-postgres";
import db, { schema } from "@/db";
import { withTransaction } from "@/db/pool";
import { coupons, couponUsage, invoice } from "@/db/schema";

import {
  BillingError,
  calculateDiscount,
  generateId,
} from "@/lib/billing-utils";
import type { Coupon, CouponValidationResult } from "@/types/billing";

// ─────────────────────────────────────────────────
// Validation
// ─────────────────────────────────────────────────

/**
 * Validate a coupon code WITHOUT reserving it.
 * Used for the "preview" endpoint to show discount to user.
 */
export async function validateCoupon(
  code: string,
  userId: string,
  orderAmount: number,
  isNewUser = false,
): Promise<CouponValidationResult> {
  const now = new Date();

  // 1. Find coupon by code
  const [coupon] = await db
    .select()
    .from(coupons)
    .where(eq(coupons.code, code.toUpperCase().trim()))
    .limit(1);

  if (!coupon) {
    return { valid: false, error: "Invalid coupon code" };
  }

  // 2. Status check
  if (coupon.status !== "active") {
    return {
      valid: false,
      error: `Coupon is ${coupon.status}`,
    };
  }

  // 3. Date range check
  if (coupon.startTime && now < coupon.startTime) {
    return { valid: false, error: "Coupon is not yet active" };
  }
  if (coupon.endTime && now > coupon.endTime) {
    return { valid: false, error: "Coupon has expired" };
  }

  // 4. Minimum order value check
  const minOrder = parseFloat(coupon.minOrderValue ?? "0");
  if (orderAmount < minOrder) {
    return {
      valid: false,
      error: `Minimum order value for this coupon is ₹${minOrder}`,
    };
  }

  // 5. New-user-only check
  if (coupon.newUserOnly && !isNewUser) {
    return { valid: false, error: "This coupon is for new users only" };
  }

  // 6. Global usage limit check
  if (coupon.usageLimitGlobal !== null) {
    const [{ value: globalUsed }] = await db
      .select({ value: count() })
      .from(couponUsage)
      .leftJoin(invoice, eq(couponUsage.orderId, invoice.id))
      .where(
        and(
          eq(couponUsage.couponId, coupon.id),
          or(
            eq(couponUsage.status, "redeemed"),
            and(
              eq(couponUsage.status, "reserved"),
              or(
                isNull(invoice.status),
                and(ne(invoice.status, "void"), ne(invoice.status, "failed")),
              ),
            ),
          ),
        ),
      );

    if (Number(globalUsed) >= coupon.usageLimitGlobal) {
      return { valid: false, error: "Coupon usage limit has been reached" };
    }
  }

  // 7. Per-user usage limit check
  const perUserLimit = coupon.usageLimitPerUser ?? 1;
  const [{ value: userUsed }] = await db
    .select({ value: count() })
    .from(couponUsage)
    .leftJoin(invoice, eq(couponUsage.orderId, invoice.id))
    .where(
      and(
        eq(couponUsage.couponId, coupon.id),
        eq(couponUsage.userId, userId),
        eq(couponUsage.status, "redeemed"),
      ),
    );

  if (Number(userUsed) >= perUserLimit) {
    return { valid: false, error: "You have already used this coupon" };
  }

  // 8. Calculate discount
  const discountAmount = calculateDiscount(
    coupon.type,
    coupon.value,
    orderAmount,
    coupon.maxDiscount,
  );
  const finalAmount = Math.max(0, orderAmount - discountAmount);

  return {
    valid: true,
    coupon: coupon as Coupon,
    discountAmount,
    finalAmount,
  };
}

// ─────────────────────────────────────────────────
// Reservation (transactional, race-condition safe)
// ─────────────────────────────────────────────────

/**
 * Reserve a coupon for an in-progress checkout.
 * Uses SELECT ... FOR UPDATE inside a transaction to prevent
 * concurrent over-redemption.
 *
 * Returns the coupon_usage row id.
 */
export async function reserveCoupon(
  couponCode: string,
  userId: string,
  invoiceId: string,
): Promise<{ couponUsageId: string; coupon: Coupon }> {
  return withTransaction(async (client) => {
    // Create a Drizzle instance using the transactional pg client
    const tx = pgDrizzle(client, { schema });

    // 1. Find and lock the coupon row
    const [coupon] = await tx
      .select()
      .from(coupons)
      .where(eq(coupons.code, couponCode.toUpperCase().trim()))
      .for("update")
      .limit(1);

    if (!coupon) {
      throw new BillingError("Invalid coupon code", "COUPON_NOT_FOUND");
    }

    if (coupon.status !== "active") {
      throw new BillingError(`Coupon is ${coupon.status}`, "COUPON_INACTIVE");
    }

    const now = new Date();
    if (coupon.endTime && now > coupon.endTime) {
      throw new BillingError("Coupon has expired", "COUPON_EXPIRED");
    }

    // 2. Check global usage (within lock)
    if (coupon.usageLimitGlobal !== null) {
      const [{ count: globalUsed }] = await tx
        .select({ count: count() })
        .from(couponUsage)
        .leftJoin(invoice, eq(couponUsage.orderId, invoice.id))
        .where(
          and(
            eq(couponUsage.couponId, coupon.id),
            or(
              eq(couponUsage.status, "redeemed"),
              and(
                eq(couponUsage.status, "reserved"),
                or(
                  isNull(invoice.status),
                  and(ne(invoice.status, "void"), ne(invoice.status, "failed")),
                ),
              ),
            ),
          ),
        );

      if (Number(globalUsed) >= coupon.usageLimitGlobal) {
        throw new BillingError(
          "Coupon usage limit has been reached",
          "COUPON_GLOBAL_LIMIT",
        );
      }
    }

    // 3. Check per-user usage (within lock)
    // For per-user, we only count REDEEMED coupons to allow users to retry checkouts
    // unless they have a currently ACTIVE reserved checkout for THIS specific coupon.
    // However, the checkout API voids old invoices, so this is safe.
    const perUserLimit = coupon.usageLimitPerUser ?? 1;
    const [{ count: userUsed }] = await tx
      .select({ count: count() })
      .from(couponUsage)
      .where(
        and(
          eq(couponUsage.couponId, coupon.id),
          eq(couponUsage.userId, userId),
          eq(couponUsage.status, "redeemed"),
        ),
      );

    if (Number(userUsed) >= perUserLimit) {
      throw new BillingError(
        "You have already used this coupon",
        "COUPON_USER_LIMIT",
      );
    }

    // 4. Insert reservation
    const usageId = generateId("cu");
    await tx.insert(couponUsage).values({
      id: usageId,
      couponId: coupon.id,
      userId,
      orderId: invoiceId,
      status: "reserved",
      reservedAt: new Date(),
    });

    return {
      couponUsageId: usageId,
      coupon: coupon as Coupon,
    };
  });
}

// ─────────────────────────────────────────────────
// Redemption / Release
// ─────────────────────────────────────────────────

/** Mark coupon as redeemed after successful payment. Idempotent. */
export async function redeemCoupon(couponUsageId: string): Promise<void> {
  await db
    .update(couponUsage)
    .set({
      status: "redeemed",
      redeemedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(couponUsage.id, couponUsageId),
        eq(couponUsage.status, "reserved"), // only transition from reserved
      ),
    );
}

/** Release a reserved coupon on payment failure. Idempotent. */
export async function releaseCoupon(couponUsageId: string): Promise<void> {
  await db
    .update(couponUsage)
    .set({
      status: "released",
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(couponUsage.id, couponUsageId),
        eq(couponUsage.status, "reserved"),
      ),
    );
}

/** Find the active coupon_usage for an invoice. */
export async function getCouponUsageByInvoice(
  invoiceId: string,
): Promise<{ id: string; couponId: string } | null> {
  const [row] = await db
    .select({ id: couponUsage.id, couponId: couponUsage.couponId })
    .from(couponUsage)
    .where(
      and(
        eq(couponUsage.orderId, invoiceId),
        eq(couponUsage.status, "reserved"),
      ),
    )
    .limit(1);

  return row ?? null;
}
