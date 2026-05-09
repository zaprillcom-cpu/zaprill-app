/**
 * InvoicePdf.tsx
 * React-PDF document for generating an A4 invoice PDF.
 * Rendered server-side via @react-pdf/renderer.
 */

import {
  Document,
  Font,
  Image,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";
import type { CompanySettings } from "@/lib/app-settings";
import { formatCurrency } from "@/lib/billing-utils";
import type { Invoice } from "@/types/billing";

// ── Register a clean font ──────────────────────────────────────────────────
// Using Helvetica (built-in PDF font) — no external fetch needed
Font.register({
  family: "Helvetica",
  fonts: [{ src: "Helvetica" }, { src: "Helvetica-Bold", fontWeight: "bold" }],
});

// ── Styles ─────────────────────────────────────────────────────────────────
const colors = {
  ink: "#0f0f0f",
  muted: "#6b7280",
  subtle: "#9ca3af",
  border: "#e5e7eb",
  surface: "#f9fafb",
  accent: "#0f0f0f",
  white: "#ffffff",
  green: "#16a34a",
};

const s = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 10,
    color: colors.ink,
    backgroundColor: colors.white,
    padding: 48,
  },

  // ── Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 36,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  brandName: {
    fontSize: 20,
    fontFamily: "Helvetica-Bold",
    color: colors.ink,
    letterSpacing: -0.5,
  },
  logo: {
    width: 100,
    marginBottom: 0,
  },
  brandTagline: { fontSize: 9, color: colors.muted, marginTop: 1 },
  invoiceLabel: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: colors.muted,
    textTransform: "uppercase",
    letterSpacing: 1,
    textAlign: "right",
  },
  invoiceNumber: {
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
    color: colors.ink,
    textAlign: "right",
    marginTop: 4,
  },
  paidBadge: {
    marginTop: 6,
    backgroundColor: "#dcfce7",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    alignSelf: "flex-end",
  },
  paidBadgeText: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: colors.green,
    letterSpacing: 0.8,
  },

  // ── Meta grid
  metaGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 28,
  },
  metaBlock: { flex: 1 },
  metaBlockRight: { flex: 1, alignItems: "flex-end" },
  metaLabel: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: colors.muted,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 3,
  },
  metaValue: { fontSize: 10, color: colors.ink },
  metaMuted: { fontSize: 9, color: colors.muted, marginTop: 2 },

  // ── Company details
  companyBox: {
    backgroundColor: colors.surface,
    borderRadius: 6,
    padding: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.border,
  },
  companyTitle: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: colors.muted,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  companyText: { fontSize: 9, color: colors.muted, lineHeight: 1.5 },

  // ── Table
  table: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 6,
    overflow: "hidden",
    marginBottom: 4,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: colors.surface,
    paddingVertical: 9,
    paddingHorizontal: 14,
  },
  tableHeaderText: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: colors.muted,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  tableRowTotal: {
    flexDirection: "row",
    paddingVertical: 13,
    paddingHorizontal: 14,
    backgroundColor: colors.ink,
  },
  tableDesc: { flex: 1 },
  tableAmt: { width: 100, textAlign: "right" },
  tableDescMain: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: colors.ink,
  },
  tableDescSub: { fontSize: 8, color: colors.muted, marginTop: 2 },
  tableAmtText: { fontSize: 10, color: colors.ink, textAlign: "right" },
  tableAmtGreen: { fontSize: 10, color: colors.green, textAlign: "right" },
  tableAmtTotal: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    color: colors.white,
    textAlign: "right",
  },
  tableDescTotal: {
    flex: 1,
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: colors.white,
  },

  // ── Payment info
  paymentBox: {
    flexDirection: "row",
    backgroundColor: colors.surface,
    borderRadius: 6,
    padding: 12,
    marginTop: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  paymentBlock: { flex: 1 },

  // ── Footer
  footer: {
    position: "absolute",
    bottom: 36,
    left: 48,
    right: 48,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 14,
  },
  footerText: { fontSize: 8, color: colors.subtle },
  footerBrand: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: colors.muted,
  },
});

// ── Helpers ────────────────────────────────────────────────────────────────

