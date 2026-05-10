import { startOfDay, subDays } from "date-fns";
import { sql } from "drizzle-orm";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import db from "@/db";
import { auth } from "@/lib/auth";

export async function GET(request: Request) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || session.user.role !== "admin") {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const days = parseInt(searchParams.get("days") || "30");
  const startDate = startOfDay(subDays(new Date(), days));

  try {
    // 1. Revenue Stats
    const revenueStats = await db.execute(sql`
      SELECT 
        DATE(created_at) as date,
        SUM(CAST(amount_paid as NUMERIC) - CAST(tax_amount as NUMERIC)) as revenue,
        COUNT(*) as count
      FROM invoice
      WHERE status = 'paid' AND created_at >= ${startDate}
      GROUP BY DATE(created_at)
      ORDER BY DATE(created_at)
    `);

    // 2. AI Usage Stats
    const aiStats = await db.execute(sql`
      SELECT 
        DATE(created_at) as date,
        SUM(total_tokens) as tokens,
        SUM(cost_usd) as cost,
        COUNT(*) as calls
      FROM ai_usage_log
      WHERE created_at >= ${startDate}
      GROUP BY DATE(created_at)
      ORDER BY DATE(created_at)
    `);

    // 3. User Growth Stats
    const growthStats = await db.execute(sql`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as users
      FROM "user"
      WHERE created_at >= ${startDate}
      GROUP BY DATE(created_at)
      ORDER BY DATE(created_at)
    `);

    // 4. Top AI Models
    const modelStats = await db.execute(sql`
      SELECT 
        model,
        COUNT(*) as usage_count,
        SUM(total_tokens) as total_tokens,
        SUM(cost_usd) as total_cost
      FROM ai_usage_log
      GROUP BY model
      ORDER BY usage_count DESC
    `);

    return NextResponse.json({
      revenue: revenueStats.rows,
      ai: aiStats.rows,
      growth: growthStats.rows,
      models: modelStats.rows,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
