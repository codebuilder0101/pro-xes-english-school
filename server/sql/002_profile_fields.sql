-- Run this once in Supabase → SQL Editor
-- Adds profile-edit fields. All new columns are nullable so existing rows remain valid.

alter table public.users
  add column if not exists full_name      text,
  add column if not exists display_name   text,
  add column if not exists gender         text,
  add column if not exists birthday       date,
  add column if not exists avatar_url     text,
  add column if not exists phone          text,
  add column if not exists english_level  text,
  add column if not exists address        jsonb;

-- gender: fixed set
alter table public.users
  drop constraint if exists users_gender_check;
alter table public.users
  add constraint users_gender_check
  check (gender is null or gender in ('female','male','non_binary','other','prefer_not_to_say'));

-- english_level: CEFR + 'unknown'
alter table public.users
  drop constraint if exists users_english_level_check;
alter table public.users
  add constraint users_english_level_check
  check (english_level is null or english_level in ('A1','A2','B1','B2','C1','C2','unknown'));

-- birthday must be in the past
alter table public.users
  drop constraint if exists users_birthday_check;
alter table public.users
  add constraint users_birthday_check
  check (birthday is null or birthday < current_date);
