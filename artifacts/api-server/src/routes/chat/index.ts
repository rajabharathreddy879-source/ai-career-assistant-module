import { Router, type IRouter } from "express";
import { db, chatSessionsTable, chatMessagesTable } from "@workspace/db";
import { eq, and, count, desc } from "drizzle-orm";
import { genai, CAREER_SYSTEM_PROMPT } from "../../lib/gemini";
import { sendChatMessageSchema, createChatSessionSchema } from "../../lib/schemas";
import { z } from "zod";

const router: IRouter = Router();

function getUserId(req: any): string | null {
  if (req.user?.id) return req.user.id;
  if (typeof req.query.userId === "string" && req.query.userId) return req.query.userId;
  if (typeof req.query.user_id === "string" && req.query.user_id) return req.query.user_id;
  if (typeof req.body?.user_id === "string" && req.body.user_id) return req.body.user_id;
  return null;
}

// GET /api/chat/history OR /api/chat/sessions
const listSessionsHandler = async (req: any, res: any): Promise<void> => {
  const userId = getUserId(req);
  if (!userId) {
    res.status(400).json({ error: "Missing userId" });
    return;
  }

  try {
    const sessions = await db
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
      .orderBy(desc(chatSessionsTable.created_at));

    res.json(
      sessions.map((s) => ({
        id: s.id,
        user_id: s.user_id,
        title: s.title,
        created_at: s.created_at.toISOString(),
        message_count: Number(s.message_count),
      })),
    );
  } catch (err) {
    req.log?.error({ err }, "Failed to list chat sessions");
    res.status(500).json({ error: "Failed to list chat sessions" });
  }
};

router.get("/history", listSessionsHandler);
router.get("/sessions", listSessionsHandler);

// POST /api/chat/session OR /api/chat/sessions
const createSessionHandler = async (req: any, res: any): Promise<void> => {
  const userId = getUserId(req);
  const title = req.body?.title || "New Career Consultation";

  if (!userId) {
    res.status(400).json({ error: "Missing user_id" });
    return;
  }

  const parsed = createChatSessionSchema.safeParse({ user_id: userId, title });
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  try {
    const [session] = await db
      .insert(chatSessionsTable)
      .values({ user_id: parsed.data.user_id, title: parsed.data.title })
      .returning();

    res.status(201).json({
      id: session.id,
      user_id: session.user_id,
      title: session.title,
      created_at: session.created_at.toISOString(),
      message_count: 0,
    });
  } catch (err) {
    req.log?.error({ err }, "Failed to create chat session");
    res.status(500).json({ error: "Failed to create chat session" });
  }
};

router.post("/session", createSessionHandler);
router.post("/sessions", createSessionHandler);

// GET /api/chat/session/:id OR /api/chat/sessions/:sessionId
const getSessionHandler = async (req: any, res: any): Promise<void> => {
  const sessionId = req.params.id || req.params.sessionId;
  const userId = getUserId(req);

  if (!sessionId) {
    res.status(400).json({ error: "Missing session ID" });
    return;
  }

  try {
    const queryCond = userId
      ? and(eq(chatSessionsTable.id, sessionId), eq(chatSessionsTable.user_id, userId))
      : eq(chatSessionsTable.id, sessionId);

    const [session] = await db
      .select()
      .from(chatSessionsTable)
      .where(queryCond);

    if (!session) {
      res.status(404).json({ error: "Session not found" });
      return;
    }

    const messages = await db
      .select()
      .from(chatMessagesTable)
      .where(eq(chatMessagesTable.session_id, sessionId))
      .orderBy(chatMessagesTable.created_at);

    res.json({
      id: session.id,
      user_id: session.user_id,
      title: session.title,
      created_at: session.created_at.toISOString(),
      messages: messages.map((m) => ({
        id: m.id,
        session_id: m.session_id,
        role: m.role,
        message: m.message,
        created_at: m.created_at.toISOString(),
      })),
    });
  } catch (err) {
    req.log?.error({ err }, "Failed to get chat session");
    res.status(500).json({ error: "Failed to get chat session" });
  }
};

router.get("/session/:id", getSessionHandler);
router.get("/sessions/:sessionId", getSessionHandler);

