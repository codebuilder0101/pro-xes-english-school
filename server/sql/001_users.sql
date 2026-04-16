-- Run this once in Supabase → SQL Editor

create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  password_hash text not null,
  name text,
  newsletter boolean not null default false,
  email_verified boolean not null default false,
  locked boolean not null default false,
  totp_secret text,
  flag text not null default '🇧🇷',
  created_at timestamptz not null default now()
);

create unique index if not exists users_email_lower_idx
  on public.users (lower(email));

alter table public.users enable row level security;
