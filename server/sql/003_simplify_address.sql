-- Run this once in Supabase → SQL Editor.
-- Replaces the structured jsonb address column with a single free-text address.
-- Existing jsonb data (if any) is dropped; the app now stores a plain string.

alter table public.users drop column if exists address;
alter table public.users add column if not exists address text;
