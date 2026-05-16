"use client";

import {
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  TrendingUp,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { SkillGap } from "@/types";
import type { ResumeData } from "@/types/resume";
import SkillBadge from "./SkillBadge";

interface SkillGapPanelProps {
  resume: ResumeData;
  skillGaps: SkillGap[];
  totalJobs: number;
}

function PriorityDot({ priority }: { priority: SkillGap["priority"] }) {
  const colorMap = {
    high: "bg-primary",
    medium: "bg-muted-foreground",
    low: "bg-border",
  };
  return (
    <span
      className={`inline-block h-2 w-2 shrink-0 rounded ${colorMap[priority]}`}
    />
  );
}

export default function SkillGapPanel({
  resume,
  skillGaps,
  totalJobs,
}: SkillGapPanelProps) {
  const [showAllMissing, setShowAllMissing] = useState(false);
  const [showAllHave, setShowAllHave] = useState(false);

  const highPriority = skillGaps.filter((g) => g.priority === "high");
  const mediumPriority = skillGaps.filter((g) => g.priority === "medium");
  const lowPriority = skillGaps.filter((g) => g.priority === "low");

  const LIMIT = 12;
  const allSkills = resume.skills.flatMap((s) => s.keywords);
  const displayedGaps = showAllMissing ? skillGaps : skillGaps.slice(0, LIMIT);
  const displayedHave = showAllHave ? allSkills : allSkills.slice(0, LIMIT);

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      {/* LEFT: Skills You Have */}
      <Card className="overflow-hidden rounded-xl border-border shadow-sm">
        <CardContent className="flex h-full flex-col bg-card p-6">
          <div className="mb-6 flex items-center gap-3 border-border border-b pb-4">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded border border-border bg-muted/50">
              <CheckCircle2 className="h-4 w-4 text-foreground" />
            </div>
            <div>
              <h3 className="font-bold text-foreground text-sm">
                Skills You Have
              </h3>
              <p className="font-medium text-muted-foreground text-xs">
                {allSkills.length} skills detected
              </p>
            </div>
          </div>

          <div className="mb-4 flex flex-1 flex-wrap content-start gap-2">
            {displayedHave.map((skill) => (
              <SkillBadge
                key={skill}
                skill={skill}
                variant="matched"
                size="sm"
              />
            ))}
          </div>

          {allSkills.length > LIMIT && (
            <Button
              variant="outline"
              size="sm"
              id="toggle-have-skills-btn"
              onClick={() => setShowAllHave(!showAllHave)}
              className="mt-auto h-8 w-full font-medium text-xs"
            >
              {showAllHave ? (
                <>
                  <ChevronUp className="mr-1.5 h-3.5 w-3.5" /> Show less
                </>
              ) : (
                <>
                  <ChevronDown className="mr-1.5 h-3.5 w-3.5" /> +
                  {allSkills.length - LIMIT} more
                </>
              )}
            </Button>
          )}
        </CardContent>
      </Card>

      {/* RIGHT: Skills You're Missing */}
      <Card className="overflow-hidden rounded-xl border-border shadow-sm">
        <CardContent className="flex h-full flex-col bg-card p-6">
          <div className="mb-6 flex items-center gap-3 border-border border-b pb-4">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded border border-border bg-muted/50">
              <AlertCircle className="h-4 w-4 text-foreground" />
            </div>
            <div>
              <h3 className="font-bold text-foreground text-sm">
                Skills to Learn
              </h3>
              <p className="font-medium text-muted-foreground text-xs">
                {skillGaps.length} gaps across {totalJobs} jobs
              </p>
            </div>
          </div>

          {/* Priority breakdown */}
          <div className="flex-1 space-y-5">
            {highPriority.length > 0 && (
              <div>
                <p className="mb-2.5 flex items-center gap-1.5 font-semibold text-foreground text-xs uppercase tracking-wider">
                  <PriorityDot priority="high" /> High priority
                </p>
                <div className="flex flex-wrap gap-2">
                  {displayedGaps
                    .filter((g) => g.priority === "high")
                    .map((g) => (
                      <span
                        key={g.skill}
                        className="inline-flex items-center gap-1.5 rounded-md border border-primary bg-primary px-2.5 py-1 font-bold text-[11px] text-primary-foreground"
                      >
                        {g.skill}
                        <span className="border-primary-foreground/20 border-l pl-1 font-medium text-[10px] opacity-70">
                          {g.frequency}
                        </span>
                      </span>
                    ))}
                </div>
              </div>
            )}

            {mediumPriority.length > 0 && (
              <div>
                <p className="mb-2.5 flex items-center gap-1.5 font-semibold text-foreground text-xs uppercase tracking-wider">
                  <PriorityDot priority="medium" /> Medium priority
                </p>
                <div className="flex flex-wrap gap-2">
                  {displayedGaps
                    .filter((g) => g.priority === "medium")
                    .map((g) => (
                      <span
                        key={g.skill}
                        className="inline-flex items-center gap-1.5 rounded-md border border-border bg-muted px-2.5 py-1 font-bold text-[11px] text-foreground"
                      >
                        {g.skill}
                        <span className="border-border border-l pl-1 font-medium text-[10px] opacity-60">
                          {g.frequency}
                        </span>
                      </span>
                    ))}
                </div>
              </div>
            )}

            {lowPriority.length > 0 && (
              <div>
                <p className="mb-2.5 flex items-center gap-1.5 font-semibold text-foreground text-xs uppercase tracking-wider">
                  <PriorityDot priority="low" /> Nice to have
                </p>
                <div className="flex flex-wrap gap-2">
                  {displayedGaps
                    .filter((g) => g.priority === "low")
                    .map((g) => (
                      <span
                        key={g.skill}
                        className="inline-flex rounded-md border border-transparent bg-muted/50 px-2.5 py-1 font-semibold text-[11px] text-muted-foreground"
                      >
                        {g.skill}
                      </span>
                    ))}
                </div>
              </div>
            )}
          </div>

          {highPriority.length > 0 && (
            <div className="mt-6 flex items-start gap-2.5 rounded border border-border bg-muted p-3 font-medium text-foreground text-xs">
              <TrendingUp className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
              <span className="leading-relaxed">
                Focus on high-priority skills first — these appear most
                frequently across all sampled job listings for your target
                roles.
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
