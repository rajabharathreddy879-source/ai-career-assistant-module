import { Router, type IRouter } from "express";
import { db, profilesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { hashPassword, verifyPassword } from "../lib/password";
import { randomUUID } from "crypto";

const router: IRouter = Router();

// POST /api/auth/register — Custom registration with password hashing
router.post("/auth/register", async (req, res): Promise<void> => {
  const { email, password, full_name } = req.body || {};

  if (!email || typeof email !== "string" || !email.includes("@")) {
    res.status(400).json({ error: "Please enter a valid email address." });
    return;
  }
  if (!password || typeof password !== "string" || password.length < 6) {
    res.status(400).json({ error: "Password must be at least 6 characters long." });
    return;
  }

  const cleanEmail = email.trim().toLowerCase();

  try {
    const existing = await db
      .select()
      .from(profilesTable)
      .where(eq(profilesTable.email, cleanEmail));

    if (existing.length > 0) {
      res.status(400).json({ error: "An account with this email already exists." });
      return;
    }

    const userId = randomUUID();
    const password_hash = hashPassword(password);

    const [profile] = await db
      .insert(profilesTable)
      .values({
        id: userId,
        email: cleanEmail,
        full_name: full_name?.trim() || null,
        password_hash,
      })
      .returning();

    const userObj = {
      id: profile.id,
      email: profile.email,
      full_name: profile.full_name,
      created_at: profile.created_at.toISOString(),
    };

    res.status(201).json({
      user: userObj,
      token: `custom_token_${profile.id}`,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to register account" });
  }
});

// POST /api/auth/login — Custom login with password hash verification
router.post("/auth/login", async (req, res): Promise<void> => {
  const { email, password } = req.body || {};

  if (!email || !password) {
    res.status(400).json({ error: "Email and password are required." });
    return;
  }

  const cleanEmail = email.trim().toLowerCase();

  try {
    const [profile] = await db
      .select()
      .from(profilesTable)
      .where(eq(profilesTable.email, cleanEmail));

    if (!profile || !profile.password_hash) {
      res.status(401).json({ error: "Invalid email or password." });
      return;
    }

    const isValid = verifyPassword(password, profile.password_hash);
    if (!isValid) {
      res.status(401).json({ error: "Invalid email or password." });
      return;
    }

    const userObj = {
      id: profile.id,
      email: profile.email,
      full_name: profile.full_name,
      created_at: profile.created_at.toISOString(),
    };

    res.json({
      user: userObj,
      token: `custom_token_${profile.id}`,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to log in" });
  }
});

// GET /api/auth/me — Fetch current authenticated profile
router.get("/auth/me", async (req, res): Promise<void> => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer custom_token_")) {
    res.status(401).json({ error: "Unauthenticated" });
    return;
  }

  const userId = authHeader.replace("Bearer custom_token_", "");

  try {
    const [profile] = await db
      .select()
      .from(profilesTable)
      .where(eq(profilesTable.id, userId));

    if (!profile) {
      res.status(401).json({ error: "User profile not found" });
      return;
    }

    res.json({
      user: {
        id: profile.id,
        email: profile.email,
        full_name: profile.full_name,
        created_at: profile.created_at.toISOString(),
      },
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch user profile" });
  }
});

// POST /api/auth/sync — Sync user profile
router.post("/auth/sync", async (req, res): Promise<void> => {
  const { id, email, full_name } = req.body || {};
  if (!id || !email) {
    res.status(400).json({ error: "Missing id or email" });
    return;
  }

  try {
    const existing = await db
      .select()
      .from(profilesTable)
      .where(eq(profilesTable.id, id));

    if (existing.length > 0) {
      res.json({ id, email, full_name });
      return;
    }

    const [profile] = await db
      .insert(profilesTable)
      .values({ id, email, full_name, password_hash: "external_oauth" })
      .returning();

    res.json({ id: profile.id, email: profile.email, full_name: profile.full_name });
  } catch (err) {
    res.status(500).json({ error: "Failed to sync user" });
  }
});

export default router;
