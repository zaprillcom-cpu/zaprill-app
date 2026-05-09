/**
 * invoice-email.ts
 * Renders and sends a beautiful, industry-standard invoice receipt email
 * after every successful payment.
 *
 * Design: minimal dark-compatible HTML email, GST line item (hidden when 0),
 * discount line item (hidden when 0), company details (conditionally shown).
 */

import type { CompanySettings } from "@/lib/app-settings";
import { formatCurrency } from "@/lib/billing-utils";
import type { Invoice } from "@/types/billing";
import { sendMail } from "./sendMail";

export interface InvoiceEmailParams {
  email: string;
  name: string;
  invoice: Invoice;
  planName: string;
  billingCycle: string;
  paymentMethod?: string;
  transactionId?: string;
  company: CompanySettings;
}

function formatInvoiceNumber(id: string): string {
  // inv_abc123xyz → INV-ABC123XYZ
  return id.replace("inv_", "INV-").toUpperCase();
}

function formatDate(d: Date | string | null | undefined): string {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function billingReasonLabel(reason: string): string {
  const map: Record<string, string> = {
    subscription_create: "New Subscription",
    renewal: "Subscription Renewal",
    upgrade: "Plan Upgrade",
    downgrade: "Plan Downgrade",
  };
  return map[reason] ?? reason;
}

function methodLabel(method?: string): string {
  if (!method) return "—";
  const map: Record<string, string> = {
    upi: "UPI",
    card: "Card",
    netbanking: "Net Banking",
    wallet: "Wallet",
  };
  return map[method.toLowerCase()] ?? method;
}

export async function sendInvoiceReceiptEmail(
  params: InvoiceEmailParams,
): Promise<void> {
  const {
    email,
    name,
    invoice,
    planName,
    billingCycle,
    paymentMethod,
    transactionId,
    company,
  } = params;

  const inv = invoice;
  const invoiceNum = formatInvoiceNumber(inv.id);
  const paidOn = formatDate(inv.paidAt ?? new Date());
  const issuedOn = formatDate(inv.createdAt);

  const subtotal = parseFloat(inv.amountDue);
  const discount = parseFloat(inv.discountAmount);
  const tax = parseFloat(inv.taxAmount);
  const total = parseFloat(inv.totalAmount);
  const gstPct = inv.gstPercentage ? parseFloat(inv.gstPercentage) : 0;

  const hasDiscount = discount > 0;
  const hasGst = tax > 0 && gstPct > 0;

  // Company details block (shown only if available)
  const hasCompanyDetails =
    company.company_gstin || company.company_address || company.company_cin;

  const companyDetailsHtml = hasCompanyDetails
    ? `
      <tr>
        <td style="padding: 0 0 24px 0;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              ${company.company_gstin ? `<td style="font-size:12px;color:#888;">GSTIN: <strong style="color:#555;">${company.company_gstin}</strong></td>` : ""}
            </tr>
            ${company.company_address ? `<tr><td style="font-size:12px;color:#888;padding-top:2px;">${company.company_address}</td></tr>` : ""}
            ${company.company_cin ? `<tr><td style="font-size:12px;color:#888;padding-top:2px;">CIN: ${company.company_cin}</td></tr>` : ""}
          </table>
        </td>
      </tr>
    `
    : "";

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Invoice ${invoiceNum}</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f7;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#0f0f0f 0%,#1a1a2e 100%);padding:36px 40px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <span style="font-size:24px;font-weight:800;color:#ffffff;letter-spacing:-0.5px;">⚡ Zaprill</span>
                    <p style="margin:4px 0 0;font-size:13px;color:#a0a0b8;">Payment Confirmed</p>
                  </td>
                  <td align="right">
                    <span style="display:inline-block;background:rgba(255,255,255,0.12);color:#fff;font-size:12px;font-weight:600;padding:6px 14px;border-radius:20px;letter-spacing:0.5px;">✓ PAID</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:36px 40px 0;">
              <table width="100%" cellpadding="0" cellspacing="0">

                <!-- Greeting -->
                <tr>
                  <td style="padding-bottom:24px;border-bottom:1px solid #f0f0f0;">
                    <h1 style="margin:0 0 8px;font-size:20px;font-weight:700;color:#0f0f0f;">Hi ${name.split(" ")[0]}, thanks for your payment!</h1>
                    <p style="margin:0;font-size:14px;color:#666;">Here's your receipt for <strong>${invoiceNum}</strong>. We've activated your subscription — you're all set.</p>
                  </td>
                </tr>

                <!-- Invoice meta -->
                <tr>
                  <td style="padding:24px 0;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="width:50%;vertical-align:top;">
                          <p style="margin:0 0 4px;font-size:11px;font-weight:600;color:#999;text-transform:uppercase;letter-spacing:0.8px;">Invoice Number</p>
                          <p style="margin:0;font-size:14px;font-weight:600;color:#0f0f0f;">${invoiceNum}</p>
                        </td>
                        <td style="width:50%;vertical-align:top;text-align:right;">
                          <p style="margin:0 0 4px;font-size:11px;font-weight:600;color:#999;text-transform:uppercase;letter-spacing:0.8px;">Date Paid</p>
                          <p style="margin:0;font-size:14px;font-weight:600;color:#0f0f0f;">${paidOn}</p>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding-top:16px;vertical-align:top;">
                          <p style="margin:0 0 4px;font-size:11px;font-weight:600;color:#999;text-transform:uppercase;letter-spacing:0.8px;">Billed To</p>
                          <p style="margin:0;font-size:14px;color:#333;">${name}</p>
                          <p style="margin:2px 0 0;font-size:13px;color:#666;">${email}</p>
                        </td>
                        <td style="padding-top:16px;vertical-align:top;text-align:right;">
                          <p style="margin:0 0 4px;font-size:11px;font-weight:600;color:#999;text-transform:uppercase;letter-spacing:0.8px;">Invoice Date</p>
                          <p style="margin:0;font-size:14px;color:#333;">${issuedOn}</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Company details (shown when registered) -->
                ${companyDetailsHtml}

                <!-- Line items -->
                <tr>
                  <td style="padding-bottom:8px;">
                    <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #f0f0f0;border-radius:8px;overflow:hidden;">
                      <!-- Header row -->
                      <tr style="background:#f8f8fa;">
                        <td style="padding:12px 16px;font-size:11px;font-weight:700;color:#999;text-transform:uppercase;letter-spacing:0.8px;">Description</td>
                        <td style="padding:12px 16px;font-size:11px;font-weight:700;color:#999;text-transform:uppercase;letter-spacing:0.8px;text-align:right;">Amount</td>
                      </tr>
                      <!-- Plan row -->
                      <tr>
                        <td style="padding:14px 16px;border-top:1px solid #f0f0f0;">
                          <p style="margin:0;font-size:14px;font-weight:600;color:#0f0f0f;">${planName}</p>
                          <p style="margin:3px 0 0;font-size:12px;color:#888;">${billingReasonLabel(inv.billingReason)} · ${billingCycle.charAt(0).toUpperCase() + billingCycle.slice(1)} plan</p>
                        </td>
                        <td style="padding:14px 16px;border-top:1px solid #f0f0f0;text-align:right;font-size:14px;color:#333;white-space:nowrap;">${formatCurrency(subtotal, inv.currency)}</td>
                      </tr>
                      <!-- Discount row (conditional) -->
                      ${
                        hasDiscount
                          ? `
                      <tr>
                        <td style="padding:10px 16px;border-top:1px solid #f0f0f0;">
                          <p style="margin:0;font-size:13px;color:#16a34a;font-weight:500;">Coupon Discount</p>
                        </td>
                        <td style="padding:10px 16px;border-top:1px solid #f0f0f0;text-align:right;font-size:13px;color:#16a34a;white-space:nowrap;">−${formatCurrency(discount, inv.currency)}</td>
                      </tr>
                      `
                          : ""
                      }
                      <!-- GST row (conditional) -->
                      ${
                        hasGst
                          ? `
                      <tr>
                        <td style="padding:10px 16px;border-top:1px solid #f0f0f0;">
                          <p style="margin:0;font-size:13px;color:#555;">GST (${gstPct}%)</p>
                        </td>
                        <td style="padding:10px 16px;border-top:1px solid #f0f0f0;text-align:right;font-size:13px;color:#555;white-space:nowrap;">+${formatCurrency(tax, inv.currency)}</td>
                      </tr>
                      `
                          : ""
                      }
                      <!-- Total row -->
                      <tr style="background:#0f0f0f;">
                        <td style="padding:14px 16px;">
                          <p style="margin:0;font-size:14px;font-weight:700;color:#fff;">Total Paid</p>
                        </td>
                        <td style="padding:14px 16px;text-align:right;font-size:16px;font-weight:800;color:#fff;white-space:nowrap;">${formatCurrency(total, inv.currency)}</td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Payment method -->
                ${
                  paymentMethod || transactionId
                    ? `
                <tr>
                  <td style="padding:20px 0;">
                    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f8fa;border-radius:8px;padding:16px;">
                      <tr>
                        ${
                          paymentMethod
                            ? `
                        <td style="vertical-align:top;width:50%;">
                          <p style="margin:0 0 4px;font-size:11px;font-weight:600;color:#999;text-transform:uppercase;letter-spacing:0.8px;">Payment Method</p>
                          <p style="margin:0;font-size:13px;color:#333;">${methodLabel(paymentMethod)}</p>
                        </td>
                        `
                            : ""
                        }
                        ${
                          transactionId
                            ? `
                        <td style="vertical-align:top;text-align:right;">
                          <p style="margin:0 0 4px;font-size:11px;font-weight:600;color:#999;text-transform:uppercase;letter-spacing:0.8px;">Transaction Ref</p>
                          <p style="margin:0;font-size:12px;color:#333;font-family:monospace;">${transactionId}</p>
                        </td>
                        `
                            : ""
                        }
                      </tr>
                    </table>
                  </td>
                </tr>
                `
                    : ""
                }

                <!-- CTA -->
                <tr>
                  <td style="padding:8px 0 36px;text-align:center;">
                    <a href="https://app.zaprill.com/billing" style="display:inline-block;background:linear-gradient(135deg,#0f0f0f,#1a1a2e);color:#fff;font-size:14px;font-weight:700;padding:14px 36px;border-radius:8px;text-decoration:none;letter-spacing:0.3px;">View Your Billing Page →</a>
                    <p style="margin:16px 0 0;font-size:12px;color:#999;">You can download your invoice PDF from the billing page.</p>
                  </td>
                </tr>

              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f8f8fa;padding:20px 40px;border-top:1px solid #f0f0f0;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="font-size:11px;color:#aaa;text-align:center;">
                    <p style="margin:0;">Questions? Email us at <a href="mailto:${company.company_email || "billing@zaprill.com"}" style="color:#666;text-decoration:none;">${company.company_email || "billing@zaprill.com"}</a></p>
                    <p style="margin:6px 0 0;">© ${new Date().getFullYear()} Zaprill. All rights reserved.</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  const text = [
    `Hi ${name},`,
    ``,
    `Your payment has been confirmed! Here's your receipt.`,
    ``,
    `Invoice: ${invoiceNum}`,
    `Plan: ${planName} (${billingCycle})`,
    `Date Paid: ${paidOn}`,
    ``,
    `Subtotal: ${formatCurrency(subtotal, inv.currency)}`,
    ...(hasDiscount
      ? [`Discount: −${formatCurrency(discount, inv.currency)}`]
      : []),
    ...(hasGst
      ? [`GST (${gstPct}%): +${formatCurrency(tax, inv.currency)}`]
      : []),
    `Total Paid: ${formatCurrency(total, inv.currency)}`,
    ``,
    ...(paymentMethod ? [`Payment Method: ${methodLabel(paymentMethod)}`] : []),
    ...(transactionId ? [`Transaction Ref: ${transactionId}`] : []),
    ``,
    `View your billing page: https://app.zaprill.com/billing`,
    ``,
    `© ${new Date().getFullYear()} Zaprill`,
  ].join("\n");

  await sendMail(email, `Payment Confirmed — ${invoiceNum}`, text, html);
}
