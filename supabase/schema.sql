-- CreatorLook: posts table + Storage bucket + RLS + Realtime
-- Run in Supabase SQL Editor, then create public bucket "creator_bucket" in Dashboard.

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  image_url text not null,
  storage_path text,
  title text,
  fans text,
  category text not null check (category in ('kol', 'net_model', 'ai_model', 'inspiration')),
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists posts_category_idx on public.posts(category);
create index if not exists posts_created_at_idx on public.posts(created_at desc);

alter table public.posts enable row level security;

drop policy if exists "posts_select_public" on public.posts;
create policy "posts_select_public" on public.posts
  for select using (true);

drop policy if exists "posts_insert_authenticated" on public.posts;
create policy "posts_insert_authenticated" on public.posts
  for insert with check (auth.role() = 'authenticated');

drop policy if exists "posts_delete_authenticated" on public.posts;
create policy "posts_delete_authenticated" on public.posts
  for delete using (auth.role() = 'authenticated');

-- Storage policies (bucket must exist and be public)
drop policy if exists "creator_bucket_public_read" on storage.objects;
create policy "creator_bucket_public_read" on storage.objects
  for select using (bucket_id = 'creator_bucket');

drop policy if exists "creator_bucket_auth_insert" on storage.objects;
create policy "creator_bucket_auth_insert" on storage.objects
  for insert with check (bucket_id = 'creator_bucket' and auth.role() = 'authenticated');

drop policy if exists "creator_bucket_auth_delete" on storage.objects;
create policy "creator_bucket_auth_delete" on storage.objects
  for delete using (bucket_id = 'creator_bucket' and auth.role() = 'authenticated');

-- Realtime
alter publication supabase_realtime add table public.posts;
