# Supabase設定

1. Supabaseで新規Projectを作成します。
2. SQL Editorで新規Queryを作ります。
3. `supabase/migrations/202608280001_initial_schema.sql`を貼り付けて実行します。
4. Authentication > Usersで集計者を作成します。
5. 集計者のUIDをコピーします。
6. `supabase/admin_delete_policy_template.sql`の`YOUR_ADMIN_UID`をUIDへ置き換えて実行します。
7. Project URLとPublishable keyを確認します。

成功の目印は`Success. No rows returned`です。
