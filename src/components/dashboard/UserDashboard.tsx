"use client";

import {
  ArrowRight,
  Briefcase,
  ChevronRight,
  Loader2,
  MapPin,
  Shield,
  Star,
  Target,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import JobCard from "@/components/JobCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { JobMatch, ResumeData } from "@/types";

interface UserDashboardProps {
  profile: any;
  session: any;
}

export default function UserDashboard({
  profile,
  session,
}: UserDashboardProps) {
  const [latestAnalysis, setLatestAnalysis] = useState<any>(null);
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(true);

  useEffect(() => {
    fetch("/api/analysis-history")
      .then((res) => res.json())
      .then((data) => {
        if (data.history && data.history.length > 0) {
          setLatestAnalysis(data.history[0]);
        }
      })
      .catch((err) => console.error("Failed to load history", err))
      .finally(() => setIsLoadingAnalysis(false));
  }, []);

  const resumeData = profile?.resumeData || profile?.resumeRaw;
  const lastAtsScore = profile?.lastAtsScore || 0;

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-emerald-500";
    if (score >= 75) return "text-sky-500";
    if (score >= 60) return "text-amber-500";
    return "text-rose-500";
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-6 py-12 space-y-12 animate-in fade-in duration-700">
      {/* Welcome Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-[0.2em]">
            <Zap className="h-3 w-3 fill-current" />
            Personal Dashboard
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter">
            Welcome back, {session.user.name.split(" ")[0]}
          </h1>
          <p className="text-muted-foreground font-medium text-lg">
            Your career growth engine is fueled and ready.
          </p>
        </div>
        <Link href="/analyze">
          <Button className="font-bold h-12 px-8 rounded-xl shadow-xl shadow-primary/20 group text-base">
            Start New Analysis
            <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
          </Button>
        </Link>
      </header>

      {/* Metrics Row - Moved to Top */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Profile Summary Card */}
        <Card className="border-border/50 shadow-sm overflow-hidden rounded-2xl flex flex-col justify-between">
          <CardHeader className="bg-muted/30 pb-4 flex-row items-center justify-between space-y-0">
            <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              <Target className="h-3.5 w-3.5" />
              Career Profile
            </CardTitle>
            <Link href="/profile">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-[10px] font-bold uppercase tracking-widest"
              >
                Edit
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20">
                <span className="text-xl font-black text-primary">
                  {session.user.name.charAt(0)}
                </span>
              </div>
              <div className="min-w-0">
                <h3 className="font-bold text-lg truncate">
                  {resumeData?.basics?.name || session.user.name}
                </h3>
                <p className="text-sm font-medium text-muted-foreground truncate">
                  {resumeData?.basics?.label || "Professional"}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                  Experience
                </p>
                <p className="text-sm font-black">
                  {resumeData?.totalYearsOfExperience || 0} Years
                </p>
              </div>
              <div className="space-y-1 text-right">
                <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                  Location
                </p>
                <p className="text-sm font-black truncate">
                  {resumeData?.basics?.location?.city || "Remote"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ATS Score Card */}
        <Card className="border-border/50 shadow-sm overflow-hidden rounded-2xl bg-gradient-to-br from-background to-muted/30 flex flex-col justify-between">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              <Shield className="h-3.5 w-3.5" />
              ATS Score
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-2 space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-0">
                <div
                  className={`text-4xl font-black ${getScoreColor(lastAtsScore)}`}
                >
                  {lastAtsScore || 0}%
                </div>
                <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                  Compatibility
                </p>
              </div>
              <div className="h-12 w-12 rounded-full border-2 border-muted flex items-center justify-center relative">
                <svg className="h-full w-full -rotate-90 transform">
                  <circle
                    cx="24"
                    cy="24"
                    r="20"
                    stroke="currentColor"
                    strokeWidth="3"
                    fill="transparent"
                    className="text-muted/10"
                  />
                  <circle
                    cx="24"
                    cy="24"
                    r="20"
                    stroke="currentColor"
                    strokeWidth="3"
                    fill="transparent"
                    strokeDasharray={2 * Math.PI * 20}
                    strokeDashoffset={
                      2 * Math.PI * 20 * (1 - (lastAtsScore || 0) / 100)
                    }
                    className={`${getScoreColor(lastAtsScore)} transition-all duration-1000`}
                    strokeLinecap="round"
                  />
                </svg>
                <Star
                  className={`absolute h-4 w-4 fill-current ${getScoreColor(lastAtsScore)} opacity-20`}
                />
              </div>
            </div>
            <Progress value={lastAtsScore} className="h-1.5" />
            <Link href="/resumes" className="block">
              <Button
                variant="secondary"
                className="w-full font-bold h-9 rounded-lg text-[10px] uppercase tracking-widest gap-2"
              >
                <Zap className="h-3 w-3" />
                Boost Score
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Market Insights Card */}
        <Card className="border-border/50 shadow-sm overflow-hidden rounded-2xl flex flex-col justify-between">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              <Briefcase className="h-3.5 w-3.5" />
              Market Standing
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-2 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 rounded-xl bg-accent/10 border border-accent/20">
                <div className="text-xl font-black">
                  {latestAnalysis?.jobs?.length || 0}
                </div>
                <div className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
                  Jobs matched
                </div>
              </div>
              <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                <div className="text-xl font-black text-emerald-600">
                  {latestAnalysis?.skillGaps?.length || 0}
                </div>
                <div className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
                  Skill Gaps
                </div>
              </div>
            </div>
            {latestAnalysis && (
              <Link href={`/analyze?id=${latestAnalysis.id}`} className="block">
                <Button
                  variant="outline"
                  className="w-full font-bold h-9 rounded-lg text-[10px] uppercase tracking-widest"
                >
                  View Gap Analysis
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Full Width Recommended Jobs */}
      <div className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <div className="space-y-1">
            <h2 className="text-2xl font-black tracking-tight flex items-center gap-3">
              <span className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Briefcase className="h-5 w-5 text-primary" />
              </span>
              Recommended for You
            </h2>
            <p className="text-sm text-muted-foreground font-medium">
              Top opportunities based on your refined skill DNA.
            </p>
          </div>
          {latestAnalysis && (
            <Link
              href={`/analyze?id=${latestAnalysis.id}`}
              className="text-xs font-bold text-primary uppercase tracking-[0.1em] hover:bg-primary/5 px-4 py-2 rounded-lg transition-colors flex items-center gap-1.5"
            >
              See all {latestAnalysis.jobs?.length || 0} matches
              <ChevronRight className="h-4 w-4" />
            </Link>
          )}
        </div>

        {isLoadingAnalysis ? (
          <div className="h-96 flex flex-col items-center justify-center text-muted-foreground gap-4 bg-muted/20 rounded-3xl border-2 border-dashed border-border/50 animate-pulse">
            <Loader2 className="h-10 w-10 animate-spin" />
            <p className="font-bold text-xs uppercase tracking-[0.2em]">
              Synthesizing recommendations...
            </p>
          </div>
        ) : latestAnalysis &&
          latestAnalysis.jobs &&
          latestAnalysis.jobs.length > 0 ? (
          <div className="flex flex-col gap-6">
            <div className="grid gap-4 w-full">
              {latestAnalysis.jobs
                .slice(0, 5)
                .map((job: JobMatch, idx: number) => (
                  <JobCard
                    key={job.id}
                    job={job}
                    rank={idx}
                    analysisId={latestAnalysis.id}
                  />
                ))}
            </div>
            {latestAnalysis.jobs.length > 5 && (
              <Link
                href={`/analyze?id=${latestAnalysis.id}`}
                className="block group"
              >
                <div className="py-6 border-2 border-dashed border-border/60 rounded-2xl flex flex-col items-center justify-center gap-2 text-muted-foreground hover:bg-muted/30 hover:border-primary/30 transition-all duration-300">
                  <p className="font-black text-lg group-hover:text-primary transition-colors">
                    Explore {latestAnalysis.jobs.length - 5} more tailored roles
                  </p>
                  <p className="text-xs font-bold uppercase tracking-widest opacity-60">
                    Discover hidden gems in your match pool
                  </p>
                </div>
              </Link>
            )}
          </div>
        ) : (
          <div className="h-96 flex flex-col items-center justify-center text-center p-12 bg-muted/20 rounded-3xl border-2 border-dashed border-border/50">
            <div className="h-20 w-20 rounded-2xl bg-primary/5 flex items-center justify-center mb-6">
              <Briefcase className="h-10 w-10 text-primary opacity-30" />
            </div>
            <h3 className="text-2xl font-black mb-3">No matches detected</h3>
            <p className="text-muted-foreground text-base max-w-md mb-10 leading-relaxed font-medium">
              We need to decode your professional profile before we can suggest
              elite opportunities. Start your first analysis to begin.
            </p>
            <Link href="/analyze">
              <Button
                size="lg"
                className="rounded-xl font-bold px-10 h-14 text-base shadow-xl shadow-primary/10"
              >
                Activate Job Match Engine
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
