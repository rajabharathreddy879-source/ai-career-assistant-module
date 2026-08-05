import { Router, type IRouter } from "express";
import { db, reportsTable } from "@workspace/db";
import {
  ListReportsQueryParams,
  CreateReportBody,
  DeleteReportParams,
} from "@workspace/api-zod";
import { eq, desc } from "drizzle-orm";

const router: IRouter = Router();

// GET /reports?userId=
router.get("/reports", async (req, res): Promise<void> => {
  const parsed = ListReportsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { userId } = parsed.data;

  try {
    const reports = await db
      .select()
      .from(reportsTable)
      .where(eq(reportsTable.user_id, userId))
      .orderBy(desc(reportsTable.created_at));

    res.json(
      reports.map((r) => ({
        id: r.id,
        user_id: r.user_id,
        title: r.title,
        content: r.content,
        report_type: r.report_type,
        priority: r.priority,
        created_at: r.created_at.toISOString(),
      })),
    );
  } catch (err) {
    req.log.error({ err }, "Failed to list reports");
    res.status(500).json({ error: "Failed to list reports" });
  }
});

// POST /reports
router.post("/reports", async (req, res): Promise<void> => {
  const parsed = CreateReportBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { user_id, title, content, report_type, priority } = parsed.data;

  try {
    const [report] = await db
      .insert(reportsTable)
      .values({ user_id, title, content, report_type, priority })
      .returning();

    res.status(201).json({
      id: report.id,
      user_id: report.user_id,
      title: report.title,
      content: report.content,
      report_type: report.report_type,
      priority: report.priority,
      created_at: report.created_at.toISOString(),
    });
  } catch (err) {
    req.log.error({ err }, "Failed to create report");
    res.status(500).json({ error: "Failed to create report" });
  }
});

// DELETE /reports/:reportId
router.delete("/reports/:reportId", async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params["reportId"])
    ? req.params["reportId"][0]
    : req.params["reportId"];

  const params = DeleteReportParams.safeParse({ reportId: rawId });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const { reportId } = params.data;

  try {
    const [deleted] = await db
      .delete(reportsTable)
      .where(eq(reportsTable.id, reportId))
      .returning();

    if (!deleted) {
      res.status(404).json({ error: "Report not found" });
      return;
    }

    res.sendStatus(204);
  } catch (err) {
    req.log.error({ err }, "Failed to delete report");
    res.status(500).json({ error: "Failed to delete report" });
  }
});

export default router;
