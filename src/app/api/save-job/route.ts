import { and, eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import db from "@/db";
import { savedJob } from "@/db/schema";
import { auth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const {
      jobId,
      title,
      company,
      location,
      url,
      matchPercentage,
      analysisId,
      jobRaw,
    } = body;

    // Check if already saved
    const existing = await db
      .select()
      .from(savedJob)
      .where(
        and(eq(savedJob.userId, session.user.id), eq(savedJob.jobId, jobId)),
      )
      .limit(1);

    if (existing.length > 0) {
      // If already exists, we can treat this as an 'unsave' or just return success
      // For now, let's just return success
      return NextResponse.json({ success: true, message: "Already saved" });
    }

    await db.insert(savedJob).values({
      id: `saved_${nanoid()}`,
      userId: session.user.id,
      analysisId,
      jobId,
      title,
      company,
      location,
      url,
      matchPercentage,
      jobRaw,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to save job:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function DELETE(req: NextRequest) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { jobId } = await req.json();

    await db
      .delete(savedJob)
      .where(
        and(eq(savedJob.userId, session.user.id), eq(savedJob.jobId, jobId)),
      );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to unsave job:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
