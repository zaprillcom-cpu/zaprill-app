import { eq, ilike, sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import db from "@/db";
import { jobTitleAliases, jobTitles } from "@/db/schema";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");

    if (!query || query.length < 2) {
      return NextResponse.json({ titles: [] });
    }

    // 1. Search in canonical titles
    const canonicalResults = await db
      .select({
        id: jobTitles.id,
        title: jobTitles.title,
        popularityScore: jobTitles.popularityScore,
        searchCount: jobTitles.searchCount,
      })
      .from(jobTitles)
      .where(ilike(jobTitles.title, `%${query}%`))
      .limit(10);

    // 2. Search in aliases
    const aliasResults = await db
      .select({
        id: jobTitles.id,
        title: jobTitles.title,
        popularityScore: jobTitles.popularityScore,
        searchCount: jobTitles.searchCount,
      })
      .from(jobTitleAliases)
      .innerJoin(jobTitles, eq(jobTitleAliases.jobTitleId, jobTitles.id))
      .where(ilike(jobTitleAliases.alias, `%${query}%`))
      .limit(10);

    // Combine and deduplicate by title ID
    const combined = [...canonicalResults, ...aliasResults];
    const uniqueMap = new Map();
    for (const item of combined) {
      if (!uniqueMap.has(item.id)) {
        uniqueMap.set(item.id, item);
      }
    }

    const results = Array.from(uniqueMap.values())
      .sort((a, b) => {
        // Sort by popularity first, then search count
        if ((b.popularityScore || 0) !== (a.popularityScore || 0)) {
          return (b.popularityScore || 0) - (a.popularityScore || 0);
        }
        return (b.searchCount || 0) - (a.searchCount || 0);
      })
      .slice(0, 10);

    // Update search count for the matches (background/async)
    if (results.length > 0) {
      const topId = results[0].id;
      // Update search count in background
      db.update(jobTitles)
        .set({
          searchCount: sql`${jobTitles.searchCount} + 1`,
          updatedAt: new Date(),
        })
        .where(eq(jobTitles.id, topId))
        .execute()
        .catch(console.error);
    }

    return NextResponse.json({
      titles: results.map((r) => r.title),
    });
  } catch (error) {
    console.error("Job title search error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
