create extension if not exists "pgcrypto";

create table if not exists public.members (
  id uuid primary key default gen_random_uuid(),
  membership_id text not null unique,
  name text not null,
  email text not null,
  phone text not null,
  state text not null,
  district text not null,
  instagram text not null,
  photo_url text not null,
  created_at timestamptz not null default now()
);

create index if not exists members_created_at_idx on public.members (created_at desc);
create index if not exists members_state_district_idx on public.members (state, district);

alter table public.members enable row level security;

drop policy if exists "Allow public membership inserts" on public.members;

create table if not exists public.member_submission_rate_limits (
  ip_hash text primary key,
  submitted_at timestamptz not null default now()
);

alter table public.member_submission_rate_limits enable row level security;

create or replace function public.reserve_member_submission(
  p_ip_hash text,
  p_window interval default interval '1 minute'
)
returns table (allowed boolean, retry_after_seconds integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  existing_submitted_at timestamptz;
begin
  insert into public.member_submission_rate_limits (ip_hash, submitted_at)
  values (p_ip_hash, now())
  on conflict (ip_hash) do nothing;

  if found then
    allowed := true;
    retry_after_seconds := 0;
    return next;
    return;
  end if;

  select submitted_at
  into existing_submitted_at
  from public.member_submission_rate_limits
  where ip_hash = p_ip_hash
  for update;

  if existing_submitted_at <= now() - p_window then
    update public.member_submission_rate_limits
    set submitted_at = now()
    where ip_hash = p_ip_hash;

    allowed := true;
    retry_after_seconds := 0;
    return next;
    return;
  end if;

  allowed := false;
  retry_after_seconds := greatest(
    1,
    ceil(extract(epoch from existing_submitted_at + p_window - now()))::integer
  );
  return next;
end;
$$;

revoke all on function public.reserve_member_submission(text, interval) from public;
revoke all on function public.reserve_member_submission(text, interval) from anon;
revoke all on function public.reserve_member_submission(text, interval) from authenticated;
grant execute on function public.reserve_member_submission(text, interval) to service_role;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'member-photos',
  'member-photos',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

-- ── Storage security ────────────────────────────────────────────────────
-- The bucket is public=true, so direct URLs (getPublicUrl) work without
-- any RLS policy.  We intentionally do NOT grant anon INSERT or SELECT:
--   • INSERT is unnecessary — uploads go through the server-side API route
--     which authenticates with service_role (see /api/members/route.ts).
--     Leaving an anon INSERT policy would let bots flood the bucket.
--   • SELECT (listing) is unnecessary — public=true already serves objects
--     by direct URL.  Dropping the policy prevents anonymous enumeration
--     of all stored photos via the Supabase Storage API.
-- If you ever need authenticated uploads from the client, create a scoped
-- policy for the "authenticated" role instead of "anon".

drop policy if exists "Allow public member photo uploads" on storage.objects;
drop policy if exists "Allow public member photo reads" on storage.objects;
