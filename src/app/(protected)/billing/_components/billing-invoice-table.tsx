"use client";

import {
  ArrowDownToLine,
  Calendar,
  CheckCircle2,
  ChevronRight,
  CreditCard,
  FileText,
  Receipt,
  Tag,
  X,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency } from "@/lib/billing-utils";
import type { Invoice } from "@/types/billing";

// ─────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────

function formatInvoiceNumber(id: string): string {
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

function statusVariant(
  status: string,
): "default" | "secondary" | "destructive" | "outline" {
  if (status === "paid") return "default";
  if (status === "failed" || status === "void") return "destructive";
  return "secondary";
}

function StatusIcon({ status }: { status: string }) {
  if (status === "paid")
    return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
  if (status === "failed" || status === "void")
    return <XCircle className="w-4 h-4 text-destructive" />;
  return null;
}

// ─────────────────────────────────────────────────
// Invoice Detail Modal
// ─────────────────────────────────────────────────

function InvoiceModal({
  invoice,
  open,
  onClose,
}: {
  invoice: Invoice | null;
  open: boolean;
  onClose: () => void;
}) {
  const [downloading, setDownloading] = useState(false);

  if (!invoice) return null;

  const inv = invoice;
  const subtotal = parseFloat(inv.amountDue);
  const discount = parseFloat(inv.discountAmount);
  const tax = parseFloat(inv.taxAmount);
  const total = parseFloat(inv.totalAmount);
  const gstPct = inv.gstPercentage ? parseFloat(inv.gstPercentage) : 0;
  const hasDiscount = discount > 0;
  const hasGst = tax > 0 && gstPct > 0;
  const meta = inv.metadata as Record<string, string>;
  const planName = (meta?.planName as string) || "Subscription";
  const billingCycle = (meta?.billingCycle as string) || "monthly";

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const res = await fetch(`/api/billing/invoices/${inv.id}/pdf`);
      if (!res.ok) throw new Error("Failed to generate PDF");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${formatInvoiceNumber(inv.id)}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download failed:", err);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg w-full p-0 gap-0 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-br from-foreground to-foreground/90 text-background px-6 py-5">
          <DialogHeader>
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Receipt className="w-4 h-4 opacity-70" />
                  <span className="text-xs font-semibold tracking-widest uppercase opacity-70">
                    Invoice
                  </span>
                </div>
                <DialogTitle className="text-xl font-bold text-background">
                  {formatInvoiceNumber(inv.id)}
                </DialogTitle>
              </div>
              <Badge
                variant="outline"
                className={
                  inv.status === "paid"
                    ? "border-emerald-400/40 bg-emerald-500/20 text-emerald-300 text-xs"
                    : "border-red-400/40 bg-red-500/20 text-red-300 text-xs"
                }
              >
                {inv.status === "paid" ? "✓ PAID" : inv.status.toUpperCase()}
              </Badge>
            </div>
          </DialogHeader>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-5">
          {/* Meta info */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                Invoice Date
              </p>
              <p className="flex items-center gap-1.5 text-foreground">
                <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                {new Date(inv.createdAt).toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                {inv.status === "paid" ? "Paid On" : "Due Date"}
              </p>
              <p className="flex items-center gap-1.5 text-foreground">
                <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                {inv.paidAt
                  ? new Date(inv.paidAt).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })
                  : inv.dueDate
                    ? new Date(inv.dueDate).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      })
                    : "—"}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                Type
              </p>
              <p className="flex items-center gap-1.5 text-foreground">
                <FileText className="w-3.5 h-3.5 text-muted-foreground" />
                {billingReasonLabel(inv.billingReason)}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                Plan
              </p>
              <p className="flex items-center gap-1.5 text-foreground">
                <CreditCard className="w-3.5 h-3.5 text-muted-foreground" />
                {planName}{" "}
                <span className="text-muted-foreground text-xs capitalize">
                  ({billingCycle})
                </span>
              </p>
            </div>
          </div>

          {/* Line items */}
          <div className="rounded-lg border overflow-hidden">
            <div className="bg-muted/40 px-4 py-2.5 flex justify-between text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              <span>Description</span>
              <span>Amount</span>
            </div>

            {/* Subtotal */}
            <div className="px-4 py-3 flex justify-between items-start border-t text-sm">
              <div>
                <p className="font-medium text-foreground">{planName}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {billingReasonLabel(inv.billingReason)} ·{" "}
                  {billingCycle.charAt(0).toUpperCase() + billingCycle.slice(1)}{" "}
                  plan
                </p>
              </div>
              <span className="font-medium text-foreground tabular-nums">
                {formatCurrency(subtotal, inv.currency)}
              </span>
            </div>

            {/* Discount */}
            {hasDiscount && (
              <div className="px-4 py-3 flex justify-between items-center border-t text-sm">
                <div className="flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-emerald-600 font-medium">
                    Coupon Discount
                  </span>
                </div>
                <span className="text-emerald-600 font-medium tabular-nums">
                  −{formatCurrency(discount, inv.currency)}
                </span>
              </div>
            )}

            {/* GST */}
            {hasGst && (
              <div className="px-4 py-3 flex justify-between items-center border-t text-sm">
                <span className="text-muted-foreground">GST ({gstPct}%)</span>
                <span className="text-muted-foreground tabular-nums">
                  +{formatCurrency(tax, inv.currency)}
                </span>
              </div>
            )}

            {/* Total */}
            <div className="px-4 py-3.5 flex justify-between items-center border-t bg-foreground text-background">
              <span className="font-bold text-sm">Total Paid</span>
              <span className="font-bold text-base tabular-nums">
                {formatCurrency(total, inv.currency)}
              </span>
            </div>
          </div>

          {/* Invoice ID reference */}
          <p className="text-xs text-muted-foreground text-center">
            Invoice ID:{" "}
            <span className="font-mono text-foreground">{inv.id}</span>
          </p>
        </div>

        {/* Footer actions */}
        <div className="px-6 pb-5 flex gap-3">
          <Button
            className="flex-1"
            onClick={handleDownload}
            disabled={downloading}
          >
            <ArrowDownToLine className="w-4 h-4 mr-2" />
            {downloading ? "Generating PDF…" : "Download Invoice PDF"}
          </Button>
          <Button variant="outline" size="icon" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─────────────────────────────────────────────────
