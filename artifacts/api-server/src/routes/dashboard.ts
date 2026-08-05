import { Router, type IRouter } from "express";
import { db, chatSessionsTable, chatMessagesTable, resumesTable, reportsTable } from "@workspace/db";
import { GetDashboardStatsQueryParams } from "@workspace/api-zod";
import { eq, count, desc } from "drizzle-orm";

const router: IRouter = Router();

router.get("/dashboard/stats", async (req, res): Promise<void> => {
  const parsed = GetDashboardStatsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { userId } = parsed.data;

  try {
    const [{ total_sessions }] = await db
      .select({ total_sessions: count() })
      .from(chatSessionsTable)
      .where(eq(chatSessionsTable.user_id, userId));

    const [{ total_messages }] = await db
      .select({ total_messages: count() })
      .from(chatMessagesTable)
      .innerJoin(chatSessionsTable, eq(chatMessagesTable.session_id, chatSessionsTable.id))
      .where(eq(chatSessionsTable.user_id, userId));

    const [{ resumes_count }] = await db
      .select({ resumes_count: count() })
      .from(resumesTable)
      .where(eq(resumesTable.user_id, userId));

    const [{ reports_count }] = await db
      .select({ reports_count: count() })
      .from(reportsTable)
      .where(eq(reportsTable.user_id, userId));

    const recentRaw = await db
      .select({
        id: chatSessionsTable.id,
        user_id: chatSessionsTable.user_id,
        title: chatSessionsTable.title,
        created_at: chatSessionsTable.created_at,
        message_count: count(chatMessagesTable.id),
      })
      .from(chatSessionsTable)
      .leftJoin(chatMessagesTable, eq(chatMessagesTable.session_id, chatSessionsTable.id))
      .where(eq(chatSessionsTable.user_id, userId))
      .groupBy(chatSessionsTable.id)
      .orderBy(desc(chatSessionsTable.created_at))
      .limit(5);

    const recent_sessions = recentRaw.map((s) => ({
      id: s.id,
      user_id: s.user_id,
      title: s.title,
      created_at: s.created_at.toISOString(),
      message_count: Number(s.message_count),
    }));

    res.json({
      total_sessions: Number(total_sessions),
      total_messages: Number(total_messages),
      resumes_count: Number(resumes_count),
      reports_count: Number(reports_count),
      recent_sessions,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to get dashboard stats");
    res.status(500).json({ error: "Failed to get dashboard stats" });
  }
});

export default router;
