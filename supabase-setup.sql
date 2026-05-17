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

-- ═══════════════════════════════════════════════════════
-- Promo / Referral Tracking
-- ═══════════════════════════════════════════════════════

-- Ensure FK target column exists on applications first
alter table public.applications add column if not exists code text;

-- Optional FK constraint (runs after column exists)
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'applications_code_fkey') then
    alter table public.applications add constraint applications_code_fkey foreign key (code) references public.promo(code) on delete set null;
  end if;
end $$;

create table if not exists public.promo (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text,
  total_clients integer not null default 0,
  confirmed_clients integer not null default 0,
  money integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.promo add column if not exists name text;
alter table public.promo add column if not exists confirmed_clients integer not null default 0;
alter table public.promo add column if not exists money integer not null default 0;

alter table public.promo enable row level security;

drop policy if exists "Allow public promo reads" on public.promo;
create policy "Allow public promo reads"
on public.promo
for select
to anon
using (true);

create or replace function increment_promo_clients(promo_code text)
returns integer
language plpgsql
security definer
as $$
declare
  new_count integer;
begin
  update public.promo
  set total_clients = total_clients + 1
  where code = promo_code
  returning total_clients into new_count;

  return coalesce(new_count, 0);
end;
$$;

grant execute on function increment_promo_clients(text) to anon;
grant execute on function increment_promo_clients(text) to authenticated;