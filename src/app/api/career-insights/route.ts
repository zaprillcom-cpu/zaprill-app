import { desc, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import db from "@/db";
import { jobVisit, resumeAnalysis } from "@/db/schema";
import { auth } from "@/lib/auth";

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

    return NextResponse.json({
      lastAnalysis,
      recentVisits,
    });
  } catch (error: any) {
    console.error("Get career insights error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to retrieve insights" },
      { status: 500 },
    );
  }
}
