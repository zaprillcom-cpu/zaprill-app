import { User } from "lucide-react";
import SkillBadge from "@/components/SkillBadge";
import { Card, CardContent } from "@/components/ui/card";
import type { ResumeData } from "@/types/resume";
import { StatCard } from "./stat-card";

interface ResultsHeaderProps {
  resume: ResumeData;
  summary: {
    topMatch: number;
    avg: number;
    strongMatches: number;
    total: number;
  };
}

export function ResultsHeader({ resume, summary }: ResultsHeaderProps) {
  console.log("Resume data: ", resume);
  const skills = resume.skills.flatMap((s) => s.keywords);
  return (
    <>
      {/* Profile header */}
      <Card className="mb-8 rounded-2xl border-border shadow-sm">
        <CardContent className="p-8">
          <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl border border-border bg-muted/80">
              <User className="h-10 w-10 text-foreground" />
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h1 className="mb-2 font-black text-3xl text-foreground tracking-tight">
                {resume.basics.name}
              </h1>
              <p className="mb-5 border-border/50 border-b pb-5 font-semibold text-base text-muted-foreground">
                {resume.basics.email}{" "}
                {resume.basics.location.city && (
                  <>
                    <span className="mx-2 opacity-50">·</span>{" "}
                    {resume.basics.location.city}
                  </>
                )}{" "}
                <span className="mx-2 opacity-50">·</span> Target:{" "}
                {resume.inferredJobTitles?.slice(0, 3).join(", ")}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                {skills.slice(0, 15).map((s) => (
                  <SkillBadge key={s} skill={s} variant="neutral" size="md" />
                ))}
                {skills.length > 15 && (
                  <span className="ml-2 font-black text-muted-foreground text-sm">
                    +{skills.length - 15}
                  </span>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="mb-10 grid grid-cols-2 gap-5 md:grid-cols-4">
        <StatCard value={`${summary.topMatch}%`} label="Best match" />
        <StatCard value={`${summary.avg}%`} label="Avg match" />
        <StatCard value={summary.strongMatches} label="Strong fits" />
        <StatCard value={summary.total} label="Jobs found" />
      </div>
    </>
  );
}
