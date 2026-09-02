# Supabase設定

Supabaseは、参加者の回答、今回の参加人数、集計者のログイン情報を保存するサービスです。

このガイドでは、新しいSupabaseプロジェクトを作成し、アプリに必要な保存場所と権限を設定します。

---

## 事前に用意するもの

- GitHubアカウント
- Supabaseアカウント
- 自分専用に作成したGitHubのアプリ保管ページ
- 安全にパスワードを保管できる場所

提供元のSupabaseプロジェクトは共同利用せず、利用者ごとに新しいプロジェクトを作成してください。

---

## 1. Supabaseプロジェクトを作成する

Supabaseの管理画面を開きます。

https://supabase.com/dashboard

次のボタンを押してください。

```text
New project
```

### 入力する主な項目

- Project name：自分で分かりやすい名前
- Database password：自動生成または安全なパスワード
- Region：利用場所に近いリージョン

日本で使用する場合は、東京に近いリージョンを推奨します。

データベースパスワードは、このチャットやGitHubへ載せず、安全な場所へ保存してください。

プロジェクトを作成し、状態が利用可能になるまで待ちます。

---

## 2. 初期設定SQLを開く

GitHubの自分専用アプリ保管ページで、次のファイルを開きます。

```text
supabase/migrations/202608280001_initial_schema.sql
```

コード右上のコピーアイコンを使い、SQL全文をコピーします。

---

## 3. SQL Editorで初期設定を実行する

Supabaseで次の順に進みます。

```text
SQL Editor
→ New query
```

空の入力欄へ、コピーしたSQL全文を貼り付けます。

右上の次のボタンを押してください。

```text
Run
```

RLSに関する警告が表示された場合でも、同梱SQL内でRLSを有効にする設定が入っています。

貼り付けたSQLの内容を確認し、そのまま実行してください。

成功すると、次の表示が出ます。

```text
Success. No rows returned
```

---

## 4. 初期設定SQLで作成されるもの

### answersテーブル

参加者の回答を保存します。

主な情報は次のとおりです。

- 札番号
- ベースの商品番号
- フレーバー1の商品番号と配合量
- フレーバー2の商品番号と配合量
- 回答日時

札番号は一意で、1つの札番号につき回答は1件です。

### event_settingsテーブル

イベントごとの設定を保存します。

主な情報は次のとおりです。

- 今回の参加人数
- 主催者番号
- 更新日時

初期参加人数は30名、最大参加人数も30名です。

実際の参加人数は、アプリの集計者画面から1～30名で変更できます。

### 権限とRLS

初期設定SQLでは、次の権限とデータ保護設定も作成します。

- 参加者による回答の登録
- 参加者による回答の確認
- 参加者による自分の札番号の回答修正
- 集計者による回答一覧の確認
- 集計者による参加人数の変更
- 匿名参加者による参加人数の読み取り
- RLSの有効化

RLSを無効にしないでください。

---

## 5. 集計者ユーザーを作成する

Supabaseで次の順に進みます。

```text
Authentication
→ Users
→ Add user
→ Create new user
```

### 入力する項目

- Email address：集計者が使用するメールアドレス
- User Password：安全なパスワード

次の項目はオンにしてください。

```text
Auto confirm user
```

メールアドレスとパスワードは、安全な場所へ保存してください。

パスワード、メールアドレス、復旧情報をGitHubやAIとのチャットへ載せないでください。

---

## 6. 集計者のUIDをコピーする

ユーザー作成後、Users一覧またはユーザー詳細画面にUIDが表示されます。

UIDは英数字とハイフンで構成された識別子です。

