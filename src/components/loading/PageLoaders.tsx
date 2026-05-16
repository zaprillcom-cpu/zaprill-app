"use client";

import { Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export function DashboardSkeleton() {
  return (
    <div className="w-full max-w-6xl mx-auto px-6 py-12 space-y-12">
      {/* Header Skeleton */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-4">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-12 w-64 md:w-96" />
          <Skeleton className="h-6 w-48 md:w-80" />
        </div>
        <Skeleton className="h-12 w-48 rounded-xl" />
      </div>

      {/* Metrics Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-48 rounded-2xl border border-border/50 p-6 space-y-4"
          >
            <div className="flex justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-8" />
            </div>
            <div className="flex gap-4">
              <Skeleton className="h-12 w-12 rounded-xl" />
              <div className="space-y-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
            <Skeleton className="h-2 w-full mt-4" />
          </div>
        ))}
      </div>

      {/* Jobs Skeleton */}
      <div className="space-y-6">
        <div className="flex justify-between items-center px-2">
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-48" />
          </div>
          <Skeleton className="h-8 w-32" />
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-[140px] rounded-2xl border border-border/50 p-6 flex gap-6 items-center"
            >
              <Skeleton className="h-10 w-10 rounded-xl shrink-0" />
              <div className="flex-1 space-y-3">
                <Skeleton className="h-6 w-1/3" />
                <Skeleton className="h-4 w-1/4" />
              </div>
              <Skeleton className="h-16 w-16 rounded-full shrink-0" />
              <Skeleton className="h-12 w-32 rounded-2xl shrink-0" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function AnalyzeSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-10 w-full space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row gap-8 items-start border-b border-border pb-10">
        <Skeleton className="h-32 w-32 rounded-3xl shrink-0" />
        <div className="flex-1 space-y-4 w-full">
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <Skeleton className="h-10 w-64" />
              <Skeleton className="h-5 w-48" />
            </div>
            <Skeleton className="h-10 w-32 rounded-xl" />
          </div>
          <div className="flex gap-3">
            <Skeleton className="h-6 w-24 rounded-full" />
            <Skeleton className="h-6 w-24 rounded-full" />
            <Skeleton className="h-6 w-24 rounded-full" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Skeleton className="h-12 w-full rounded-full" />

      {/* Content */}
      <div className="space-y-6">
        <div className="flex justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-8 w-32" />
        </div>
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-[140px] rounded-2xl border border-border/50 p-6 flex gap-6 items-center"
          >
            <Skeleton className="h-10 w-10 rounded-xl shrink-0" />
            <div className="flex-1 space-y-3">
              <Skeleton className="h-6 w-1/3" />
              <Skeleton className="h-4 w-1/4" />
            </div>
            <Skeleton className="h-16 w-16 rounded-full shrink-0" />
            <Skeleton className="h-12 w-32 rounded-2xl shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
}