// DELETE /api/chat/session/:id OR /api/chat/sessions/:sessionId
const deleteSessionHandler = async (req: any, res: any): Promise<void> => {
  const sessionId = req.params.id || req.params.sessionId;
  const userId = getUserId(req);

  if (!sessionId) {
    res.status(400).json({ error: "Missing session ID" });
    return;
  }

  try {
    const queryCond = userId
      ? and(eq(chatSessionsTable.id, sessionId), eq(chatSessionsTable.user_id, userId))
      : eq(chatSessionsTable.id, sessionId);

    const [deleted] = await db
      .delete(chatSessionsTable)
      .where(queryCond)
      .returning();

    if (!deleted) {
      res.status(404).json({ error: "Session not found" });
      return;
    }

    res.sendStatus(204);
  } catch (err) {
    req.log?.error({ err }, "Failed to delete chat session");
    res.status(500).json({ error: "Failed to delete chat session" });
  }
};

router.delete("/session/:id", deleteSessionHandler);
router.delete("/sessions/:sessionId", deleteSessionHandler);

// DELETE /api/chat/history
router.delete("/history", async (req: any, res: any): Promise<void> => {
  const userId = getUserId(req);
  if (!userId) {
    res.status(400).json({ error: "Missing userId" });
    return;
  }

  try {
    await db
      .delete(chatSessionsTable)
      .where(eq(chatSessionsTable.user_id, userId));

    res.sendStatus(204);
  } catch (err) {
    req.log?.error({ err }, "Failed to clear chat history");
    res.status(500).json({ error: "Failed to clear chat history" });
  }
});

// POST /api/chat OR /api/chat/message — SSE Streaming AI endpoint
const sendMessageHandler = async (req: any, res: any): Promise<void> => {
  const userId = getUserId(req);
  const payload = {
    ...req.body,
    user_id: userId || req.body?.user_id,
  };

  const parsed = sendChatMessageSchema.safeParse(payload);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message || "Validation failed" });
    return;
  }

  const { session_id, user_id, message, resume_text, job_description, history } = parsed.data;

  const apiKey = process.env["GEMINI_API_KEY"] || process.env["GOOGLE_API_KEY"];
  if (!apiKey) {
    res.status(503).json({ error: "GEMINI_API_KEY is not configured on the server." });
    return;
  }

  const [session] = await db
    .select()
    .from(chatSessionsTable)
    .where(and(eq(chatSessionsTable.id, session_id), eq(chatSessionsTable.user_id, user_id)));

  if (!session) {
    res.status(404).json({ error: "Session not found or user mismatch" });
    return;
  }

  if (session.title === "New Chat" || session.title === "New Career Consultation") {
    const autoTitle = message.length > 35 ? message.substring(0, 35) + "..." : message;
    await db.update(chatSessionsTable).set({ title: autoTitle }).where(eq(chatSessionsTable.id, session_id));
  }

  await db.insert(chatMessagesTable).values({
    session_id,
    role: "user",
    message,
  });

  let contextualMessage = message;
  if (resume_text && resume_text.trim().length > 0) {
    contextualMessage += `\n\n---\n[ATTACHED RESUME CONTEXT]:\n${resume_text.trim()}`;
  }
  if (job_description && job_description.trim().length > 0) {
    contextualMessage += `\n\n---\n[TARGET JOB DESCRIPTION CONTEXT]:\n${job_description.trim()}`;
  }

  const geminiHistory = (history ?? []).map((h) => ({
    role: h.role === "assistant" ? ("model" as const) : ("user" as const),
    parts: [{ text: h.message }],
  }));

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("Access-Control-Allow-Origin", "*");
  if (res.flushHeaders) res.flushHeaders();

  let fullResponse = "";

  try {
    const stream = await genai.models.generateContentStream({
      model: "gemini-2.5-flash",
      contents: [
        ...geminiHistory,
        { role: "user", parts: [{ text: contextualMessage }] },
      ],
      config: {
        systemInstruction: CAREER_SYSTEM_PROMPT,
        maxOutputTokens: 8192,
      },
    });

    for await (const chunk of stream) {
      const text = chunk.text;
      if (text) {
        fullResponse += text;
        res.write(`data: ${JSON.stringify({ content: text })}\n\n`);
      }
    }

    await db.insert(chatMessagesTable).values({
      session_id,
      role: "assistant",
      message: fullResponse || "(No output generated)",
    });

    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
  } catch (err: any) {
    req.log?.error({ err }, "Gemini streaming error");
    res.write(`data: ${JSON.stringify({ error: err?.message || "AI generation failed. Please try again." })}\n\n`);
    res.end();
  }
};

router.post("/", sendMessageHandler);
router.post("/message", sendMessageHandler);

export default router;
