-- Run this in Supabase SQL Editor if form inserts or file uploads are blocked by RLS.
-- It allows anonymous visitors to submit application rows and upload documents
-- into the private "applications" storage bucket. It does not allow public reads.

create extension if not exists pgcrypto;

create table if not exists public.applications (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  pack text not null,
  full_name text not null,
  email text not null,
  whatsapp text not null,
  bank text not null,
  language_level text not null,
  field text not null,
  documents text[] not null default '{}'
);

alter table public.applications add column if not exists pack text;
alter table public.applications add column if not exists full_name text;
alter table public.applications add column if not exists email text;
alter table public.applications add column if not exists whatsapp text;
alter table public.applications add column if not exists bank text;
alter table public.applications add column if not exists language_level text;
alter table public.applications add column if not exists field text;
alter table public.applications add column if not exists documents text[] not null default '{}';

alter table public.applications enable row level security;

drop policy if exists "Allow public application inserts" on public.applications;
create policy "Allow public application inserts"
on public.applications
for insert
to anon
with check (true);

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'applications',
  'applications',
  false,
  10485760,
  array[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/png'
  ]
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Allow public application document uploads" on storage.objects;
create policy "Allow public application document uploads"
on storage.objects
for insert
to anon
with check (bucket_id = 'applications');
