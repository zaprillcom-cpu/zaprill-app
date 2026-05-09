import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import db from "@/db";
import { learningResources } from "@/db/schema";
import { auth } from "@/lib/auth";

async function requireAdmin() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || session.user.role !== "admin") return null;
  return session;
}

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await requireAdmin();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resources = await db
      .select()
      .from(learningResources)
      .orderBy(learningResources.createdAt);

    return NextResponse.json({ resources });
  } catch (error: any) {
    console.error("[RESOURCES_GET]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireAdmin();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { _action, ...data } = body;

    if (_action === "create_resource") {
      const newResource = await db
        .insert(learningResources)
        .values({
          id: `res_${nanoid(10)}`,
          skill: data.skill.toLowerCase().trim(),
          type: data.type,
          name: data.name,
          url: data.url,
          isAffiliate: data.isAffiliate ?? false,
          isFree: data.isFree ?? false,
          estimatedTime: data.estimatedTime || null,
          isActive: data.isActive ?? true,
        })
        .returning();
      return NextResponse.json({ resource: newResource[0] });
    }

    if (_action === "update_resource") {
      const updated = await db
        .update(learningResources)
        .set({
          skill: data.skill.toLowerCase().trim(),
          type: data.type,
          name: data.name,
          url: data.url,
          isAffiliate: data.isAffiliate,
          isFree: data.isFree,
          estimatedTime: data.estimatedTime || null,
          isActive: data.isActive,
          updatedAt: new Date(),
        })
        .where(eq(learningResources.id, data.id))
        .returning();
      return NextResponse.json({ resource: updated[0] });
    }

    if (_action === "delete_resource") {
      await db
        .delete(learningResources)
        .where(eq(learningResources.id, data.id));
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (error: any) {
    console.error("[RESOURCES_POST]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
