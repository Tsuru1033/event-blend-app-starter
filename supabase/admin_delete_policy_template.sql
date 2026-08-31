-- YOUR_ADMIN_UIDを、Supabaseの
-- Authentication > Users に表示されるUIDへ置き換えて実行します。

drop policy if exists "only_admin_can_delete_answers"
on public.answers;

create policy "only_admin_can_delete_answers"
on public.answers
for delete
to authenticated
using (
  (select auth.uid()) = 'YOUR_ADMIN_UID'::uuid
);
