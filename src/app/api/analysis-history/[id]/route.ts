import { and, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import db from "@/db";
import { resumeAnalysis } from "@/db/schema";
import { auth } from "@/lib/auth";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // In next 15+, params is a promise
    const { id } = await params;

    const analysis = await db.query.resumeAnalysis.findFirst({
      where: and(
        eq(resumeAnalysis.id, id),
        eq(resumeAnalysis.userId, session.user.id),
      ),
    });

    if (!analysis) {
      return NextResponse.json(
        { error: "Analysis not found" },
        { status: 404 },
      );
    }

    let isPro = false;
    try {
      const { getActiveSubscription } = await import(
        "@/services/billing/subscription.service"
      );
      const activeSub = await getActiveSubscription(session.user.id);
      isPro = !!activeSub;
    } catch {
      // Default to free if subscription check fails
    }

    return NextResponse.json({ analysis, isPro });
  } catch (error: any) {
    console.error("Get specific analysis error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to retrieve analysis" },
      { status: 500 },
    );
  }
}