```text
xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

UIDはログインには使用しません。

集計者だけに全回答削除を許可する設定で使用します。

UIDをコピーし、安全な一時メモへ保管してください。

---

## 7. 管理者専用の削除権限を設定する

GitHubで次のファイルを開きます。

```text
supabase/admin_delete_policy_template.sql
```

SQL内の次の文字を探します。

```text
YOUR_ADMIN_UID
```

`YOUR_ADMIN_UID`だけを、先ほどコピーした実際のUIDへ置き換えます。

UID前後のシングルクォーテーションと、末尾の`::uuid`は残してください。

置き換えたSQLをSupabaseのSQL Editorへ貼り付け、実行します。

成功すると、次の表示が出ます。

```text
Success. No rows returned
```

これにより、指定した集計者だけが全回答を削除できます。

---

## 8. 集計者ユーザーを作り直した場合

集計者ユーザーを削除して作り直すと、UIDが変わります。

新しいユーザーを作成した場合は、管理者専用削除ポリシーも新しいUIDへ更新してください。

```text
supabase/admin_delete_policy_template.sql
```

古いUIDのままでは、ログインできても全回答削除に失敗します。

---

## 9. Project URLとPublishable keyを確認する

Vercelへ登録する接続情報をSupabaseから取得します。

Supabase画面上部の次のボタンを押してください。

```text
Connect
```

表示設定は次を選びます。

```text
Framework：React
Variant：Vite
```

次の2項目が表示されます。

```text
VITE_SUPABASE_URL
VITE_SUPABASE_PUBLISHABLE_KEY
```

### Project URL

次の形式です。

```text
https://プロジェクトID.supabase.co
```

### Publishable key

次の文字で始まります。

```text
sb_publishable_...
```

2つの値は、必ず同じSupabaseプロジェクトから取得してください。

別のプロジェクトのURLとキーを組み合わせると、集計者ログイン、回答保存、参加人数の取得が正常に動きません。

---

## 10. 使用してはいけないキー

ブラウザーアプリでは、次のキーを使用しないでください。

- Secret key
- `sb_secret_`で始まるキー
- service_roleキー

これらは高い権限を持つため、GitHub、Vercelのブラウザー用環境変数、AIとのチャット、スクリーンショットへ載せないでください。

使用するのはPublishable keyです。

---

## 11. Supabaseプロジェクトの状態を確認する

Supabaseのプロジェクト一覧で、対象プロジェクトの状態を確認してください。

通常は利用可能な状態になっています。

次の表示がある場合は、完了まで待ちます。

```text
Paused
Project is restoring
Project is coming up
```

- `Paused`：プロジェクトを再開する
- `Project is restoring`：復元完了を待つ
- `Project is coming up`：起動完了を待つ

表示が消えた後も、Authやデータベースが利用可能になるまで数分かかる場合があります。

---

## 12. 設定後の確認

VercelへSupabaseの接続情報を登録し、Productionへ公開した後に確認します。

### 集計者ログイン

- 集計者画面を開ける
- 作成したメールアドレスとパスワードでログインできる
- ログイン後に「イベント設定」が表示される

### 参加人数

- 今回の参加人数を保存できる
- 再読み込み後も人数が維持される
- 全札数と未回答数が設定人数へ変わる

### 回答

- 有効な札番号で回答を保存できる
- 再読み込み後も回答済み状態になる
- 回答を修正できる

### 全回答削除

- 集計者としてログイン中だけ削除できる
- 削除後に回答済み数が0になる

---

## 集計者がログインできない場合

パスワードを作り直す前に、次を確認してください。

1. 操作しているSupabaseプロジェクトが正しい
2. Authenticationに集計者ユーザーが存在する
3. Auto confirm userを有効にした
4. Supabaseプロジェクトが停止していない
5. VercelのProject URLが正しい
6. VercelのPublishable keyが正しい
7. URLとキーが同じSupabaseプロジェクトのもの
8. 環境変数変更後にProductionを再デプロイした

詳しくは次のガイドを確認してください。

```text
docs/08_トラブル対応.md
```

---

## エラーコード42501が表示される場合

`permission denied`または`42501`が表示される場合は、テーブル権限とRLSポリシーの両方を確認します。

初期設定SQLを最後まで実行したか確認してください。

```text
supabase/migrations/202608280001_initial_schema.sql
```

`GRANT`とRLSは別々の設定です。RLSを無効にして解決しないでください。

---

## パスワード再設定メールのリンクが開けない場合

SupabaseのAuthentication設定で、Site URLとRedirect URLsを確認してください。

VercelのProduction固定URLを登録します。

```text
https://アプリ名.vercel.app/
```

急ぎの場合は集計者ユーザーを作り直せますが、UIDが変わるため、管理者専用削除ポリシーも更新してください。

---

## Supabase設定の完了チェック

- [ ] 自分専用のSupabaseプロジェクトを作成した
- [ ] データベースパスワードを安全に保存した
- [ ] 初期設定SQLを実行した
- [ ] `answers`テーブルが作成された
- [ ] `event_settings`テーブルが作成された
- [ ] RLSが有効になっている
- [ ] 集計者ユーザーを作成した
- [ ] Auto confirm userを有効にした
- [ ] 集計者UIDを使って削除ポリシーを設定した
- [ ] Project URLを確認した
- [ ] Publishable keyを確認した
- [ ] Secret keyやservice_roleキーを使用していない
- [ ] Supabaseプロジェクトが利用可能な状態になっている
- [ ] Vercelへ同じプロジェクトのURLとキーを登録した
- [ ] 集計者ログインを確認した
- [ ] 参加人数の保存を確認した
- [ ] 回答保存を確認した
- [ ] 全回答削除を確認した

すべて確認できたら、Supabaseの設定は完了です。
