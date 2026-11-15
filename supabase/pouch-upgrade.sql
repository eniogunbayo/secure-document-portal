-- Pouch upgrade: run AFTER the original setup.sql, in the existing project.
-- Existing files remain untouched. This migration is transactional and rerunnable.
begin;
update storage.buckets set public=false,file_size_limit=5242880,allowed_mime_types=array[
'application/pdf','text/plain','image/png','image/jpeg','image/webp',
'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
'application/vnd.openxmlformats-officedocument.presentationml.presentation','text/csv','application/zip'
] where id='documents';
drop policy if exists "pouch_update_own_folder" on storage.objects;
create policy "pouch_update_own_folder" on storage.objects for update to authenticated
using(bucket_id='documents' and (storage.foldername(name))[1]=(select auth.uid())::text)
with check(bucket_id='documents' and (storage.foldername(name))[1]=(select auth.uid())::text);
drop policy if exists "pouch_delete_own_folder" on storage.objects;
create policy "pouch_delete_own_folder" on storage.objects for delete to authenticated
using(bucket_id='documents' and (storage.foldername(name))[1]=(select auth.uid())::text);
create table if not exists public.pouch_shares (
 id uuid primary key default gen_random_uuid(),
 owner_id uuid not null references auth.users(id) on delete cascade,
 token_hash text not null unique check(token_hash ~ '^[0-9a-f]{64}$'),
 object_path text not null,
 file_name text not null check(length(file_name) between 1 and 140),
 created_at timestamptz not null default now(),
 expires_at timestamptz not null,
 revoked_at timestamptz,
 check(split_part(object_path,'/',1)=owner_id::text),
 check(expires_at>created_at and expires_at<=created_at+interval '30 days')
);
alter table public.pouch_shares enable row level security;
revoke all on public.pouch_shares from anon,authenticated;
grant select,insert on public.pouch_shares to authenticated;
grant update(revoked_at) on public.pouch_shares to authenticated;
grant select on public.pouch_shares to service_role;
drop policy if exists "pouch_share_read_own" on public.pouch_shares;
create policy "pouch_share_read_own" on public.pouch_shares for select to authenticated using(owner_id=(select auth.uid()));
drop policy if exists "pouch_share_create_own" on public.pouch_shares;
create policy "pouch_share_create_own" on public.pouch_shares for insert to authenticated
with check(owner_id=(select auth.uid()) and revoked_at is null and exists(
 select 1 from storage.objects where bucket_id='documents' and name=object_path
));
drop policy if exists "pouch_share_revoke_own" on public.pouch_shares;
create policy "pouch_share_revoke_own" on public.pouch_shares for update to authenticated
using(owner_id=(select auth.uid())) with check(owner_id=(select auth.uid()));
create or replace function public.pouch_share_no_unrevoke() returns trigger
language plpgsql set search_path='' as $$
begin
 if old.revoked_at is not null or new.revoked_at is null then
  raise exception 'A revoked sharing link cannot be reactivated';
 end if;
 return new;
end; $$;
drop trigger if exists pouch_share_no_unrevoke on public.pouch_shares;
create trigger pouch_share_no_unrevoke before update on public.pouch_shares for each row execute function public.pouch_share_no_unrevoke();
commit;
