import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  throw new Error(
    "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment. Check server/.env",
  );
}

export const supabase = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

export type UserRow = {
  id: string;
  email: string;
  password_hash: string;
  name: string | null;
  newsletter: boolean;
  email_verified: boolean;
  locked: boolean;
  totp_secret: string | null;
  flag: string;
  created_at: string;
};
