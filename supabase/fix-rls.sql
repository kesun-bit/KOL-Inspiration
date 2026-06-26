-- Run in Supabase SQL Editor if inserts/uploads still fail after Supabase Auth login.
-- Ensures authenticated users can insert posts and upload to creator_bucket.

alter table public.posts enable row level security;

drop policy if exists "posts_insert_authenticated" on public.posts;
create policy "posts_insert_authenticated" on public.posts
  for insert to authenticated
  with check (auth.uid() = created_by);

drop policy if exists "creator_bucket_auth_insert" on storage.objects;
create policy "creator_bucket_auth_insert" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'creator_bucket');
