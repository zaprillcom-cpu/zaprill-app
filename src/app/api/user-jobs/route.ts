import { desc, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import db from "@/db";
import { jobVisit, savedJob } from "@/db/schema";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const saved = await db
      .select()
      .from(savedJob)
      .where(eq(savedJob.userId, session.user.id))
      .orderBy(desc(savedJob.savedAt));

    const visited = await db
      .select()
      .from(jobVisit)
      .where(eq(jobVisit.userId, session.user.id))
      .orderBy(desc(jobVisit.visitedAt));

    return NextResponse.json({ saved, visited });
  } catch (error) {
    console.error("Failed to fetch user jobs:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
