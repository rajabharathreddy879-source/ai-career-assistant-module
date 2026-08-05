import { z } from "zod";

export const historyMessageSchema = z.object({
  role: z.enum(["user", "assistant", "system"]),
  message: z.string().min(1),
});

export const sendChatMessageSchema = z.object({
  message: z.string().min(1, "Message is required").max(4000, "Message cannot exceed 4000 characters"),
  session_id: z.string().uuid("Invalid session ID format"),
  user_id: z.string().min(1, "User ID is required"),
  resume_text: z.string().optional().nullable(),
  job_description: z.string().optional().nullable(),
  history: z.array(historyMessageSchema).optional().default([]),
});

export const createChatSessionSchema = z.object({
  user_id: z.string().min(1, "User ID is required"),
  title: z.string().min(1, "Title is required").max(200, "Title is too long"),
});

export const syncProfileSchema = z.object({
  id: z.string().min(1, "User ID is required"),
  email: z.string().email("Invalid email address"),
  full_name: z.string().optional().nullable(),
});

export const resumeInputSchema = z.object({
  user_id: z.string().min(1),
  title: z.string().min(1, "Resume title is required"),
  content: z.string().min(1, "Resume content is required"),
  is_primary: z.boolean().optional().default(false),
});

export const reportInputSchema = z.object({
  user_id: z.string().min(1),
  title: z.string().min(1, "Report title is required"),
  report_type: z.enum(["roadmap", "ats_analysis", "interview_prep", "skill_gap", "project_recommendation"]),
  content: z.string().min(1, "Content is required"),
  priority: z.enum(["Low", "Medium", "High", "Critical"]).optional().default("Medium"),
});

export type HistoryMessage = z.infer<typeof historyMessageSchema>;
export type SendChatMessageInput = z.infer<typeof sendChatMessageSchema>;
export type CreateChatSessionInput = z.infer<typeof createChatSessionSchema>;
export type SyncProfileInput = z.infer<typeof syncProfileSchema>;
export type ResumeInput = z.infer<typeof resumeInputSchema>;
export type ReportInput = z.infer<typeof reportInputSchema>;
