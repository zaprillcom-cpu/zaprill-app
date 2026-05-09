import { nanoid } from "nanoid";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import db from "@/db";
import { jobVisit } from "@/db/schema";
import { auth } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      jobId,
      title,
      company,
      location,
      url,
      matchPercentage,
      analysisId,
    } = body;

    if (!jobId || !title || !company || !url) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    await db.insert(jobVisit).values({
      id: nanoid(),
      userId: session.user.id,
      analysisId: analysisId || null,
      jobId,
      title,
      company,
      location,
      url,
      matchPercentage,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Track visit error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to track visit" },
      { status: 500 },
    );
  }
}
