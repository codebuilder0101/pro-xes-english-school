import { Pool } from "pg";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("Missing DATABASE_URL in environment. Check server/.env");
}

export const pool = new Pool({ connectionString });

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
  full_name: string | null;
  display_name: string | null;
  gender: string | null;
  birthday: string | null;
  avatar_url: string | null;
  phone: string | null;
  english_level: string | null;
  address: string | null;
  language: string | null;
};
