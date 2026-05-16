"use client";

import { Building2, Lock, MapPin, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { JobMatch } from "@/types";
import MatchRing from "./MatchRing";

interface LockedJobCardProps {
  job: JobMatch;
  rank: number;
}

export default function LockedJobCard({ job, rank }: LockedJobCardProps) {
  const router = useRouter();

  return (
    <Card
      className="relative overflow-hidden rounded-xl border border-border/60 bg-card"
      style={{
        animationDelay: `${rank * 50}ms`,
        animationFillMode: "both",
      }}
      id={`job-card-locked-${job.id}`}
    >
      <CardContent className="p-0">
        <div className="flex flex-col lg:flex-row lg:items-center">
          {/* ── Readable Header: title + company (NOT blurred) ── */}
          <div className="flex flex-1 items-start gap-5 p-6 lg:p-8">
            <div className="hidden h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border/50 bg-muted font-black text-muted-foreground text-xs sm:flex">
              {rank + 1}
            </div>
            <div className="min-w-0 flex-1">
              <div className="mb-1.5 flex flex-wrap items-center gap-2">
                <h3 className="truncate font-black text-foreground text-xl leading-tight tracking-tight">
                  {job.title}
                </h3>
                {job.isRemote && (
                  <Badge
                    variant="secondary"
                    className="h-5 border-none bg-primary/10 px-1.5 font-black text-[10px] text-primary uppercase tracking-wider"
                  >
                    Remote
                  </Badge>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 font-semibold text-muted-foreground text-sm">
                <div className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 opacity-70" />
                  <span className="max-w-[150px] truncate">{job.location}</span>
                </div>
              </div>
            </div>
          </div>

          {/* ── Blurred skills section ── */}
          <div
            className="flex-1 select-none border-border/40 border-t px-6 py-4 lg:border-x lg:border-t-0 lg:px-4"
            aria-hidden="true"
          >
            <div
              className="pointer-events-none space-y-3 py-1 opacity-60 blur-sm"
              style={{ userSelect: "none" }}
            >
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="w-16 font-black text-[10px] text-muted-foreground uppercase tracking-widest">
                  Matched
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {["React", "TypeScript", "Node.js"].map((s) => (
                    <span
                      key={s}
                      className="inline-flex rounded-md bg-green-100 px-2 py-0.5 font-bold text-green-700 text-xs dark:bg-green-900/30 dark:text-green-400"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="w-16 font-black text-[10px] text-muted-foreground uppercase tracking-widest">
                  Missing
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {["AWS", "Docker"].map((s) => (
                    <span
                      key={s}
                      className="inline-flex rounded-md bg-red-100 px-2 py-0.5 font-bold text-red-700 text-xs dark:bg-red-900/30 dark:text-red-400"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ── Lock CTA section ── */}
          <div className="flex items-center justify-between gap-6 border-border/40 border-t bg-muted/20 p-6 lg:justify-end lg:border-t-0 lg:bg-transparent lg:p-8">
            <div className="flex items-center gap-4 lg:flex-row-reverse">
              <MatchRing
                percentage={job.matchPercentage}
                size={52}
                strokeWidth={5}
              />
            </div>

            <Button
              variant="default"
              size="lg"
              className="gap-2 bg-primary/90 px-5 font-bold shadow-sm hover:bg-primary"
              onClick={() => router.push("/billing")}
            >
              <Lock className="h-4 w-4" />
              Unlock
            </Button>
          </div>
        </div>
      </CardContent>

      {/* ── Subtle lock badge top-right ── */}
      <div className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-primary px-2 py-1 font-black text-[10px] text-primary-foreground uppercase tracking-wider shadow-sm">
        <Sparkles className="h-3 w-3" />
        Pro
      </div>
    </Card>
  );
}
