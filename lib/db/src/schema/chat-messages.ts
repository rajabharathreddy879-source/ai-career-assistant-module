import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { chatSessionsTable } from "./chat-sessions";

export const chatMessagesTable = pgTable("chat_messages", {
  id: text("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  session_id: text("session_id")
    .notNull()
    .references(() => chatSessionsTable.id, { onDelete: "cascade" }),
  role: text("role").notNull(), // 'user' | 'assistant' | 'system'
  message: text("message").notNull(),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const insertChatMessageSchema = createInsertSchema(chatMessagesTable).omit({
  created_at: true,
});
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
export type ChatMessage = typeof chatMessagesTable.$inferSelect;
