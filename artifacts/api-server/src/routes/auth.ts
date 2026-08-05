import { Router, type IRouter } from "express";
import { db, profilesTable } from "@workspace/db";
import { SyncUserBody } from "@workspace/api-zod";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

router.post("/auth/sync", async (req, res): Promise<void> => {
  const parsed = SyncUserBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { id, email, full_name } = parsed.data;

  try {
    const existing = await db
      .select()
      .from(profilesTable)
      .where(eq(profilesTable.id, id));

    if (existing.length > 0) {
      const [updated] = await db
        .update(profilesTable)
        .set({ email, full_name: full_name ?? null })
        .where(eq(profilesTable.id, id))
        .returning();

      res.json({
        id: updated.id,
        email: updated.email,
        full_name: updated.full_name,
        created_at: updated.created_at.toISOString(),
      });
      return;
    }

    const [profile] = await db
      .insert(profilesTable)
      .values({ id, email, full_name: full_name ?? null })
      .returning();

    res.json({
      id: profile.id,
      email: profile.email,
      full_name: profile.full_name,
      created_at: profile.created_at.toISOString(),
    });
  } catch (err) {
    req.log.error({ err }, "Failed to sync user");
    res.status(500).json({ error: "Failed to sync user" });
  }
});

export default router;
