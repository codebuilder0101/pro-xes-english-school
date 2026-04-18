-- Run this once in Supabase → SQL Editor.
-- Adds a per-user interface language preference. Default is Portuguese (Brazil).

alter table public.users
  add column if not exists language text default 'pt';

alter table public.users
  drop constraint if exists users_language_check;
alter table public.users
  add constraint users_language_check
  check (language is null or language in ('pt','en'));
