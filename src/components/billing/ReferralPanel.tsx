"use client";

import {
  Check,
  Copy,
  ExternalLink,
  Gift,
  Loader2,
  Share2,
  TrendingUp,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface ReferralData {
  referralCode: string | null;
  referralLink: string | null;
  totalReferrals: number;
  converted: number;
  pending: number;
  expired: number;
  totalRewards: number;
}

export function ReferralPanel() {
  const [data, setData] = useState<ReferralData | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchReferralData();
  }, []);

  async function fetchReferralData() {
    try {
      const res = await fetch("/api/referrals");
      if (res.ok) setData(await res.json());
    } finally {
      setLoading(false);
    }
  }

  async function generateCode() {
    setGenerating(true);
    try {
      const res = await fetch("/api/referrals", { method: "POST" });
      if (res.ok) {
        const body = await res.json();
        setData((prev) =>
          prev
            ? {
                ...prev,
                referralCode: body.referralCode,
                referralLink: body.referralLink,
              }
            : null,
        );
      }
    } finally {
      setGenerating(false);
    }
  }

  async function copyLink() {
    if (!data?.referralLink) return;
    await navigator.clipboard.writeText(data.referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function shareLink() {
    if (!data?.referralLink) return;
    if (navigator.share) {
      void navigator.share({
        title: "Join Zaprill",
        text: "I've been using Zaprill to turbocharge my job search. Use my link for a discount!",
        url: data.referralLink,
      });
    } else {
      void copyLink();
    }
  }

  const conversionRate =
    data && data.totalReferrals > 0
      ? Math.round((data.converted / data.totalReferrals) * 100)
      : 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Gift size={16} className="text-primary" />
          </div>
          <div>
            <CardTitle>Refer &amp; Earn</CardTitle>
            <CardDescription>
              Share your link — earn discount coupons when friends subscribe
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 size={24} className="animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            {/* Referral link box */}
            {data?.referralLink ? (
              <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-3">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Your Referral Link
                </p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-sm font-mono bg-background border border-border rounded-md px-3 py-2 truncate">
                    {data.referralLink}
                  </code>
                  <Button
                    id="referral-copy-btn"
                    variant="outline"
                    size="sm"
                    onClick={copyLink}
                    className="shrink-0"
                  >
                    {copied ? (
                      <Check size={14} className="text-green-500" />
                    ) : (
                      <Copy size={14} />
                    )}
                    <span className="ml-1.5 hidden sm:inline">
                      {copied ? "Copied!" : "Copy"}
                    </span>
                  </Button>
                  <Button
                    id="referral-share-btn"
                    variant="outline"
                    size="sm"
                    onClick={shareLink}
                    className="shrink-0"
                  >
                    <Share2 size={14} />
                    <span className="ml-1.5 hidden sm:inline">Share</span>
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Code:{" "}
                  <Badge variant="secondary" className="font-mono text-xs">
                    {data.referralCode}
                  </Badge>
                </p>
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-border bg-muted/20 p-6 text-center space-y-3">
                <p className="text-sm text-muted-foreground">
                  You don&apos;t have a referral code yet. Generate one to start
                  earning rewards.
                </p>
                <Button
                  id="referral-generate-btn"
                  onClick={generateCode}
                  disabled={generating}
                >
                  {generating ? (
                    <Loader2 size={14} className="mr-2 animate-spin" />
                  ) : (
                    <Gift size={14} className="mr-2" />
                  )}
                  Generate My Referral Link
                </Button>
              </div>
            )}

            {/* Stats grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="rounded-lg border border-border bg-muted/20 p-3 text-center">
                <Users
                  size={16}
                  className="mx-auto mb-1 text-muted-foreground"
                />
                <div className="text-2xl font-bold">
                  {data?.totalReferrals ?? 0}
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  Total Referrals
                </div>
              </div>
              <div className="rounded-lg border border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-950/20 p-3 text-center">
                <TrendingUp
                  size={16}
                  className="mx-auto mb-1 text-green-600 dark:text-green-400"
                />
                <div className="text-2xl font-bold text-green-700 dark:text-green-300">
                  {data?.converted ?? 0}
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  Converted
                </div>
              </div>
              <div className="rounded-lg border border-border bg-muted/20 p-3 text-center">
                <Gift
                  size={16}
                  className="mx-auto mb-1 text-muted-foreground"
                />
                <div className="text-2xl font-bold">
                  {data?.totalRewards ?? 0}
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  Rewards Earned
                </div>
              </div>
              <div className="rounded-lg border border-border bg-muted/20 p-3 text-center">
                <ExternalLink
                  size={16}
                  className="mx-auto mb-1 text-muted-foreground"
                />
                <div className="text-2xl font-bold">
                  {data?.totalReferrals ? `${conversionRate}%` : "—"}
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  Conversion Rate
                </div>
              </div>
            </div>

            {/* How it works */}
            <div className="rounded-lg border border-border bg-muted/10 p-4">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">
                How it works
              </p>
              <ol className="space-y-2">
                {[
                  "Share your referral link with friends",
                  "They sign up using your link",
                  "When they subscribe, you both earn a discount coupon",
                  "Apply your coupon automatically at your next renewal",
                ].map((step, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-3 text-sm text-muted-foreground"
                  >
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
                      {i + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ol>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
