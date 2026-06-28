/**
 * SubscriptionService — Subscription lifecycle management.
 */

import { and, desc, eq, inArray } from "drizzle-orm";
import db from "@/db";
import { plan, subscription, user } from "@/db/schema";
import {
  BillingError,
  calculatePeriodEnd,
  formatCurrency,
  generateId,
} from "@/lib/billing-utils";
import { sendSubscriptionCanceledMail } from "@/lib/emails/subscription-emails";
import type {
  BillingCycle,
  Subscription,
  SubscriptionStatus,
} from "@/types/billing";

export async function createSubscription(opts: {
  userId: string;
  planId: string;
  billingCycle: BillingCycle;
  priceAtPurchase: number;
  couponId?: string;
  discountAmount?: number;
}): Promise<Subscription> {
  const now = new Date();
  const periodEnd = calculatePeriodEnd(now, opts.billingCycle);
  const id = generateId("sub");

  const [created] = await db
    .insert(subscription)
    .values({
      id,
      userId: opts.userId,
      planId: opts.planId,
      status: "active",
      startDate: now,
      currentPeriodStart: now,
      currentPeriodEnd: periodEnd,
      billingCycle: opts.billingCycle,
      priceAtPurchase: opts.priceAtPurchase.toFixed(2),
      couponId: opts.couponId,
      discountAmount: (opts.discountAmount ?? 0).toFixed(2),
    })
    .returning();

  // Email is now handled by WebhookService/InvoiceService to include the PDF receipt.

  return created as Subscription;
}

/** Whether a subscription currently grants premium feature access. */
function toSubscriptionDate(
  value: Date | string | null | undefined,
): Date | null {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function endOfAccessDay(date: Date): Date {
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);
  return end;
}

/** Last day/time through which premium access is granted. */
export function getSubscriptionAccessEnd(sub: Subscription): Date | null {
  if (sub.status === "canceled") {
    return (
      toSubscriptionDate(sub.endDate) ??
      toSubscriptionDate(sub.currentPeriodEnd)
    );
  }
  return toSubscriptionDate(sub.currentPeriodEnd);
}

export function subscriptionGrantsAccess(
  sub: Subscription,
  now: Date = new Date(),
): boolean {
  if (!["active", "trialing", "past_due", "canceled"].includes(sub.status)) {
    return false;
  }

  // Paid subscriptions: status is authoritative until an expiry job exists.
  if (sub.status === "active" || sub.status === "trialing") {
    return true;
  }

  if (sub.status === "past_due") {
    return true;
  }

  // Canceled: prepaid access continues through the paid period (end of day).
  const accessEnd = getSubscriptionAccessEnd(sub);
  if (!accessEnd) return false;
  return now.getTime() <= endOfAccessDay(accessEnd).getTime();
}

/** Get a user's billable subscription (active or trialing). */
export async function getActiveSubscription(
  userId: string,
): Promise<Subscription | null> {
  const [row] = await db
    .select()
    .from(subscription)
    .where(
      and(
        eq(subscription.userId, userId),
        inArray(subscription.status, ["active", "trialing"]),
      ),
    )
    .orderBy(desc(subscription.createdAt))
    .limit(1);
  return (row as Subscription) ?? null;
}

/** Get subscription that grants premium access, including canceled until period end. */
export async function getSubscriptionWithAccess(
  userId: string,
): Promise<Subscription | null> {
  const rows = await db
    .select()
    .from(subscription)
    .where(eq(subscription.userId, userId))
    .orderBy(desc(subscription.createdAt));

  for (const row of rows) {
    if (subscriptionGrantsAccess(row as Subscription)) {
      return row as Subscription;
    }
  }
  return null;
}

export async function getSubscriptionById(
  id: string,
): Promise<Subscription | null> {
  const [row] = await db
    .select()
    .from(subscription)
    .where(eq(subscription.id, id))
    .limit(1);
  return (row as Subscription) ?? null;
}

/** Renew subscription period after successful renewal payment. */
export async function renewSubscription(
  subscriptionId: string,
): Promise<Subscription> {
  const sub = await getSubscriptionById(subscriptionId);
  if (!sub)
    throw new BillingError("Subscription not found", "SUB_NOT_FOUND", 404);

  const now = new Date();
  const newStart = sub.currentPeriodEnd > now ? sub.currentPeriodEnd : now;
  const newEnd = calculatePeriodEnd(newStart, sub.billingCycle);

  const [updated] = await db
    .update(subscription)
    .set({
      status: "active",
      endDate: null,
      currentPeriodStart: newStart,
      currentPeriodEnd: newEnd,
      updatedAt: new Date(),
    })
    .where(eq(subscription.id, subscriptionId))
    .returning();

  // Email is now handled by WebhookService/InvoiceService to include the PDF receipt.

  return updated as Subscription;
}

/** Cancel subscription — keeps access until period end. */
export async function cancelSubscription(
  subscriptionId: string,
  userId: string,
): Promise<void> {
  const sub = await getSubscriptionById(subscriptionId);
  if (!sub)
    throw new BillingError("Subscription not found", "SUB_NOT_FOUND", 404);
  if (sub.userId !== userId)
    throw new BillingError("Forbidden", "FORBIDDEN", 403);
  if (sub.status === "canceled") return; // already canceled — idempotent

  await db
    .update(subscription)
    .set({
      status: "canceled",
      endDate: sub.currentPeriodEnd, // access until end of paid period
      updatedAt: new Date(),
    })
    .where(eq(subscription.id, subscriptionId));

  try {
    const [u] = await db
      .select()
      .from(user)
      .where(eq(user.id, userId))
      .limit(1);
    const [p] = await db
      .select()
      .from(plan)
      .where(eq(plan.id, sub.planId))
      .limit(1);
    if (u?.email && p) {
      void sendSubscriptionCanceledMail(
        u.email,
        p.name,
        new Date(sub.currentPeriodEnd).toLocaleDateString(),
      );
    }
  } catch (err) {
    console.error("Error sending subscription canceled email:", err);
  }
}

/** Mark subscription past_due on renewal payment failure. */
export async function markSubscriptionPastDue(
  subscriptionId: string,
): Promise<void> {
  await db
    .update(subscription)
    .set({ status: "past_due", updatedAt: new Date() })
    .where(
      and(
        eq(subscription.id, subscriptionId),
        inArray(subscription.status, ["active", "trialing"]),
      ),
    );
}

/** Update status generically (used by admin / system). */
export async function updateSubscriptionStatus(
  subscriptionId: string,
  status: SubscriptionStatus,
): Promise<void> {
  await db
    .update(subscription)
    .set({ status, updatedAt: new Date() })
    .where(eq(subscription.id, subscriptionId));
}
