-- Run once in a NEW dedicated Supabase project. Review all existing policies if reusing one.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('documents', 'documents', false, 5242880, array['application/pdf','text/plain']);

create policy "documents_insert_own_folder" on storage.objects for insert to authenticated
with check (bucket_id = 'documents' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "documents_select_own_folder" on storage.objects for select to authenticated
using (bucket_id = 'documents' and (storage.foldername(name))[1] = (select auth.uid())::text);
-- No update or delete policy is granted. No anonymous document access is granted.
-- MIME restrictions enforce the declared content type, not file-content inspection.
