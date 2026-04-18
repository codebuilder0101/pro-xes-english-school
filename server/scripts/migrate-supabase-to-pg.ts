// One-shot data migration: Supabase → local Postgres.
// Reads every row from Supabase's `users` table and upserts into local DB.
// Usage: tsx scripts/migrate-supabase-to-pg.ts

import "dotenv/config";
import { createClient } from "@supabase/supabase-js";
import { Pool } from "pg";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false, autoRefreshToken: false } },
);

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const COLS = [
  "id", "email", "password_hash", "name", "newsletter", "email_verified",
  "locked", "totp_secret", "flag", "created_at", "full_name", "display_name",
  "gender", "birthday", "avatar_url", "phone", "english_level", "address",
  "language",
] as const;

async function main() {
  const { data, error } = await supabase.from("users").select("*");
  if (error) throw error;
  console.log(`Found ${data.length} rows in Supabase.`);

  let inserted = 0;
  for (const row of data) {
    const values = COLS.map((c) => (row as Record<string, unknown>)[c] ?? null);
    const placeholders = COLS.map((_, i) => `$${i + 1}`).join(", ");
    const updateSet = COLS
      .filter((c) => c !== "id")
      .map((c) => `${c} = EXCLUDED.${c}`)
      .join(", ");
    await pool.query(
      `INSERT INTO users (${COLS.join(", ")}) VALUES (${placeholders})
       ON CONFLICT (id) DO UPDATE SET ${updateSet}`,
      values,
    );
    inserted += 1;
  }

  const { rows } = await pool.query("SELECT count(*)::int AS n FROM users");
  console.log(`Upserted ${inserted} rows. Local DB now has ${rows[0].n} users.`);
  await pool.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