function fmtDate(d: Date | string | null | undefined): string {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function formatInvNum(id: string): string {
  return id.replace("inv_", "INV-").toUpperCase();
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

function methodLabel(m?: string): string {
  if (!m) return "—";
  return (
    { upi: "UPI", card: "Card", netbanking: "Net Banking", wallet: "Wallet" }[
      m.toLowerCase()
    ] ?? m
  );
}

// ── Component ──────────────────────────────────────────────────────────────

export interface InvoicePdfProps {
  invoice: Invoice;
  planName: string;
  billingCycle: string;
  customerName: string;
  customerEmail: string;
  paymentMethod?: string;
  transactionId?: string;
  company: CompanySettings;
  logoUrl?: string;
}

export function InvoicePdf({
  invoice: inv,
  planName,
  billingCycle,
  customerName,
  customerEmail,
  paymentMethod,
  transactionId,
  company,
  logoUrl,
}: InvoicePdfProps) {
  const invoiceNum = formatInvNum(inv.id);
  const subtotal = parseFloat(inv.amountDue);
  const discount = parseFloat(inv.discountAmount);
  const tax = parseFloat(inv.taxAmount);
  const total = parseFloat(inv.totalAmount);
  const gstPct = inv.gstPercentage ? parseFloat(inv.gstPercentage) : 0;
  const hasDiscount = discount > 0;
  const hasGst = tax > 0 && gstPct > 0;
  const hasCompanyDetails =
    company.company_gstin || company.company_address || company.company_cin;
  const hasPaymentInfo = paymentMethod || transactionId;

  return (
    <Document
      title={`Invoice ${invoiceNum}`}
      author="Zaprill"
      subject="Payment Receipt"
    >
      <Page size="A4" style={s.page}>
        {/* ── Header ── */}
        <View style={s.header}>
          <View>
            {logoUrl ? (
              <Image src={logoUrl} style={s.logo} />
            ) : (
              <>
                <Text style={s.brandName}>Zaprill</Text>
                <Text style={s.brandTagline}>zaprill.com</Text>
              </>
            )}
          </View>
          <View>
            <Text style={s.invoiceLabel}>Invoice</Text>
            <Text style={s.invoiceNumber}>{invoiceNum}</Text>
            <View style={s.paidBadge}>
              <Text style={s.paidBadgeText}>✓ PAID</Text>
            </View>
          </View>
        </View>

        {/* ── Meta grid ── */}
        <View style={s.metaGrid}>
          <View style={s.metaBlock}>
            <Text style={s.metaLabel}>Billed To</Text>
            <Text style={s.metaValue}>{customerName}</Text>
            <Text style={s.metaMuted}>{customerEmail}</Text>
          </View>
          <View style={s.metaBlock}>
            <Text style={s.metaLabel}>Invoice Date</Text>
            <Text style={s.metaValue}>{fmtDate(inv.createdAt)}</Text>
          </View>
          <View style={s.metaBlockRight}>
            <Text style={s.metaLabel}>Date Paid</Text>
            <Text style={s.metaValue}>{fmtDate(inv.paidAt ?? new Date())}</Text>
            <Text style={{ ...s.metaLabel, marginTop: 10 }}>Billing</Text>
            <Text style={s.metaValue}>
              {billingCycle.charAt(0).toUpperCase() + billingCycle.slice(1)}
            </Text>
          </View>
        </View>

        {/* ── Company details (shown when available) ── */}
        {hasCompanyDetails && (
          <View style={s.companyBox}>
            <Text style={s.companyTitle}>Issued By</Text>
            <Text style={s.companyText}>{company.company_name}</Text>
            {!!company.company_gstin && (
              <Text style={s.companyText}>GSTIN: {company.company_gstin}</Text>
            )}
            {!!company.company_address && (
              <Text style={s.companyText}>{company.company_address}</Text>
            )}
            {!!company.company_cin && (
              <Text style={s.companyText}>CIN: {company.company_cin}</Text>
            )}
            <Text style={s.companyText}>{company.company_email}</Text>
          </View>
        )}

        {/* ── Line items table ── */}
        <View style={s.table}>
          {/* Table header */}
          <View style={s.tableHeader}>
            <View style={s.tableDesc}>
              <Text style={s.tableHeaderText}>Description</Text>
            </View>
            <View style={s.tableAmt}>
              <Text style={s.tableHeaderText}>Amount</Text>
            </View>
          </View>

          {/* Plan row */}
          <View style={s.tableRow}>
            <View style={s.tableDesc}>
              <Text style={s.tableDescMain}>{planName}</Text>
              <Text style={s.tableDescSub}>
                {billingReasonLabel(inv.billingReason)}
              </Text>
            </View>
            <View style={s.tableAmt}>
              <Text style={s.tableAmtText}>
                {formatCurrency(subtotal, inv.currency)}
              </Text>
            </View>
          </View>

          {/* Discount row */}
          {hasDiscount && (
            <View style={s.tableRow}>
              <View style={s.tableDesc}>
                <Text style={{ ...s.tableDescMain, color: colors.green }}>
                  Coupon Discount
                </Text>
              </View>
              <View style={s.tableAmt}>
                <Text style={s.tableAmtGreen}>
                  −{formatCurrency(discount, inv.currency)}
                </Text>
              </View>
            </View>
          )}

          {/* GST row */}
          {hasGst && (
            <View style={s.tableRow}>
              <View style={s.tableDesc}>
                <Text style={s.tableDescMain}>GST ({gstPct}%)</Text>
              </View>
              <View style={s.tableAmt}>
                <Text style={s.tableAmtText}>
                  +{formatCurrency(tax, inv.currency)}
                </Text>
              </View>
            </View>
          )}

          {/* Total row */}
          <View style={s.tableRowTotal}>
            <View style={s.tableDesc}>
              <Text style={s.tableDescTotal}>Total Paid</Text>
            </View>
            <View style={s.tableAmt}>
              <Text style={s.tableAmtTotal}>
                {formatCurrency(total, inv.currency)}
              </Text>
            </View>
          </View>
        </View>

        {/* ── Payment info ── */}
        {hasPaymentInfo && (
          <View style={s.paymentBox}>
            {paymentMethod && (
              <View style={s.paymentBlock}>
                <Text style={s.metaLabel}>Payment Method</Text>
                <Text style={s.metaValue}>{methodLabel(paymentMethod)}</Text>
              </View>
            )}
            {transactionId && (
              <View style={s.paymentBlock}>
                <Text style={s.metaLabel}>Transaction Reference</Text>
                <Text
                  style={{
                    ...s.metaValue,
                    fontFamily: "Helvetica",
                    fontSize: 9,
                  }}
                >
                  {transactionId}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* ── Footer ── */}
        <View style={s.footer} fixed>
          <Text style={s.footerText}>
            Thank you for choosing Zaprill · {company.company_email}
          </Text>
          <Text style={s.footerBrand}>
            © {new Date().getFullYear()} Zaprill
          </Text>
        </View>
      </Page>
    </Document>
  );
}
