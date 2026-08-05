import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { profilesTable } from "./profiles";

export const reportsTable = pgTable("reports", {
  id: text("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  user_id: text("user_id")
    .notNull()
    .references(() => profilesTable.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  content: text("content").notNull(),
  // 'resume_analysis' | 'ats_optimization' | 'skill_gap' | 'roadmap' | 'interview_prep' | 'general'
  report_type: text("report_type").notNull(),
  // 'Low' | 'Medium' | 'High' | 'Critical'
  priority: text("priority").notNull(),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const insertReportSchema = createInsertSchema(reportsTable).omit({
  created_at: true,
});
export type InsertReport = z.infer<typeof insertReportSchema>;
export type Report = typeof reportsTable.$inferSelect;
