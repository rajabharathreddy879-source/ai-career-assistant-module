import { Request, Response, NextFunction } from "express";
import { createClient } from "@supabase/supabase-js";
import { logger } from "../lib/logger";

const supabaseUrl = process.env["SUPABASE_URL"] ?? process.env["VITE_SUPABASE_URL"] ?? "";
const supabaseServiceKey = process.env["SUPABASE_SERVICE_ROLE_KEY"] ?? "";

let supabaseAdmin: ReturnType<typeof createClient> | null = null;

if (supabaseUrl && supabaseServiceKey) {
  supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
  logger.info("Supabase admin client initialized for JWT verification");
} else {
  logger.warn(
    "SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set — JWT auth middleware will pass through (dev mode)",
  );
}

export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  // If Supabase not configured, pass through in dev mode
  if (!supabaseAdmin) {
    next();
    return;
  }

  const authHeader = req.headers["authorization"];

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ error: "Missing or invalid authorization header" });
    return;
  }

  const token = authHeader.substring(7);

  try {
    const {
      data: { user },
      error,
    } = await supabaseAdmin.auth.getUser(token);

    if (error || !user) {
      res.status(401).json({ error: "Invalid or expired token" });
      return;
    }

    // Attach user to request for downstream handlers
    (req as Request & { user: typeof user }).user = user;
    next();
  } catch (err) {
    req.log.error({ err }, "Auth middleware error");
    res.status(401).json({ error: "Authentication failed" });
  }
}
