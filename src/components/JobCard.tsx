"use client";

import {
  Bookmark,
  BookmarkCheck,
  Building2,
  Clock,
  ExternalLink,
  MapPin,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { trackJobApplied, trackJobCardImpression } from "@/lib/analytics";
import { ensureHttps } from "@/lib/utils";
import type { JobMatch } from "@/types";
import MatchRing from "./MatchRing";
import SkillBadge from "./SkillBadge";

interface JobCardProps {
  job: JobMatch;
  rank: number;
  analysisId?: string;
}

function timeAgo(dateStr?: string): string {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "1 day ago";
  if (days < 30) return `${days} days ago`;
  if (days < 60) return "1 month ago";
  return `${Math.floor(days / 30)} months ago`;
}

export default function JobCard({ job, rank, analysisId }: JobCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const impressionFired = useRef(false);

  const [isSavedState, setIsSavedState] = useState(false);

  const postedText = timeAgo(job.postedAt);
  const showMatched = job.matchedSkills.slice(0, 8); // Increased from 5
  const showMissing = job.missingSkills.slice(0, 6); // Increased from 4

  const handleToggleSave = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const previousState = isSavedState;
    setIsSavedState(!previousState);

    const method = previousState ? "DELETE" : "POST";

    try {
      const res = await fetch("/api/save-job", {
        method,
        body: JSON.stringify({
          jobId: job.id,
          title: job.title,
          company: job.company,
          location: job.location,
          url: job.url,
          matchPercentage: job.matchPercentage,
          analysisId,
          jobRaw: job,
        }),
      });

      if (!res.ok) {
        setIsSavedState(previousState);
      }
    } catch (err) {
      console.error("Failed to toggle save:", err);
      setIsSavedState(previousState);
    }
  };

  useEffect(() => {
    const node = cardRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && !impressionFired.current) {
            impressionFired.current = true;
            trackJobCardImpression({
              job_id: job.id,
              job_title: job.title,
              company_name: job.company,
              match_score: job.matchPercentage,
              is_remote: Boolean(job.isRemote),
              job_rank: rank,
            });
            observer.disconnect();
          }
        }
      },
      { threshold: 0.5 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [job.id, job.title, job.company, job.matchPercentage, job.isRemote, rank]);

  return (
    <Card
      ref={cardRef}
      className="group animate-slide-up overflow-hidden rounded-2xl border border-border/50 bg-card transition-all duration-300 hover:border-primary/40 hover:shadow-xl"
      style={{
        animationDelay: `${rank * 50}ms`,
        animationFillMode: "both",
      }}
      id={`job-card-${job.id}`}
    >
      <CardContent className="p-0">
        <div className="flex min-h-[140px] flex-col lg:flex-row lg:items-center">
          {/* Main Info Section - Column 1 */}
          <div className="flex items-start gap-4 p-6 lg:w-[380px] lg:shrink-0">
            <div className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border/50 bg-muted font-black text-muted-foreground text-xs transition-colors group-hover:border-primary/20 group-hover:bg-primary/5 group-hover:text-primary sm:flex">
              {rank + 1}
            </div>

            <div className="min-w-0 flex-1">
              <div className="mb-2 flex items-center gap-2">
                <h3
                  className="truncate font-black text-foreground text-xl leading-tight tracking-tight transition-colors group-hover:text-primary"
                  title={job.title}
                >
                  {job.title}
                </h3>
              </div>

              <div className="flex flex-col gap-2 font-semibold text-muted-foreground text-sm">
                <div className="flex items-center gap-2 text-foreground/90">
                  <Building2 className="h-4 w-4 shrink-0 opacity-60" />
                  <span className="truncate">{job.company}</span>
                </div>
                <div className="flex flex-wrap items-center gap-4 text-[13px]">
                  <div className="flex items-center gap-1.5 truncate">
                    <MapPin className="h-4 w-4 shrink-0 opacity-60" />
                    <span className="truncate">{job.location}</span>
                  </div>
                  {postedText && (
                    <div className="flex shrink-0 items-center gap-1.5 rounded bg-muted/50 px-2 py-0.5 font-bold text-[11px] uppercase tracking-wider">
                      <Clock className="h-3.5 w-3.5" />
                      <span>{postedText}</span>
                    </div>
                  )}
                  {job.isRemote && (
                    <Badge
                      variant="secondary"
                      className="h-6 shrink-0 border-emerald-500/20 bg-emerald-500/10 px-2 font-black text-[10px] text-emerald-600 uppercase tracking-wider"
                    >
                      Remote
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Skills Section - Column 2 (Flexible Middle) */}
          <div className="flex min-w-0 flex-1 flex-col justify-center self-stretch border-border/40 border-t bg-muted/5 px-8 py-6 lg:border-x lg:border-t-0 lg:bg-transparent lg:py-0">
            <div className="space-y-4">
              {showMatched.length > 0 && (
                <div className="flex items-center gap-4">
                  <span className="w-16 shrink-0 font-black text-[10px] text-muted-foreground uppercase tracking-[0.2em] opacity-60">
                    Matched
                  </span>
                  <div className="flex min-w-0 flex-wrap gap-1.5">
                    {showMatched.map((s) => (
                      <SkillBadge
                        key={s}
                        skill={s}
                        variant="matched"
                        size="sm"
                      />
                    ))}
                    {job.matchedSkills.length > showMatched.length && (
                      <span className="shrink-0 rounded-md bg-muted/50 px-2 py-1 font-black text-[10px] text-muted-foreground">
                        +{job.matchedSkills.length - showMatched.length}
                      </span>
                    )}
                  </div>
                </div>
              )}
              {showMissing.length > 0 && (
                <div className="flex items-center gap-4">
                  <span className="w-16 shrink-0 font-black text-[10px] text-muted-foreground uppercase tracking-[0.2em] opacity-60">
                    Missing
                  </span>
                  <div className="flex min-w-0 flex-wrap gap-1.5">
                    {showMissing.map((s) => (
                      <SkillBadge
                        key={s}
                        skill={s}
                        variant="missing"
                        size="sm"
                      />
                    ))}
                    {job.missingSkills.length > showMissing.length && (
                      <span className="shrink-0 rounded-md bg-muted/50 px-2 py-1 font-black text-[10px] text-muted-foreground">
                        +{job.missingSkills.length - showMissing.length}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action/Match Section - Column 3 */}
          <div className="flex items-center justify-between gap-6 p-6 lg:w-[320px] lg:shrink-0 lg:justify-end">
            <div className="flex flex-col items-center gap-1">
              <MatchRing
                percentage={job.matchPercentage}
                size={60}
                strokeWidth={5}
              />
            </div>

            <div className="flex items-center gap-2.5">
              <Button
                variant="outline"
                size="icon"
                onClick={handleToggleSave}
                className={`h-12 w-12 shrink-0 rounded-2xl border-border/60 transition-all active:scale-90 ${
                  isSavedState
                    ? "border-primary/20 bg-primary/5 text-primary hover:bg-primary/10 hover:text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
                title={isSavedState ? "Remove bookmark" : "Save job"}
              >
                {isSavedState ? (
                  <BookmarkCheck className="h-5 w-5 fill-current" />
                ) : (
                  <Bookmark className="h-5 w-5" />
                )}
              </Button>

              <a
                href={ensureHttps(job.url)}
                target="_blank"
                rel="noopener noreferrer"
                className={
                  buttonVariants({ variant: "default", size: "lg" }) +
                  "group/apply flex h-12 shrink-0 items-center rounded-2xl px-8 font-black text-base shadow-primary/10 shadow-xl transition-all hover:shadow-primary/20 active:scale-95"
                }
                id={`apply-btn-${job.id}`}
                onClick={() => {
                  trackJobApplied({
                    job_id: job.id,
                    job_title: job.title,
                    company_name: job.company,
                    match_score: job.matchPercentage,
                    is_remote: Boolean(job.isRemote),
                    job_rank: rank,
                  });

                  fetch("/api/track-visit", {
                    method: "POST",
                    body: JSON.stringify({
                      jobId: job.id,
                      title: job.title,
                      company: job.company,
                      location: job.location,
                      url: job.url,
                      matchPercentage: job.matchPercentage,
                      analysisId,
                    }),
                  }).catch((err) =>
                    console.error("Failed to track job visit:", err),
                  );
                }}
              >
                Apply
                <ExternalLink className="group-hover/apply:-translate-y-0.5 ml-2.5 h-4 w-4 transition-transform group-hover/apply:translate-x-0.5" />
              </a>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
