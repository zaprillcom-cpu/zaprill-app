import { desc, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import db from "@/db";
import { jobVisit, resumeAnalysis, userProfile } from "@/db/schema";
import { auth } from "@/lib/auth";
import type { JobMatch, RoadmapItem, SkillGap } from "@/types";

/**
 * Parses an Indian salary string into an annual INR integer, or null if
 * the string is unrecognisable.
 *
 * Handles formats like:
 *   "₹12 LPA", "12L - 18L", "₹12,00,000 - ₹18,00,000",
 *   "12 Lakhs", "₹12 lakh per annum", "Not disclosed"
 */
function parseSalaryToInr(raw: string | undefined | null): number | null {
  if (!raw) return null;

  const s = raw.replace(/,/g, "").toLowerCase().trim();

  // Skip non-numeric disclosures
  if (/not\s*disclosed|negotiable|competitive|as\s*per|based\s*on/i.test(s)) {
    return null;
  }

  // Extract all numbers from the string
  const nums = [...s.matchAll(/[\d]+(?:\.\d+)?/g)].map((m) => parseFloat(m[0]));
  if (nums.length === 0) return null;

  // Determine multiplier
  const isLpa = /lpa|lakh|lakhs|lac|l\b/.test(s);
  const isCrore = /crore|cr\b/.test(s);

  const toInr = (n: number) => {
    if (isCrore) return Math.round(n * 10_000_000);
    if (isLpa) return Math.round(n * 100_000);
    // Plain numbers ≥ 10,000 are assumed to already be in INR
    if (n >= 10_000) return Math.round(n);
    // Small numbers with no unit — could be LPA written without suffix
    return Math.round(n * 100_000);
  };

  // Range: take the midpoint
  if (nums.length >= 2) {
    return Math.round((toInr(nums[0]) + toInr(nums[1])) / 2);
  }

  return toInr(nums[0]);
}

/** Compute the median of a sorted numeric array */
function median(sorted: number[]): number {
  if (sorted.length === 0) return 0;
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? Math.round((sorted[mid - 1] + sorted[mid]) / 2)
    : sorted[mid];
}

/** Compute the nth percentile of a sorted numeric array */
function percentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0;
  const idx = Math.ceil((p / 100) * sorted.length) - 1;
  return sorted[Math.max(0, Math.min(idx, sorted.length - 1))];
}

export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 1. Get the most recent analysis
    const lastAnalysis = await db.query.resumeAnalysis.findFirst({
      where: eq(resumeAnalysis.userId, session.user.id),
      orderBy: [desc(resumeAnalysis.createdAt)],
    });

    // 2. Get recent job visits
    const recentVisits = await db.query.jobVisit.findMany({
      where: eq(jobVisit.userId, session.user.id),
      orderBy: [desc(jobVisit.createdAt)],
      limit: 10,
    });

    // 3. Get user's current salary from profile
    const profile = await db.query.userProfile.findFirst({
      where: eq(userProfile.userId, session.user.id),
    });

    // 4. Compute salary intelligence from last analysis jobs
    let salaryIntelligence = null;

    if (lastAnalysis?.jobs) {
      const jobs = lastAnalysis.jobs as JobMatch[];

      const salaries = jobs
        .map((j) => parseSalaryToInr(j.salary))
        .filter((n): n is number => n !== null && n > 0)
        .sort((a, b) => a - b);

      if (salaries.length >= 3) {
        const marketAverage = median(salaries);
        const potential = percentile(salaries, 75);

        // Skill blockers: high-priority gaps from the roadmap that appear in
        // the required skills of the better-paying jobs (top 25%)
        const topPaidJobs = jobs
          .filter((j) => {
            const s = parseSalaryToInr(j.salary);
            return s !== null && s >= potential;
          })
          .flatMap((j) => j.missingSkills ?? []);

        const topPaidMissingSet = new Set(
          topPaidJobs.map((s) => s.toLowerCase()),
        );

        const roadmap = (lastAnalysis.roadmap ?? []) as RoadmapItem[];
        const skillGaps = (lastAnalysis.skillGaps ?? []) as SkillGap[];

        // Build blocker list: skills in high-priority gaps that also block top-paid roles
        const blockers = skillGaps
          .filter(
            (g) =>
              g.priority === "high" &&
              topPaidMissingSet.has(g.skill.toLowerCase()),
          )
          .slice(0, 3)
          .map((g) => {
            const roadmapItem = roadmap.find(
              (r) => r.skill.toLowerCase() === g.skill.toLowerCase(),
            );
            // Estimate salary impact: (potential - marketAverage) / number of blockers
            const totalBlockers = skillGaps.filter(
              (sg) =>
                sg.priority === "high" &&
                topPaidMissingSet.has(sg.skill.toLowerCase()),
            ).length;
            const salaryImpact =
              totalBlockers > 0
                ? Math.round((potential - marketAverage) / totalBlockers)
                : 0;
            return {
              skill: g.skill,
              priority: g.priority,
              category: g.category,
              why: roadmapItem?.why ?? "Required by high-paying roles",
              salaryImpact,
            };
          });

        // Also add known strong skills (skills the user already has)
        const userSkills = lastAnalysis.resumeSkills ?? [];

        salaryIntelligence = {
          marketAverage,
          potential,
          currentSalary: profile?.currentSalary ?? null,
          gap:
            profile?.currentSalary != null
              ? marketAverage - profile.currentSalary
              : null,
          potentialGap:
            profile?.currentSalary != null
              ? potential - profile.currentSalary
              : null,
          jobsWithSalaryData: salaries.length,
          totalJobsAnalyzed: jobs.length,
          blockers,
          userSkills,
          inferredRole: (lastAnalysis.inferredJobTitles ?? [])[0] ?? null,
          location: lastAnalysis.searchLocation ?? null,
          analysisDate: lastAnalysis.createdAt,
        };
      }
    }

    return NextResponse.json({
      lastAnalysis,
      recentVisits,
      salaryIntelligence,
    });
  } catch (error: any) {
    console.error("Get career insights error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to retrieve insights" },
      { status: 500 },
    );
  }
}
