import { and, eq, inArray } from "drizzle-orm";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import db from "@/db";
import { subscription } from "@/db/schema";
import { auth } from "@/lib/auth";

export async function GET(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || session.user.role !== "admin") {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get("limit") || "100");

  try {
    const { users } = await auth.api.listUsers({
      headers: await headers(),
      query: { limit },
    });

    if (users.length === 0) {
      return NextResponse.json({ users: [] });
    }

    const userIds = users.map((u) => u.id);
    const activeSubscriptions = await db
      .select({ userId: subscription.userId })
      .from(subscription)
      .where(
        and(
          eq(subscription.status, "active"),
          inArray(subscription.userId, userIds),
        ),
      );

    const proUserIds = new Set(activeSubscriptions.map((s) => s.userId));

    const usersWithPro = users.map((user) => ({
      ...user,
      isPro: proUserIds.has(user.id),
    }));

    return NextResponse.json({ users: usersWithPro });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
