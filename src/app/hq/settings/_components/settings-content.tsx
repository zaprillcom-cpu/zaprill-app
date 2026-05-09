"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { CompanySettings } from "@/lib/app-settings";
import { AuthConfigTab } from "./auth-config-tab";
import { CompanyTab } from "./company-tab";
import { CouponsTab } from "./coupons-tab";
import { PlansTab } from "./plans-tab";

export type Plan = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  amount: string;
  originalAmount: string | null;
  currency: string;
  billingCycle: "monthly" | "quarterly" | "yearly";
  category: string;
  features: any[]; // { text: string, info: string | null }[]
  isActive: boolean;
  sortOrder: number;
  isGstEnabled: boolean;
  gstPercentage: string;
  createdAt: string;
  updatedAt: string;
};

export type Coupon = {
  id: string;
  code: string;
  type: "percentage" | "flat";
  value: string;
  maxDiscount: string | null;
  minOrderValue: string;
  startTime: string | null;
  endTime: string | null;
  usageLimitGlobal: number | null;
  usageLimitPerUser: number;
  newUserOnly: boolean;
  isPublic: boolean;
  status: "active" | "expired" | "disabled";
  createdAt: string;
};

export function SettingsContent() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [companySettings, setCompanySettings] =
    useState<CompanySettings | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/settings");
      if (!res.ok) {
        const errorText = await res.text();
        try {
          const errorJson = JSON.parse(errorText);
          throw new Error(errorJson.error || `Error ${res.status}`);
        } catch {
          throw new Error(errorText || `Error ${res.status}`);
        }
      }
      const json = await res.json();
      setPlans(json.plans ?? []);
      setCoupons(json.coupons ?? []);
      setCompanySettings(json.companySettings ?? null);
    } catch (e: any) {
      console.error("[FETCH_DATA]", e);
      toast.error(e.message || "Failed to load settings");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const mutate = useCallback(
    async (action: string, data: Record<string, any>) => {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ _action: action, ...data }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        try {
          const errorJson = JSON.parse(errorText);
          throw new Error(errorJson.error || `Error ${res.status}`);
        } catch {
          throw new Error(errorText || `Error ${res.status}`);
        }
      }

      return res.json();
    },
    [],
  );

  return (
    <Tabs defaultValue="plans" className="w-full">
      <TabsList className="mb-6 grid w-full max-w-lg grid-cols-4">
        <TabsTrigger value="plans">Plans</TabsTrigger>
        <TabsTrigger value="coupons">Coupons</TabsTrigger>
        <TabsTrigger value="company">Company</TabsTrigger>
        <TabsTrigger value="auth">Auth Config</TabsTrigger>
      </TabsList>

      <TabsContent value="plans">
        <PlansTab
          plans={plans}
          loading={loading}
          onMutate={mutate}
          onRefresh={fetchData}
        />
      </TabsContent>

      <TabsContent value="coupons">
        <CouponsTab
          coupons={coupons}
          loading={loading}
          onMutate={mutate}
          onRefresh={fetchData}
        />
      </TabsContent>

      <TabsContent value="company">
        <CompanyTab
          initialSettings={companySettings!}
          onMutate={async (action, data) => {
            const res = await mutate(action, data);
            setCompanySettings(res.companySettings);
            return res;
          }}
        />
      </TabsContent>

      <TabsContent value="auth">
        <AuthConfigTab />
      </TabsContent>
    </Tabs>
  );
}
