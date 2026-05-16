"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import type { Plan } from "../_types";
import { PlansContent } from "./_components/plans-content";

export default function PlansPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
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
    } catch (e: any) {
      console.error("[FETCH_PLANS]", e);
      toast.error(e.message || "Failed to load plans");
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
        <h1 className="font-bold text-3xl tracking-tight">Plans</h1>
        <p className="text-muted-foreground">
          Manage subscription plans and pricing.
        </p>
      </div>

      <PlansContent
        plans={plans}
        loading={loading}
        onMutate={mutate}
        onRefresh={fetchData}
      />
    </div>
  );
}
