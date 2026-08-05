import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { profilesTable } from "./profiles";

export const resumesTable = pgTable("resumes", {
  id: text("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  user_id: text("user_id")
    .notNull()
    .references(() => profilesTable.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  content: text("content").notNull(),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const insertResumeSchema = createInsertSchema(resumesTable).omit({
  created_at: true,
  updated_at: true,
});
export type InsertResume = z.infer<typeof insertResumeSchema>;
export type Resume = typeof resumesTable.$inferSelect;
