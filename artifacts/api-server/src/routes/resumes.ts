import { Router, type IRouter } from "express";
import { db, resumesTable } from "@workspace/db";
import {
  ListResumesQueryParams,
  CreateResumeBody,
  UpdateResumeParams,
  UpdateResumeBody,
  DeleteResumeParams,
} from "@workspace/api-zod";
import { eq, and, desc } from "drizzle-orm";

const router: IRouter = Router();

// GET /resumes?userId=
router.get("/resumes", async (req, res): Promise<void> => {
  const parsed = ListResumesQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { userId } = parsed.data;

  try {
    const resumes = await db
      .select()
      .from(resumesTable)
      .where(eq(resumesTable.user_id, userId))
      .orderBy(desc(resumesTable.updated_at));

    res.json(
      resumes.map((r) => ({
        id: r.id,
        user_id: r.user_id,
        name: r.name,
        content: r.content,
        created_at: r.created_at.toISOString(),
        updated_at: r.updated_at.toISOString(),
      })),
    );
  } catch (err) {
    req.log.error({ err }, "Failed to list resumes");
    res.status(500).json({ error: "Failed to list resumes" });
  }
});

// POST /resumes
router.post("/resumes", async (req, res): Promise<void> => {
  const parsed = CreateResumeBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { user_id, name, content } = parsed.data;

  try {
    const [resume] = await db
      .insert(resumesTable)
      .values({ user_id, name, content })
      .returning();

    res.status(201).json({
      id: resume.id,
      user_id: resume.user_id,
      name: resume.name,
      content: resume.content,
      created_at: resume.created_at.toISOString(),
      updated_at: resume.updated_at.toISOString(),
    });
  } catch (err) {
    req.log.error({ err }, "Failed to create resume");
    res.status(500).json({ error: "Failed to create resume" });
  }
});

// PATCH /resumes/:resumeId
router.patch("/resumes/:resumeId", async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params["resumeId"])
    ? req.params["resumeId"][0]
    : req.params["resumeId"];

  const params = UpdateResumeParams.safeParse({ resumeId: rawId });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const body = UpdateResumeBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }

  const { resumeId } = params.data;
  const updates = body.data;

  if (Object.keys(updates).length === 0) {
    res.status(400).json({ error: "No fields to update" });
    return;
  }

  try {
    const [resume] = await db
      .update(resumesTable)
      .set({ ...updates, updated_at: new Date() })
      .where(eq(resumesTable.id, resumeId))
      .returning();

    if (!resume) {
      res.status(404).json({ error: "Resume not found" });
      return;
    }

    res.json({
      id: resume.id,
      user_id: resume.user_id,
      name: resume.name,
      content: resume.content,
      created_at: resume.created_at.toISOString(),
      updated_at: resume.updated_at.toISOString(),
    });
  } catch (err) {
    req.log.error({ err }, "Failed to update resume");
    res.status(500).json({ error: "Failed to update resume" });
  }
});

// DELETE /resumes/:resumeId
router.delete("/resumes/:resumeId", async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params["resumeId"])
    ? req.params["resumeId"][0]
    : req.params["resumeId"];

  const params = DeleteResumeParams.safeParse({ resumeId: rawId });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const { resumeId } = params.data;

  try {
    const [deleted] = await db
      .delete(resumesTable)
      .where(eq(resumesTable.id, resumeId))
      .returning();

    if (!deleted) {
      res.status(404).json({ error: "Resume not found" });
      return;
    }

    res.sendStatus(204);
  } catch (err) {
    req.log.error({ err }, "Failed to delete resume");
    res.status(500).json({ error: "Failed to delete resume" });
  }
});

export default router;
