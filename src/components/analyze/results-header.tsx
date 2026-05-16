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
      <Card className="mb-8 shadow-sm border-border rounded-2xl">
        <CardContent className="p-8">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <div className="w-20 h-20 rounded-xl bg-muted/80 border border-border flex items-center justify-center shrink-0">
              <User className="h-10 w-10 text-foreground" />
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-3xl font-black text-foreground mb-2 tracking-tight">
                {resume.basics.name}
              </h1>
              <p className="text-base font-semibold text-muted-foreground mb-5 pb-5 border-b border-border/50">
                {resume.basics.email}{" "}
                {resume.basics.location.city && (
                  <>
                    <span className="opacity-50 mx-2">·</span>{" "}
                    {resume.basics.location.city}
                  </>
                )}{" "}
                <span className="opacity-50 mx-2">·</span> Target:{" "}
                {resume.inferredJobTitles?.slice(0, 3).join(", ")}
              </p>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                {skills.slice(0, 15).map((s) => (
                  <SkillBadge key={s} skill={s} variant="neutral" size="md" />
                ))}
                {skills.length > 15 && (
                  <span className="text-sm font-black text-muted-foreground ml-2">
                    +{skills.length - 15}
                  </span>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-10">
        <StatCard value={`${summary.topMatch}%`} label="Best match" />
        <StatCard value={`${summary.avg}%`} label="Avg match" />
        <StatCard value={summary.strongMatches} label="Strong fits" />
        <StatCard value={summary.total} label="Jobs found" />
      </div>
    </>
  );
}