// Main Table Component
// ─────────────────────────────────────────────────

export function BillingInvoiceTable({ invoices }: { invoices: Invoice[] }) {
  const [selected, setSelected] = useState<Invoice | null>(null);

  if (invoices.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Receipt className="w-10 h-10 text-muted-foreground/40 mb-3" />
        <p className="text-sm text-muted-foreground font-medium">
          No invoices yet
        </p>
        <p className="text-xs text-muted-foreground/70 mt-1">
          Your invoices will appear here after your first payment.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="text-right" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices.map((inv) => (
              <TableRow
                key={inv.id}
                className="cursor-pointer hover:bg-muted/40 transition-colors"
                onClick={() => setSelected(inv)}
              >
                <TableCell className="font-mono text-xs font-medium">
                  {formatInvoiceNumber(inv.id)}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {new Date(inv.createdAt).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </TableCell>
                <TableCell className="font-semibold tabular-nums">
                  {formatCurrency(inv.totalAmount, inv.currency)}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1.5">
                    <StatusIcon status={inv.status} />
                    <Badge variant={statusVariant(inv.status)}>
                      {inv.status}
                    </Badge>
                  </div>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground capitalize">
                  {billingReasonLabel(inv.billingReason)}
                </TableCell>
                <TableCell className="text-right">
                  <ChevronRight className="w-4 h-4 text-muted-foreground ml-auto" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <InvoiceModal
        invoice={selected}
        open={!!selected}
        onClose={() => setSelected(null)}
      />
    </>
  );
}
