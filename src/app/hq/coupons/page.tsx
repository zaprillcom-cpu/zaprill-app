"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import type { Coupon } from "../_types";
import { CouponsContent } from "./_components/coupons-content";

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
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
      setCoupons(json.coupons ?? []);
    } catch (e: any) {
      console.error("[FETCH_COUPONS]", e);
      toast.error(e.message || "Failed to load coupons");
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
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Coupons</h1>
        <p className="text-muted-foreground">
          Manage discount codes and promotions.
        </p>
      </div>

      <CouponsContent
        coupons={coupons}
        loading={loading}
        onMutate={mutate}
        onRefresh={fetchData}
      />
    </div>
  );
}
