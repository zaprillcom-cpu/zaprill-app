/**
 * GET /api/billing/invoices/[invoiceId]/pdf
 * Returns a server-rendered PDF for the specified invoice.
 *
 * Auth-guarded: invoice must belong to the authenticated user.
 */

import { renderToBuffer } from "@react-pdf/renderer";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import path from "path";
import { createElement } from "react";
import { InvoicePdf } from "@/components/pdf/InvoicePdf";
import db from "@/db";
import { payment, plan, user } from "@/db/schema";
import { getCompanySettings } from "@/lib/app-settings";
import { auth } from "@/lib/auth";
import { getInvoiceById } from "@/services/billing/invoice.service";
import type { Invoice } from "@/types/billing";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ invoiceId: string }> },
) {
  try {
    const { invoiceId } = await params;
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch invoice
    const inv = await getInvoiceById(invoiceId);
    if (!inv) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }
    if (inv.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Fetch plan name
    const meta = inv.metadata as Record<string, string>;
    const planId = meta?.planId;
    let planName = "Subscription";
    let billingCycle = meta?.billingCycle ?? "monthly";

    if (planId) {
      const [planRow] = await db
        .select({ name: plan.name, billingCycle: plan.billingCycle })
        .from(plan)
        .where(eq(plan.id, planId))
        .limit(1);
      if (planRow) {
        planName = planRow.name;
        billingCycle = billingCycle || planRow.billingCycle;
      }
    }

    // Fetch payment details (method + transaction ID)
    const payments = await db
      .select({
        paymentMethod: payment.paymentMethod,
        transactionId: payment.transactionId,
      })
      .from(payment)
      .where(eq(payment.invoiceId, inv.id))
      .limit(1);
    const pay = payments[0];

    // Fetch company settings
    const company = await getCompanySettings();

    // Build PDF
    const pdfBuffer = await renderToBuffer(
      createElement(InvoicePdf, {
        invoice: inv as Invoice,
        planName,
        billingCycle,
        customerName: session.user.name ?? "Customer",
        customerEmail: session.user.email ?? "",
        paymentMethod: pay?.paymentMethod ?? undefined,
        transactionId: pay?.transactionId ?? undefined,
        company,
        logoUrl: process.env.NEXT_PUBLIC_APP_URL + "/logo.png",
      }) as any,
    );

    const invoiceNum = invoiceId.replace("inv_", "INV-").toUpperCase();

    return new Response(pdfBuffer as any, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${invoiceNum}.pdf"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch (err) {
    console.error("[invoice-pdf]", err);
    return NextResponse.json(
      { error: "Failed to generate invoice" },
      { status: 500 },
    );
  }
}
