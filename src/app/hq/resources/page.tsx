"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import type { LearningResource } from "../_types";
import { ResourcesContent } from "./_components/resources-content";

export default function ResourcesPage() {
  const [resources, setResources] = useState<LearningResource[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const resResources = await fetch("/api/admin/resources");
      if (resResources.ok) {
        const jsonResources = await resResources.json();
        setResources(jsonResources.resources ?? []);
      } else {
        throw new Error(`Error ${resResources.status}`);
      }
    } catch (e: any) {
      console.error("[FETCH_RESOURCES]", e);
      toast.error(e.message || "Failed to load resources");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const mutate = useCallback(
    async (action: string, data: Record<string, any>) => {
      const res = await fetch("/api/admin/resources", {
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
        <h1 className="font-bold text-3xl tracking-tight">Resources</h1>
        <p className="text-muted-foreground">
          Manage predefined learning resources and affiliate links.
        </p>
      </div>

      <ResourcesContent
        resources={resources}
        loading={loading}
        onMutate={mutate}
        onRefresh={fetchData}
      />
    </div>
  );
}
