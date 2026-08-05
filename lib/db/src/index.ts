import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";

const { Pool } = pg;

const defaultSupabaseUrl = "postgresql://postgres:raja1234%23%231234@db.jbzdnnartmkthrddzcbt.supabase.co:5432/postgres";
const dbUrl = process.env.DATABASE_URL || process.env.SUPABASE_DB_URL || defaultSupabaseUrl;

export const pool = new Pool({
  connectionString: dbUrl,
  ssl: { rejectUnauthorized: false },
});

export const db = drizzle(pool, { schema });

export * from "./schema";
