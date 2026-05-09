"use client";

import {
  ArrowDownToLine,
  Calendar,
  CheckCircle2,
  FileText,
  Loader2,
  RefreshCcw,
  XCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatCurrency } from "@/lib/billing-utils";
import type { Invoice } from "@/types/billing";

export default function PaymentStatusPage({
  searchParams,
}: {
  searchParams: Promise<{ orderId?: string }>;
}) {
  const params = use(searchParams);
  const orderId = params.orderId;
  const router = useRouter();

  const [status, setStatus] = useState<
    "loading" | "paid" | "failed" | "pending" | "void"
  >("loading");
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (!orderId) {
      router.push("/billing");
      return;
    }

    const checkStatus = async () => {
      try {
        const res = await fetch(
          `/api/billing/payment-status?orderId=${orderId}`,
        );
        const data = await res.json();

        if (!res.ok) {
          setStatus("failed");
          return;
        }

        setStatus(data.status);
        if (data.invoice) setInvoice(data.invoice);

        // If it's still pending, Cashfree webhook might be delayed. Poll a few times.
        if (data.status === "pending" && retryCount < 10) {
          setTimeout(() => setRetryCount((c) => c + 1), 2000);
        }
      } catch (err) {
        setStatus("failed");
      }
    };

    checkStatus();
  }, [orderId, retryCount, router]);

  const handleDownload = async () => {
    if (!orderId) return;
    setDownloading(true);
    try {
      const res = await fetch(`/api/billing/invoices/${orderId}/pdf`);
      if (!res.ok) throw new Error("Failed to generate PDF");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const filename = orderId.replace("inv_", "INV-").toUpperCase();
      a.download = `${filename}.pdf`;
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

  const handleRetryPayment = async () => {
    try {
      setStatus("loading");
      const res = await fetch("/api/billing/retry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invoiceId: orderId }),
      });
      const data = await res.json();

      if (!res.ok) {
        setStatus("failed");
        return;
      }

      if ((window as any).Cashfree) {
        const cf = (window as any).Cashfree({
          mode:
            process.env.NEXT_PUBLIC_CASHFREE_ENVIRONMENT === "PRODUCTION"
              ? "production"
              : "sandbox",
        });
        cf.checkout({ paymentSessionId: data.paymentSessionId });
      } else {
        const script = document.createElement("script");
        script.src = "https://sdk.cashfree.com/js/v3/cashfree.js";
        document.body.appendChild(script);
        script.onload = () => {
          const cf = (window as any).Cashfree({
            mode:
              process.env.NEXT_PUBLIC_CASHFREE_ENVIRONMENT === "PRODUCTION"
                ? "production"
                : "sandbox",
          });
          cf.checkout({ paymentSessionId: data.paymentSessionId });
        };
      }
    } catch {
      setStatus("failed");
    }
  };

  const meta = invoice?.metadata as Record<string, string>;
  const planName = meta?.planName || "Subscription";

  return (
    <div className="container max-w-lg mx-auto py-12 md:py-20 px-4">
      <Card className="shadow-xl border-muted/60 overflow-hidden">
        {/* Status Header */}
        <div
          className={`h-2 w-full ${
            status === "paid"
              ? "bg-emerald-500"
              : status === "failed" || status === "void"
                ? "bg-destructive"
                : "bg-primary animate-pulse"
          }`}
        />

        <CardHeader className="text-center pt-10 pb-6">
          <div
            className={`mx-auto w-20 h-20 rounded-full flex items-center justify-center mb-5 ${
              status === "paid"
                ? "bg-emerald-50"
                : status === "failed" || status === "void"
                  ? "bg-red-50"
                  : "bg-muted/50"
            }`}
          >
            {status === "loading" || status === "pending" ? (
              <Loader2 className="w-10 h-10 text-primary animate-spin" />
            ) : status === "paid" ? (
              <CheckCircle2 className="w-10 h-10 text-emerald-500" />
            ) : (
              <XCircle className="w-10 h-10 text-destructive" />
            )}
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">
            {status === "loading" && "Verifying Payment..."}
            {status === "pending" && "Payment Processing"}
            {status === "paid" && "Payment Successful"}
            {(status === "failed" || status === "void") && "Payment Failed"}
          </CardTitle>
          <CardDescription className="text-base max-w-xs mx-auto mt-2">
            {status === "loading" &&
              "Please wait while we confirm your transaction with the bank."}
            {status === "pending" &&
              "We've received your request. Confirmation usually takes a few seconds."}
            {status === "paid" &&
              "Success! Your plan is now active and your receipt is ready."}
            {(status === "failed" || status === "void") &&
              "We couldn't process your payment. Please check your bank details."}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Summary Section (Only on success/pending) */}
          {(status === "paid" || status === "pending") && invoice && (
            <div className="rounded-xl border bg-muted/20 overflow-hidden">
              <div className="bg-muted/40 px-5 py-3 border-bottom flex justify-between items-center">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Order Summary
                </span>
                <span className="text-xs font-mono text-muted-foreground">
                  {orderId?.replace("inv_", "INV-").toUpperCase()}
                </span>
              </div>
              <div className="p-5 space-y-4">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <p className="font-bold text-foreground">{planName}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(invoice.createdAt).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <span className="font-bold text-lg tabular-nums text-foreground">
                    {formatCurrency(invoice.totalAmount, invoice.currency)}
                  </span>
                </div>

                {status === "paid" && (
                  <div className="pt-3 border-t border-muted-foreground/10 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-emerald-600">
                      <CheckCircle2 className="w-4 h-4" />
                      <span className="text-sm font-medium">Fully Paid</span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      Ref: {invoice.cashfreeOrderId || "—"}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Simple ID for other states */}
          {(status === "failed" ||
            status === "void" ||
            status === "loading") && (
            <div className="flex flex-col items-center gap-2 py-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
                Transaction Reference
              </p>
              <code className="text-sm px-3 py-1 bg-muted rounded-md border font-mono">
                {orderId}
              </code>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex-col gap-3 pb-10 px-6">
          {status === "paid" && (
            <>
              <Button
                className="w-full h-11 text-base shadow-sm"
                onClick={() => router.push("/")}
              >
                Go to Dashboard
              </Button>
              <Button
                variant="outline"
                className="w-full h-11"
                onClick={handleDownload}
                disabled={downloading}
              >
                {downloading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <ArrowDownToLine className="w-4 h-4 mr-2" />
                )}
                {downloading ? "Preparing PDF..." : "Download Invoice PDF"}
              </Button>
            </>
          )}

          {(status === "failed" || status === "void") && (
            <div className="flex flex-col md:flex-row gap-3 w-full">
              <Button
                variant="outline"
                className="flex-1 h-11"
                onClick={() => router.push("/billing")}
              >
                Back to Billing
              </Button>
              <Button className="flex-1 h-11" onClick={handleRetryPayment}>
                <RefreshCcw className="w-4 h-4 mr-2" />
                Retry Payment
              </Button>
            </div>
          )}

          {(status === "loading" || status === "pending") && (
            <Button variant="secondary" className="w-full h-11" disabled>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Waiting for Confirmation...
            </Button>
          )}

          <p className="text-[10px] text-muted-foreground text-center mt-2 px-4">
            A copy of this receipt has been sent to your registered email
            address. For billing support, please contact help@zaprill.com
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
