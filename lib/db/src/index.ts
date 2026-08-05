import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";

const { Pool } = pg;

const dbUrl = process.env.DATABASE_URL || process.env.SUPABASE_DB_URL || "";

if (!dbUrl) {
  console.warn("DATABASE_URL / SUPABASE_DB_URL is not set — database features will run in fallback mode.");
}

export const pool = new Pool({
  connectionString: dbUrl || "postgresql://postgres:postgres@localhost:5432/postgres",
  ssl: dbUrl.includes("supabase.co") || process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
});

export const db = drizzle(pool, { schema });

export * from "./schema";
