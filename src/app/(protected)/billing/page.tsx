import { desc, eq } from "drizzle-orm";
import { headers } from "next/headers";
import PricingPlans from "@/components/PricingPlans";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import db from "@/db";
import { invoice, plan, subscription } from "@/db/schema";
import { auth } from "@/lib/auth";
import { formatCurrency } from "@/lib/billing-utils";
import { BillingClientShell } from "./_components/billing-client-shell";
import { BillingInvoiceTable } from "./_components/billing-invoice-table";
import CancelSubscriptionButton from "./cancel-button";

export const metadata = {
  title: "Billing | Zaprill",
};

export default async function BillingPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return null; // handled by middleware

  // Fetch latest subscription attempt/record
  const [sub] = await db
    .select()
    .from(subscription)
    .where(eq(subscription.userId, session.user.id))
    .orderBy(desc(subscription.createdAt))
    .limit(1);

  let activePlan = null;
  if (sub) {
    const [p] = await db
      .select()
      .from(plan)
      .where(eq(plan.id, sub.planId))
      .limit(1);
    activePlan = p;
  }

  // Fetch plans for display
  const plans = await db
    .select()
    .from(plan)
    .where(eq(plan.isActive, true))
    .orderBy(plan.sortOrder);

  // Fetch invoices
  const invoices = await db
    .select()
    .from(invoice)
    .where(eq(invoice.userId, session.user.id))
    .orderBy(desc(invoice.createdAt))
    .limit(20);

  // Functional "Active" check: trialing, active, or past_due
  // 'canceled' is NOT in this list because even though it keeps access,
  // we want to show the pricing plans for them to "renew" or "switch" easily
  // or at least show them the options.
  const isFunctionallyActive =
    sub && ["active", "trialing", "past_due"].includes(sub.status);

  return (
    <div className="min-h-screen bg-background">
      <BillingClientShell />

      <div className="container mx-auto max-w-4xl space-y-8 py-10">
        {/* Header */}
        <div>
          <h1 className="font-bold text-3xl tracking-tight">
            Billing & Subscription
          </h1>
          <p className="mt-2 text-muted-foreground">
            Manage your plan, payment methods, and invoices.
          </p>
        </div>

        {/* Subscription Status Card */}
        <Card className={isFunctionallyActive ? "border-primary/50" : ""}>
          <CardHeader>
            <CardTitle>Current Plan</CardTitle>
            <CardDescription>
              {sub?.status === "active"
                ? "Your subscription is active and will auto-renew."
                : sub?.status === "canceled"
                  ? "Your subscription has been canceled but remains active until the end of the billing period."
                  : "You are currently on the free plan."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {isFunctionallyActive && activePlan ? (
              <div className="flex flex-col justify-between gap-4 rounded-lg border bg-muted/20 p-4 md:flex-row md:items-center">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-lg">
                      {activePlan.name}
                    </span>
                    <Badge
                      variant={
                        sub.status === "active" ? "default" : "secondary"
                      }
                    >
                      {sub.status.toUpperCase()}
                    </Badge>
                  </div>
                  <p className="mt-1 text-muted-foreground text-sm">
                    {formatCurrency(sub.priceAtPurchase)} / {sub.billingCycle}
                  </p>
                  <p className="mt-2 text-muted-foreground text-xs">
                    Current period:{" "}
                    {new Date(sub.currentPeriodStart).toLocaleDateString()} —{" "}
                    {new Date(sub.currentPeriodEnd).toLocaleDateString()}
                  </p>
                </div>
                {sub.status === "active" && (
                  <CancelSubscriptionButton subscriptionId={sub.id} />
                )}
              </div>
            ) : sub?.status === "canceled" && activePlan ? (
              <div className="space-y-6">
                <div className="flex flex-col justify-between gap-4 rounded-lg border border-yellow-500/20 bg-yellow-500/10 p-4 md:flex-row md:items-center">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-lg">
                        {activePlan.name}
                      </span>
                      <Badge
                        variant="outline"
                        className="border-yellow-600 text-yellow-600"
                      >
                        CANCELED
                      </Badge>
                    </div>
                    <p className="mt-2 text-muted-foreground text-xs">
                      Access ends on:{" "}
                      {new Date(sub.currentPeriodEnd).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="border-t pt-4">
                  <p className="mb-4 font-medium text-sm">
                    Want to restart your subscription?
                  </p>
                  <PricingPlans plans={plans} />
                </div>
              </div>
            ) : (
              <div className="space-y-8">
                <div className="rounded-lg border bg-muted/10 p-8 text-center">
                  <p className="font-medium text-muted-foreground">
                    You don&apos;t have an active premium subscription. Choose a
                    plan below to get started.
                  </p>
                </div>
                <PricingPlans plans={plans} />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Invoice History */}
        <Card>
          <CardHeader>
            <CardTitle>Invoice History</CardTitle>
            <CardDescription>
              Click any invoice to view details and download a PDF receipt.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <BillingInvoiceTable invoices={invoices as any} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
