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
  const showMatched = job.matchedSkills.slice(0, 5);
  const showMissing = job.missingSkills.slice(0, 4);

  const handleToggleSave = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const previousState = isSavedState;

    // High-priority synchronous update for instant UI feedback
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
        // Revert on failure
        setIsSavedState(previousState);
      }
    } catch (err) {
      console.error("Failed to toggle save:", err);
      setIsSavedState(previousState);
    }
  };

  // ── Impression tracking via Intersection Observer ──────────────────────────
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
      className="animate-slide-up hover:shadow-md transition-all hover:border-primary/30 bg-card rounded-xl overflow-hidden border border-border/60"
      style={{
        animationDelay: `${rank * 50}ms`,
        animationFillMode: "both",
      }}
      id={`job-card-${job.id}`}
    >
      <CardContent className="p-0">
        <div className="flex flex-col lg:flex-row lg:items-stretch min-h-[120px]">
          {/* Main Info Section - Column 1 (Fixed Width on Desktop) */}
          <div className="lg:w-[400px] lg:shrink-0 p-5 lg:p-6 flex items-start gap-4">
            {/* Rank - Subtle */}
            <div className="hidden sm:flex shrink-0 w-8 h-8 rounded-lg items-center justify-center text-xs font-black bg-muted text-muted-foreground border border-border/50">
              {rank + 1}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3
                  className="text-lg font-black text-foreground tracking-tight truncate leading-tight"
                  title={job.title}
                >
                  {job.title}
                </h3>
                {job.isRemote && (
                  <Badge
                    variant="secondary"
                    className="shrink-0 h-5 px-1.5 text-[10px] font-black uppercase tracking-wider bg-primary/10 text-primary border-none"
                  >
                    Remote
                  </Badge>
                )}
              </div>

              <div className="flex flex-col gap-1 text-muted-foreground text-sm font-semibold">
                <div className="flex items-center gap-1.5 text-foreground truncate">
                  <Building2 className="h-3.5 w-3.5 shrink-0 opacity-70" />
                  <span className="truncate">{job.company}</span>
                </div>
                <div className="flex items-center gap-4 text-[13px]">
                  <div className="flex items-center gap-1.5 truncate max-w-[150px]">
                    <MapPin className="h-3.5 w-3.5 shrink-0 opacity-70" />
                    <span className="truncate">{job.location}</span>
                  </div>
                  {postedText && (
                    <div className="flex items-center gap-1.5 shrink-0 opacity-80">
                      <Clock className="h-3.5 w-3.5" />
                      <span>{postedText}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Skills Section - Column 2 (Flexible Middle) */}
          <div className="flex-1 min-w-0 px-5 lg:px-6 py-4 lg:py-0 border-t lg:border-t-0 lg:border-x border-border/40 flex flex-col justify-center bg-muted/5 lg:bg-transparent">
            <div className="space-y-3">
              {showMatched.length > 0 && (
                <div className="flex gap-3 items-center">
                  <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest w-14 shrink-0">
                    Matched
                  </span>
                  <div className="flex flex-wrap gap-1.5 min-w-0">
                    {showMatched.map((s) => (
                      <SkillBadge
                        key={s}
                        skill={s}
                        variant="matched"
                        size="sm"
                      />
                    ))}
                    {job.matchedSkills.length > 5 && (
                      <span className="text-[10px] text-muted-foreground font-bold shrink-0">
                        +{job.matchedSkills.length - 5}
                      </span>
                    )}
                  </div>
                </div>
              )}
              {showMissing.length > 0 && (
                <div className="flex gap-3 items-center">
                  <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest w-14 shrink-0">
                    Missing
                  </span>
                  <div className="flex flex-wrap gap-1.5 min-w-0">
                    {showMissing.map((s) => (
                      <SkillBadge
                        key={s}
                        skill={s}
                        variant="missing"
                        size="sm"
                      />
                    ))}
                    {job.missingSkills.length > 4 && (
                      <span className="text-[10px] text-muted-foreground font-bold shrink-0">
                        +{job.missingSkills.length - 4}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action/Match Section - Column 3 (Fixed Width on Desktop) */}
          <div className="lg:w-[320px] lg:shrink-0 p-5 lg:p-6 flex items-center justify-between lg:justify-end gap-5">
            <div className="flex items-center shrink-0">
              <MatchRing
                percentage={job.matchPercentage}
                size={56}
                strokeWidth={5}
              />
            </div>

            <div className="flex items-center gap-2.5">
              <Button
                variant="outline"
                size="icon"
                onClick={handleToggleSave}
                className={`w-10 h-10 rounded-xl transition-all active:scale-95 border-border/60 shrink-0 ${
                  isSavedState
                    ? "bg-primary/5 text-primary border-primary/20 hover:bg-primary/10 hover:text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                title={isSavedState ? "Remove bookmark" : "Save job"}
              >
                {isSavedState ? (
                  <BookmarkCheck className="h-4 w-4 fill-current" />
                ) : (
                  <Bookmark className="h-4 w-4" />
                )}
              </Button>

              <a
                href={job.url}
                target="_blank"
                rel="noopener noreferrer"
                className={
                  buttonVariants({ variant: "default", size: "default" }) +
                  " font-black px-6 shadow-sm hover:shadow-md transition-all active:scale-95 h-10 rounded-xl flex items-center shrink-0"
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

                  // Track the visit in our database
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
                <ExternalLink className="ml-2 h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
